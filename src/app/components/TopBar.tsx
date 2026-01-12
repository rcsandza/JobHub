import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function TopBar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-[var(--elevation-sm)]">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-foreground">Jobs Board</h1>
        </Link>
      </div>
    </div>
  );
}