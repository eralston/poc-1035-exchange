import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'error';
}

interface ProgressIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  className = ''
}) => {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'current':
        return <Clock className="w-4 h-4 text-white" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return <div className="w-2 h-2 bg-white rounded-full" />;
    }
  };

  const getStepColors = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 border-emerald-500';
      case 'current':
        return 'bg-blue-500 border-blue-500 shadow-blue-500/30 shadow-lg';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-slate-300 border-slate-300';
    }
  };

  const getConnectorColors = (currentStatus: Step['status'], nextStatus?: Step['status']) => {
    if (currentStatus === 'completed') {
      return 'bg-emerald-500';
    }
    return 'bg-slate-300';
  };

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${getStepColors(step.status)}
              `}>
                {getStepIcon(step.status)}
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  w-0.5 h-8 mt-2 transition-all duration-200
                  ${getConnectorColors(step.status, steps[index + 1]?.status)}
                `} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-8">
              <h4 className={`
                text-sm font-medium transition-colors duration-200
                ${step.status === 'current' ? 'text-blue-900' : 
                  step.status === 'completed' ? 'text-emerald-900' :
                  step.status === 'error' ? 'text-red-900' : 'text-slate-500'}
              `}>
                {step.title}
              </h4>
              {step.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${getStepColors(step.status)}
            `}>
              {getStepIcon(step.status)}
            </div>
            <div className="text-center">
              <h4 className={`
                text-xs font-medium transition-colors duration-200
                ${step.status === 'current' ? 'text-blue-900' : 
                  step.status === 'completed' ? 'text-emerald-900' :
                  step.status === 'error' ? 'text-red-900' : 'text-slate-500'}
              `}>
                {step.title}
              </h4>
              {step.description && (
                <p className="mt-1 text-xs text-slate-500 max-w-20">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-4 transition-all duration-200
              ${getConnectorColors(step.status, steps[index + 1]?.status)}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};