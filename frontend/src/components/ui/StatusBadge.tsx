import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Info } from 'lucide-react';
import { ProjectStatus, VerificationPriority } from '@/types/project';

interface StatusBadgeProps {
  status?: ProjectStatus;
  priority?: VerificationPriority;
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority, text }) => {
  if (priority) {
    switch (priority) {
      case 'HIGH_PRIORITY':
        return (
          <span className="gov-badge bg-red-100 text-statusRed border border-red-200">
            <AlertCircle className="w-3 h-3" />
            {text || 'High Verification Priority'}
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="gov-badge bg-amber-100 text-statusAmber border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            {text || 'Attention Required'}
          </span>
        );
      default:
        return (
          <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {text || 'Normal'}
          </span>
        );
    }
  }

  switch (status) {
    case 'RECOMMENDED':
      return (
        <span className="gov-badge bg-blue-100 text-statusBlue border border-blue-200">
          <Info className="w-3 h-3" />
          Recommended
        </span>
      );
    case 'SANCTIONED':
    case 'ASSIGNED':
      return (
        <span className="gov-badge bg-emerald-100 text-statusGreen border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="gov-badge bg-sky-100 text-sky-800 border border-sky-200">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    case 'VERIFICATION_PENDING':
      return (
        <span className="gov-badge bg-amber-100 text-statusAmber border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          Verification Pending
        </span>
      );
    case 'REJECTED':
      return (
        <span className="gov-badge bg-red-100 text-statusRed border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="gov-badge bg-gray-100 text-gray-700 border border-gray-200">
          {status || 'Unknown'}
        </span>
      );
  }
};
