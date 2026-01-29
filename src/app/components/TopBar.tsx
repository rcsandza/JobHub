import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface TopBarProps {
  jobTitle?: string;
  companyName?: string;
  companyUrl?: string;
  onApplyClick?: () => void;
  hideApply?: boolean;
  hasApplied?: boolean;
  isSubmitting?: boolean;
}

export function TopBar({
  jobTitle,
  companyName,
  companyUrl,
  onApplyClick,
  hideApply = false,
  hasApplied = false,
  isSubmitting = false
}: TopBarProps = {}) {
  const [showBar, setShowBar] = useState(!jobTitle); // Hide initially only if jobTitle exists

  useEffect(() => {
    if (!jobTitle) {
      setShowBar(true);
      return;
    }

    const handleScroll = () => {
      // Show bar after scrolling past ~200px (past the header card)
      const scrollPosition = window.scrollY;
      setShowBar(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [jobTitle]);

  return (
    <div
      className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-[var(--elevation-sm)] transition-all duration-300 ease-in-out"
      style={{
        opacity: showBar ? 1 : 0,
        transform: showBar ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: showBar ? 'auto' : 'none'
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {jobTitle ? (
          <>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-foreground text-base font-bold truncate" style={{ lineHeight: '24px' }}>
                {jobTitle}
              </span>
              {companyName && (
                companyUrl ? (
                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 transition-opacity truncate"
                    style={{ lineHeight: '20px' }}
                  >
                    {companyName}
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-primary text-sm font-semibold truncate" style={{ lineHeight: '20px' }}>
                    {companyName}
                  </span>
                )
              )}
            </div>
            {!hideApply && onApplyClick && (
              <div className="flex-shrink-0">
                {hasApplied ? (
                  <Button
                    disabled
                    className="cursor-not-allowed h-10 px-6 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: '#F2F2EC',
                      color: '#605F56',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      gap: '8px',
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <Button
                    onClick={onApplyClick}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 h-10 px-6 rounded-lg"
                    style={{
                      color: '#FFF',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                    }}
                  >
                    Apply
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-foreground text-base font-bold" style={{ lineHeight: '24px' }}>Jobs Board</span>
          </Link>
        )}
      </div>
    </div>
  );
}