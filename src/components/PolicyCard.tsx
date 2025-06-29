import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/Badge';
import { Account } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Building2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

interface PolicyCardProps {
  account: Account;
  carrier?: { name: string; code: string };
  onClick?: () => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ 
  account, 
  carrier,
  onClick 
}) => {
  const hasOutstandingLoans = (account.outstandingLoans || 0) > 0;
  const surrenderValue = account.surrenderValue || 0;
  const currentValue = account.currentValue || 0;

  return (
    <Card 
      hover={!!onClick} 
      className={`cursor-pointer transition-all duration-200 ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">
                {carrier?.name || 'Unknown Carrier'}
              </span>
              {carrier?.code && (
                <Badge variant="default" size="sm">
                  {carrier.code}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {account.accountNumber}
            </h3>
            {account.productName && (
              <p className="text-sm text-slate-600">{account.productName}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={account.status} />
            <Badge 
              variant={account.isSourceAccount ? 'info' : 'purple'} 
              size="sm"
            >
              {account.isSourceAccount ? 'Source' : 'Target'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Current Value */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Current Value</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {currentValue > 0 ? formatCurrency(currentValue) : 'N/A'}
            </p>
          </div>

          {/* Surrender Value */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Surrender Value</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {surrenderValue > 0 ? formatCurrency(surrenderValue) : 'N/A'}
            </p>
          </div>

          {/* Issue Date */}
          {account.issueDate && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Issue Date</span>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {formatDate(account.issueDate)}
              </p>
            </div>
          )}

          {/* Outstanding Loans */}
          {hasOutstandingLoans && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">Outstanding Loans</span>
              </div>
              <p className="text-sm font-semibold text-amber-700">
                {formatCurrency(account.outstandingLoans!)}
              </p>
            </div>
          )}
        </div>

        {/* Validation Notes */}
        {account.validationNotes && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{account.validationNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};