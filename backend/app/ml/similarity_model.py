import math
from typing import List, Dict, Any

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

class DuplicateSimilarityEngine:
    """
    Computes text similarity + geospatial proximity to identify "Potentially Similar Projects".
    NEVER labels projects as "Fraudulent Duplicate".
    """

    @staticmethod
    def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Returns distance in kilometers between two lat/lon pairs."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    def find_similar_projects(cls, target_project: Dict[str, Any], candidate_projects: List[Dict[str, Any]], threshold: float = 0.50) -> List[Dict[str, Any]]:
        matches = []
        if not candidate_projects:
            return matches

        target_words = set((target_project.get('work_name', '') + ' ' + target_project.get('sector', '')).lower().split())

        for candidate in candidate_projects:
            if candidate.get("id") == target_project.get("id"):
                continue

            cand_words = set((candidate.get('work_name', '') + ' ' + candidate.get('sector', '')).lower().split())
            intersection = target_words.intersection(cand_words)
            union = target_words.union(cand_words)
            text_sim = len(intersection) / len(union) if union else 0.0

            dist_km = None
            geo_sim = 0.0
            target_lat = target_project.get("latitude")
            target_lon = target_project.get("longitude")
            cand_lat = candidate.get("latitude")
            cand_lon = candidate.get("longitude")

            if target_lat is not None and target_lon is not None and cand_lat is not None and cand_lon is not None:
                dist_km = cls.calculate_haversine_distance(target_lat, target_lon, cand_lat, cand_lon)
                geo_sim = max(0.0, 1.0 - (dist_km / 5.0))

            combined_sim = round((0.7 * text_sim) + (0.3 * geo_sim), 4)

            if combined_sim >= threshold:
                matches.append({
                    "matched_project_id": candidate.get("id"),
                    "matched_project_code": candidate.get("project_code"),
                    "matched_work_name": candidate.get("work_name"),
                    "text_similarity": round(text_sim, 4),
                    "geo_distance_km": round(dist_km, 2) if dist_km is not None else None,
                    "combined_similarity": combined_sim,
                    "label": "Potentially Similar Project",
                    "reason": f"High lexical similarity ({int(text_sim*100)}%)" + (f" and proximity ({round(dist_km,2)}km)" if dist_km else "")
                })

        return sorted(matches, key=lambda x: x["combined_similarity"], reverse=True)
