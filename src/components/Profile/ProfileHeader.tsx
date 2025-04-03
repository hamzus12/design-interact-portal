
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardTitle } from '@/components/ui/card';

interface ProfileHeaderProps {
  title: string;
  description: string;
  imageUrl?: string;
  initials: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  description,
  imageUrl,
  initials
}) => {
  return (
    <div className="flex flex-row items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={imageUrl} alt={title} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
