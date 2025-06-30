import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { useRealtimeSubscription } from '../hooks/useRealtime';
import { formatTimeAgo } from '../utils';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  User,
  Activity,
  Clock
} from 'lucide-react';

interface LiveActivityFeedProps {
  maxItems?: number;
  className?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  maxItems = 10,
  className = ''
}) => {
  const { events, isConnected } = useRealtimeSubscription({
    eventTypes: ['*'],
    autoReconnect: true
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'DropTicketSubmitted':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'ExchangeCompleted':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'SLAWarning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'CarrierRequestSent':
        return <MessageSquare className="w-4 h-4 text-cyan-600" />;
      case 'AccountValidated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'DropTicketSubmitted':
        return 'border-blue-200 bg-blue-50';
      case 'ExchangeCompleted':
        return 'border-emerald-200 bg-emerald-50';
      case 'SLAWarning':
        return 'border-amber-200 bg-amber-50';
      case 'CarrierRequestSent':
        return 'border-cyan-200 bg-cyan-50';
      case 'AccountValidated':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const formatEventMessage = (event: any) => {
    switch (event.eventType) {
      case 'DropTicketSubmitted':
        return `New ${event.data.targetProductType.replace('_', ' ')} exchange submitted`;
      case 'ExchangeCompleted':
        return `Exchange completed with ${event.data.accountsTransferred} accounts transferred`;
      case 'SLAWarning':
        return `SLA warning: ${event.data.hoursUntilBreach} hours until breach`;
      case 'CarrierRequestSent':
        return `Communication sent to carrier via ${event.data.method}`;
      case 'AccountValidated':
        return `Account ${event.data.accountNumber} validated successfully`;
      default:
        return `${event.eventType} event occurred`;
    }
  };

  const displayEvents = events.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Live Activity</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? 'success' : 'error'} size="sm">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Live events will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event, index) => (
              <div
                key={event.eventId}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200
                  ${getEventColor(event.eventType)}
                  ${index === 0 ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
                `}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      {formatEventMessage(event)}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                  
                  {event.data.ticketNumber && (
                    <p className="text-xs text-slate-600 mt-1">
                      Ticket: {event.data.ticketNumber}
                    </p>
                  )}
                  
                  {event.metadata.userId && (
                    <div className="flex items-center space-x-1 mt-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {event.metadata.userId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};