import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpContent } from './HelpContent.tsx';

type HelpModalProps = {
  onClose: () => void;
};

export function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop help-modal-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        <header className="help-modal__header">
          <h2 id="help-modal-title">遊び方</h2>
          <button
            className="icon-button icon-button--square icon-button--quiet"
            type="button"
            aria-label="ヘルプモーダルを閉じる"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <div className="help-modal__body">
          <HelpContent />
        </div>
      </section>
    </div>,
    document.body,
  );
}
