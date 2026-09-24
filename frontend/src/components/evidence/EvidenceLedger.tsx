import React from 'react';
import { Link2, ShieldCheck } from 'lucide-react';

export const EvidenceLedger: React.FC = () => {
  const entries = [
    { entry: "001", id: "EV-2026-000101", hash: "a4f8b912c3d4e5f678901234567890abcdef1234567890abcdef123456789012", uploader: "MP Office", time: "2026-08-10 10:00 IST" },
    { entry: "002", id: "EV-2026-000115", hash: "b7e6d5c4b3a291827364554637281900112233445566778899aabbccddeeff00", uploader: "District Collector", time: "2026-08-15 11:30 IST" },
    { entry: "003", id: "EV-2026-000142", hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", uploader: "PWD Agency", time: "2026-09-18 14:30 IST" },
  ];

  return (
    <div className="gov-card p-5">
      <div className="pb-3 border-b border-govBorder mb-4">
        <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primaryBlue" />
          Tamper-Evident Evidence Ledger
        </h3>
        <p className="text-[11px] text-textSecondary">
          Cryptographic hashes help detect unexpected changes to recorded evidence.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((item, idx) => (
          <div key={idx} className="relative pl-6 pb-2 border-l-2 border-primaryBlue/40 last:border-l-0">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primaryBlue text-white flex items-center justify-center text-[9px] font-bold">
              {item.entry}
            </div>
            <div className="p-3 bg-govBg rounded border border-govBorder text-xs">
              <div className="flex justify-between font-semibold text-govNavy mb-1">
                <span>Entry #{item.entry} — {item.id}</span>
                <span className="text-emerald-700 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Hash Verified</span>
              </div>
              <div className="font-mono text-[10px] text-textSecondary bg-white p-1 rounded border border-govBorder break-all">
                SHA-256: {item.hash}
              </div>
              <div className="mt-2 text-[10px] text-textSecondary flex justify-between">
                <span>Recorded By: {item.uploader}</span>
                <span>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
