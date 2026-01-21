import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

interface MobileJobHeaderProps {
  title: string;
}

export function MobileJobHeader({ title }: MobileJobHeaderProps) {
  const navigate = useNavigate();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowTitle(scrollPosition > 100);
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <div className="sticky top-0 z-50 bg-card lg:bg-background border-b border-border">
      <div className="container mx-auto w-full max-w-[800px] px-4 md:px-6">
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

          {/* Title - Hidden until scroll on mobile, always visible on desktop */}
          {(showTitle || isDesktop) && (
            <h2 className="text-center flex-1 mx-4 truncate text-foreground font-semibold">
              {title}
            </h2>
          )}

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
