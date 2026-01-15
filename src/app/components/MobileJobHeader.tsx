import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface MobileJobHeaderProps {
  title: string;
}

export function MobileJobHeader({ title }: MobileJobHeaderProps) {
  const navigate = useNavigate();
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleShare = async () => {
    const url = window.location.href;

    // Try native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this job: ${title}`,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        console.log('Share cancelled or failed:', err);
      }
    }

    // Fallback to clipboard (desktop browsers)
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between py-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back to jobs list"
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title - Hidden on small screens, shown on medium+ */}
          <h2 className="hidden md:block text-center flex-1 mx-4 truncate text-foreground">
            {title}
          </h2>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share this job"
            className="flex-shrink-0 relative"
          >
            <Share2 className="h-5 w-5" />
            {shareSuccess && (
              <span className="absolute -top-8 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
