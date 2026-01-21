import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopBarProps {
  jobTitle?: string;
}

function BackButton() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M13.2343 17.3918L21.4158 8.30067C21.7513 7.92782 22.3265 7.8976 22.6992 8.23317C23.0922 8.58949 23.0846 9.16444 22.7667 9.51843L15.1318 17.9998L22.7668 26.4829C23.1009 26.8579 23.0713 27.4295 22.6998 27.7671C22.3265 28.1023 21.7516 28.0722 21.4158 27.6994L13.2348 18.6594C12.9218 18.2611 12.9218 17.7384 13.2343 17.3918Z" fill="#7E3DD4"/>
    </svg>
  );
}

export function TopBar({ jobTitle }: TopBarProps = {}) {
  const [showTitle, setShowTitle] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    if (!jobTitle) return;

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
  }, [jobTitle]);

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-[var(--elevation-sm)]">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {jobTitle ? (
            <>
              <BackButton />
              {(showTitle || isDesktop) && (
                <span className="text-foreground text-base font-bold truncate" style={{ lineHeight: '24px' }}>{jobTitle}</span>
              )}
            </>
          ) : (
            <>
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-foreground text-base font-bold" style={{ lineHeight: '24px' }}>Jobs Board</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}