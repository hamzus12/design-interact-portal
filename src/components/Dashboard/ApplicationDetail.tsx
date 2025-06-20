
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, FileText, Send, Eye } from 'lucide-react';

interface ApplicationDetailProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (applicationId: string, content: string) => void;
  isSubmitting?: boolean;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  application,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [content, setContent] = React.useState(application?.content || '');

  React.useEffect(() => {
    setContent(application?.content || '');
  }, [application]);

  const handleSubmit = () => {
    if (onSubmit && application?.id) {
      onSubmit(application.id, content);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'refused':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: boolean, isSubmitted?: boolean) => {
    if (isSubmitted) return 'Soumise';
    return status ? 'Brouillon' : 'Non soumise';
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lettre de Motivation
          </DialogTitle>
          <DialogDescription>
            Candidature pour {application.jobs?.title} chez {application.jobs?.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {application.jobs?.company_logo ? (
                  <img 
                    src={application.jobs.company_logo} 
                    alt={`${application.jobs.company} logo`}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {application.jobs?.company?.charAt(0)?.toUpperCase() || 'J'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{application.jobs?.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{application.jobs?.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status || 'pending')}>
                    {getStatusText(application.is_submitted)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(application.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contenu de la lettre de motivation</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Votre lettre de motivation..."
              disabled={application.is_submitted}
            />
          </div>

          {/* Application Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {application.application_type === 'cover_letter' ? 'Lettre' : 'CV'}
              </div>
              <div className="text-sm text-gray-600">Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {content.length}
              </div>
              <div className="text-sm text-gray-600">Caractères</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {application.is_submitted ? 'Oui' : 'Non'}
              </div>
              <div className="text-sm text-gray-600">Soumise</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <div className="flex gap-2">
            {!application.is_submitted && onSubmit && (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Soumission...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Soumettre
                  </>
                )}
              </Button>
            )}
            {application.is_submitted && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Lecture seule
              </Badge>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetail;
