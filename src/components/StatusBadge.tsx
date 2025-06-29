import React from 'react';
import { Badge } from './ui/Badge';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { 
  DropTicketStatus, 
  AccountStatus, 
  Priority, 
  CommunicationStatus 
} from '../types/Common';

interface StatusBadgeProps {
  status: DropTicketStatus | AccountStatus | Priority | CommunicationStatus | string;
  type?: 'status' | 'priority' | 'communication';
  glow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'status',
  glow = false,
  size = 'md'
}) => {
  const getVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' => {
    const colorMap = STATUS_COLORS[status];
    
    switch (colorMap) {
      case 'green':
      case 'emerald':
        return 'success';
      case 'yellow':
      case 'orange':
        return 'warning';
      case 'red':
        return 'error';
      case 'blue':
        return 'info';
      case 'purple':
        return 'purple';
      default:
        return 'default';
    }
  };

  const label = STATUS_LABELS[status] || status;
  const variant = getVariant(status);

  return (
    <Badge 
      variant={variant} 
      size={size}
      glow={glow}
    >
      {label}
    </Badge>
  );
};