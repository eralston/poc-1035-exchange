import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Maximize, Minimize } from 'lucide-react';

export const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleFullscreen}
        className="
          bg-white/90 backdrop-blur-sm border border-slate-200/50 
          shadow-lg hover:shadow-xl transition-all duration-300
          hover:bg-white hover:border-slate-300
          hover:scale-105 hover:-translate-y-0.5
          text-slate-700 hover:text-slate-900
          rounded-full w-12 h-12 p-0
          group
        "
        title={isFullscreen ? 'Exit fullscreen presentation' : 'Enter fullscreen presentation'}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        ) : (
          <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        )}
      </Button>
    </div>
  );
};