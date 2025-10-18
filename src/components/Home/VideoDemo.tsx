
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
        className="group border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-xl px-10 py-7 rounded-2xl font-bold transition-all duration-500 hover:scale-110 shadow-xl hover:shadow-2xl text-lg"
        onClick={() => setVideoDemoOpen(true)}
      >
        <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
        <span>Voir la Démo</span>
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
