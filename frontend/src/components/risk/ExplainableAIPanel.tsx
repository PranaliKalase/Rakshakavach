import React from 'react';
import { HelpCircle, Eye, CheckCircle2 } from 'lucide-react';

interface AnomalyFinding {
  reasonCode?: string;
  reason_code?: string;
  severity: string;
  explanation: string;
  recommendedAction?: string;
  recommended_action?: string;
}

interface ExplainableAIPanelProps {
  findings?: AnomalyFinding[];
  explanationBullets?: string[];
  recommendedAction?: string;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({
  findings = [],
  explanationBullets,
  recommendedAction
}) => {
  const hasBullets = explanationBullets && explanationBullets.length > 0;
  const list = findings;

  if (list.length === 0 && !hasBullets) {
    return (
      <div className="gov-card p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-govBorder mb-3">
          <HelpCircle className="w-5 h-5 text-primaryBlue flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-govNavy">AI Explanation & Verification Context</h3>
            <p className="text-[11px] text-textSecondary">Multi-factor anomaly engine evaluation.</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5">Normal Execution Pattern</strong>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              No anomaly findings or progress discrepancies detected. Financial expenditure aligns with physical completion benchmarks and peer records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gov-card p-5">
      <div className="flex items-center gap-2 pb-3 border-b border-govBorder mb-4">
        <HelpCircle className="w-5 h-5 text-primaryBlue flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-govNavy">Why does this project require attention?</h3>
          <p className="text-[11px] text-textSecondary">
            Structured AI analysis identified {list.length} key factor{list.length !== 1 ? 's' : ''} requiring verification.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {hasBullets ? (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-xs space-y-2">
            <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">
              AI Explanation Summary:
            </span>
            <ul className="list-disc list-inside space-y-1 text-textPrimary">
              {explanationBullets.map((bullet, idx) => (
                <li key={idx} className="leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {list.map((item, idx) => {
          const code = item.reason_code || item.reasonCode || "SIGNAL_DETECTED";
          const action = item.recommended_action || item.recommendedAction || recommendedAction || "Conduct field verification.";

          return (
            <div key={idx} className="p-4 bg-red-50/40 border border-red-200 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-statusRed uppercase tracking-wider">
                  {code.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                  {(item.severity || 'HIGH_PRIORITY').replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs font-medium text-textPrimary mt-1">{item.explanation}</p>
              
              <div className="mt-3 pt-2 border-t border-red-200/60 flex items-center justify-between text-[11px]">
                <span className="text-textSecondary font-medium">
                  Recommended Action: <strong className="text-govNavy">{action}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

