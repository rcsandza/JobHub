import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopBarProps {
  jobTitle?: string;
}

export function TopBar({ jobTitle }: TopBarProps = {}) {
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
      <div className="container mx-auto flex h-16 items-center px-4">
        {jobTitle ? (
          <span className="text-foreground text-base font-bold truncate" style={{ lineHeight: '24px' }}>{jobTitle}</span>
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