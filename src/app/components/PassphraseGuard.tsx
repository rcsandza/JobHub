import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const PASSPHRASE = 'Mediocris';
const STORAGE_KEY = 'jobhub_auth';

interface PassphraseGuardProps {
  children: React.ReactNode;
}

export function PassphraseGuard({ children }: PassphraseGuardProps) {
  // Bypass passphrase in test environment
  if (import.meta.env.VITE_BYPASS_PASSPHRASE === 'true') {
    return <>{children}</>;
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem(STORAGE_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passphrase === PASSPHRASE) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect passphrase');
      setPassphrase('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JobHub</h1>
          <p className="text-muted-foreground">Enter passphrase to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Access
          </Button>
        </form>
      </div>
    </div>
  );
}
