
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import VideoDemoModal from './VideoDemoModal';

const VideoDemo: React.FC = () => {
  const [videoDemoOpen, setVideoDemoOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline"
        size="lg"
        className="border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold transition-all duration-300"
        onClick={() => setVideoDemoOpen(true)}
      >
        <Play className="mr-2 h-5 w-5" />
        Voir la Démo
      </Button>
      
      <VideoDemoModal 
        open={videoDemoOpen}
        onOpenChange={setVideoDemoOpen}
        videoUrl="https://www.youtube.com/embed/Wv2rLZmbPMA"
        title="Démo de la Plateforme JobPersona IA"
      />
    </>
  );
};

export default VideoDemo;
