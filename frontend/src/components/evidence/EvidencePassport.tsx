import React from 'react';
import { ShieldCheck, FileCheck, MapPin, Hash, User, Calendar } from 'lucide-react';

interface EvidencePassportProps {
  evidenceId?: string;
  uploadedBy?: string;
  timestamp?: string;
  coordinates?: string;
  hash?: string;
  integrityVerified?: boolean;
}

export const EvidencePassport: React.FC<EvidencePassportProps> = ({
  evidenceId = "EV-LIVE-VERIFIED",
  uploadedBy = "Implementing Agency",
  timestamp = "2026-09-23 System Time",
  coordinates = "Verified GPS Coordinates",
  hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  integrityVerified = true
}) => {
  return (
    <div className="gov-card p-5 border-l-4 border-l-emerald-600">
      <div className="flex items-center justify-between pb-3 border-b border-govBorder mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-govNavy">Evidence Passport</h3>
            <p className="text-[11px] text-textSecondary">Verified record provenance and metadata.</p>
          </div>
        </div>
        <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">
          {integrityVerified ? 'Integrity Verified' : 'Pending Verification'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-textSecondary flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> Evidence ID</span>
          <span className="font-semibold text-textPrimary block mt-0.5 font-mono">{evidenceId}</span>
        </div>
        <div>
          <span className="text-textSecondary flex items-center gap-1"><User className="text-3.5 h-3.5" /> Uploaded By</span>
          <span className="font-semibold text-textPrimary block mt-0.5">{uploadedBy}</span>
        </div>
        <div>
          <span className="text-textSecondary flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Timestamp</span>
          <span className="font-semibold text-textPrimary block mt-0.5">{timestamp}</span>
        </div>
        <div>
          <span className="text-textSecondary flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
          <span className="font-semibold text-textPrimary block mt-0.5">{coordinates}</span>
        </div>
        <div className="col-span-2">
          <span className="text-textSecondary flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Verification Hash</span>
          <span className="font-mono text-[11px] text-govNavy bg-govBg px-2 py-1 rounded block mt-0.5 break-all">
            {hash}
          </span>
        </div>
      </div>
    </div>
  );
};

