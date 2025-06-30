import React from 'react';
import { Badge } from './ui/Badge';
import { useRealtime } from '../contexts/RealtimeContext';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';

interface RealtimeIndicatorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const { isConnected, connectionState, reconnect } = useRealtime();

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          label: 'Live',
          variant: 'success' as const,
          pulse: true
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          label: 'Connecting',
          variant: 'warning' as const,
          pulse: false
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Error',
          variant: 'error' as const,
          pulse: false
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          label: 'Offline',
          variant: 'default' as const,
          pulse: false
        };
    }
  };

  const { icon, label, variant, pulse } = getStatusConfig();

  if (!showLabel) {
    return (
      <div className={`relative ${className}`}>
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
          ${variant === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
          ${variant === 'warning' ? 'bg-amber-100 text-amber-600' : ''}
          ${variant === 'error' ? 'bg-red-100 text-red-600' : ''}
          ${variant === 'default' ? 'bg-slate-100 text-slate-600' : ''}
        `}>
          {icon}
        </div>
        {pulse && (
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={variant} size={size} glow={pulse}>
        <div className="flex items-center space-x-1">
          {icon}
          <span>{label}</span>
        </div>
      </Badge>
      
      {connectionState === 'error' && (
        <button
          onClick={reconnect}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          title="Reconnect"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};