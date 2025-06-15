
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl?: string; // Lien vers la vidéo (YouTube ou MP4)
  title?: string;
}

const VideoDemoModal: React.FC<VideoDemoModalProps> = ({
  open,
  onOpenChange,
  videoUrl = "https://www.youtube.com/embed/Wv2rLZmbPMA",
  title = "Démo de la Plateforme",
}) => {
  // Détecter type de vidéo (embed YouTube ou MP4 direct)
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="flex items-center justify-between px-4 py-3 border-b">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogClose asChild>
            <Button size="icon" variant="ghost" className="rounded-full">
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="w-full h-[320px] md:h-[480px] bg-black flex items-center justify-center">
          {isYouTube ? (
            <iframe
              src={videoUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video controls className="w-full h-full" title={title}>
              <source src={videoUrl} type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDemoModal;
