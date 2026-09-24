import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

try:
    import pandas as pd
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    import joblib
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

class IsolationForestAnomalyDetector:
    """
    Unsupervised Isolation Forest model for detecting statistical outlier projects.
    Trains on numerical feature vectors and outputs non-hardcoded anomaly decision scores.
    """

    MODEL_DIR = Path(__file__).parent / "saved_models"
    MODEL_PATH = MODEL_DIR / "isolation_forest_model.joblib"
    SCALER_PATH = MODEL_DIR / "feature_scaler.joblib"

    FEATURE_KEYS = [
        "financial_progress",
        "physical_progress",
        "progress_gap_pct",
        "sanctioned_amount",
        "actual_expenditure",
        "utilization_pct",
        "cost_variance_pct",
        "payment_concentration",
        "peer_cost_ratio",
        "gps_available"
    ]

    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.model: Optional[Any] = None
        self.scaler: Optional[Any] = None
        self.is_trained = False
        self.model_version = "v2.0.0-ml"
        self.feature_version = "v2.0.0"

        self._ensure_model_dir()
        self._load_persisted_model()

    def _ensure_model_dir(self):
        os.makedirs(self.MODEL_DIR, exist_ok=True)

    def _extract_feature_vector(self, project: Dict[str, Any]) -> List[float]:
        feats = project.get("ai_features", {})
        
        financial_prog = float(project.get("financialProgress", project.get("financial_progress", feats.get("financial_progress", 0.0))))
        physical_prog = float(project.get("physicalProgress", project.get("physical_progress", feats.get("physical_progress", 0.0))))
        sanctioned_amt = float(project.get("sanctionedCost", project.get("sanctioned_cost", feats.get("sanctioned_amount", 0.0))))
        actual_exp = float(project.get("actualExpenditure", project.get("actual_expenditure", feats.get("actual_expenditure", 0.0))))
        
        progress_gap = feats.get("progress_gap_pct", financial_prog - physical_prog)
        utilization = feats.get("utilization_pct", (actual_exp / sanctioned_amt * 100) if sanctioned_amt > 0 else 0.0)
        cost_variance = feats.get("cost_variance_pct", ((actual_exp - sanctioned_amt) / sanctioned_amt * 100) if sanctioned_amt > 0 else 0.0)
        payment_conc = feats.get("payment_concentration", 0.5)
        peer_ratio = feats.get("peer_cost_ratio", 1.0)
        gps_avail = 1.0 if feats.get("gps_available", True) else 0.0

        return [
            financial_prog,
            physical_prog,
            progress_gap,
            sanctioned_amt,
            actual_exp,
            utilization,
            cost_variance,
            payment_conc,
            peer_ratio,
            gps_avail
        ]

    def fit(self, projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Trains Isolation Forest on the population feature matrix."""
        if not HAS_SKLEARN or not projects:
            return {"status": "FAILED", "reason": "scikit-learn missing or empty dataset"}

        X_raw = np.array([self._extract_feature_vector(p) for p in projects])

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_raw)

        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        self.model.fit(X_scaled)
        self.is_trained = True

        # Persist model and scaler
        joblib.dump(self.model, self.MODEL_PATH)
        joblib.dump(self.scaler, self.SCALER_PATH)

        return {
            "status": "TRAINED",
            "samples_trained": len(projects),
            "model_version": self.model_version
        }

    def _load_persisted_model(self):
        if HAS_SKLEARN and self.MODEL_PATH.exists() and self.SCALER_PATH.exists():
            try:
                self.model = joblib.load(self.MODEL_PATH)
                self.scaler = joblib.load(self.SCALER_PATH)
                self.is_trained = True
            except Exception:
                self.is_trained = False

    def predict_anomaly(self, project: Dict[str, Any]) -> Dict[str, Any]:
        if not HAS_SKLEARN or not self.is_trained or self.model is None:
            return {
                "status": "UNAVAILABLE",
                "message": "AI anomaly model not trained yet. Call fit() first.",
                "anomaly_score": None,
                "is_outlier": False,
                "model_version": self.model_version
            }

        x_vec = np.array([self._extract_feature_vector(project)])
        x_scaled = self.scaler.transform(x_vec)

        # decision_function returns negative values for outliers, positive for inliers
        raw_decision_score = float(self.model.decision_function(x_scaled)[0])
        prediction = int(self.model.predict(x_scaled)[0]) # -1 for outlier, 1 for normal

        is_outlier = (prediction == -1)

        # Normalize score to [0.0, 1.0] where 1.0 is highly anomalous
        # decision_score typically ranges from -0.5 to +0.5
        normalized_score = round(max(0.0, min(1.0, 0.5 - raw_decision_score)), 4)

        return {
            "status": "HEALTHY",
            "anomaly_score": normalized_score,
            "raw_decision_score": round(raw_decision_score, 4),
            "is_outlier": is_outlier,
            "ml_anomaly_label": "ANOMALOUS" if is_outlier else "NORMAL",
            "model_version": self.model_version,
            "feature_version": self.feature_version
        }
