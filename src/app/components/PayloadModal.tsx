import { X } from 'lucide-react';
import { Button } from './ui/button';

interface PayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: any;
}

export function PayloadModal({ isOpen, onClose, payload }: PayloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-card rounded-[var(--radius-card)] border border-border shadow-[var(--elevation-lg)] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground">Application Payload Preview</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              This is the payload we'll send to the API:
            </p>
            <pre className="bg-muted p-4 rounded-[var(--radius-md)] overflow-x-auto text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
