import React from 'react';
import { AuditLog } from '../types';
import { formatDateTime, formatName } from '../utils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Settings, 
  MessageSquare,
  User,
  Monitor
} from 'lucide-react';

interface AuditLogEntryProps {
  auditLog: AuditLog;
  user?: { firstName: string; lastName: string };
}

export const AuditLogEntry: React.FC<AuditLogEntryProps> = ({ 
  auditLog, 
  user 
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'override':
        return <Settings className="w-4 h-4 text-purple-600" />;
      case 'communicate':
        return <MessageSquare className="w-4 h-4 text-cyan-600" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'update':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'approve':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'override':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'communicate':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const formatActionDescription = () => {
    const entityType = auditLog.entityType.replace('_', ' ');
    const action = auditLog.action;
    
    switch (action) {
      case 'create':
        return `Created ${entityType}`;
      case 'update':
        return `Updated ${entityType}`;
      case 'delete':
        return `Deleted ${entityType}`;
      case 'approve':
        return `Approved ${entityType}`;
      case 'override':
        return `Applied override to ${entityType}`;
      case 'communicate':
        return `Sent communication`;
      default:
        return `${action} ${entityType}`;
    }
  };

  const renderValueChanges = () => {
    if (!auditLog.oldValues && !auditLog.newValues) return null;

    return (
      <div className="mt-2 space-y-1">
        {auditLog.oldValues && Object.entries(auditLog.oldValues).map(([key, value]) => (
          <div key={`old-${key}`} className="text-xs text-slate-500">
            <span className="font-medium">{key}:</span> 
            <span className="line-through ml-1">{String(value)}</span>
          </div>
        ))}
        {auditLog.newValues && Object.entries(auditLog.newValues).map(([key, value]) => (
          <div key={`new-${key}`} className="text-xs text-slate-600">
            <span className="font-medium">{key}:</span> 
            <span className="ml-1">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex space-x-3 py-3">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center
        ${getActionColor(auditLog.action)}
      `}>
        {getActionIcon(auditLog.action)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-slate-900">
              {formatActionDescription()}
            </p>
            {user && (
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <User className="w-3 h-3" />
                <span>{formatName(user.firstName, user.lastName)}</span>
              </div>
            )}
          </div>
          <time className="text-xs text-slate-500">
            {formatDateTime(auditLog.createdAt)}
          </time>
        </div>

        {/* Reason */}
        {auditLog.reason && (
          <p className="mt-1 text-sm text-slate-600">{auditLog.reason}</p>
        )}

        {/* Value Changes */}
        {renderValueChanges()}

        {/* Technical Details */}
        {(auditLog.ipAddress || auditLog.userAgent) && (
          <details className="mt-2">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
              Technical Details
            </summary>
            <div className="mt-1 text-xs text-slate-500 space-y-1">
              {auditLog.ipAddress && (
                <div>IP: {auditLog.ipAddress}</div>
              )}
              {auditLog.userAgent && (
                <div>User Agent: {auditLog.userAgent}</div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};