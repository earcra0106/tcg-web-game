import { Check, Copy, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  COOKERS_GAME_URL,
  createLineShareUrl,
  createXPostIntentUrl,
} from '../game/share.ts';

type ShareModalProps = {
  imageUrl: string;
  postText: string;
  onClose: () => void;
};

export function ShareModal({ imageUrl, postText, onClose }: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(COOKERS_GAME_URL);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop share-modal-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <header className="share-modal__header">
          <h2 id="share-modal-title">シェア</h2>
          <button
            className="icon-button icon-button--square icon-button--quiet"
            type="button"
            aria-label="シェアモーダルを閉じる"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <img className="share-modal__image" src={imageUrl} alt="シェア画像" />
        <div className="share-modal__actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Xで共有する"
            onClick={() => openShareWindow(createXPostIntentUrl(postText))}
          >
            <Send aria-hidden="true" size={18} />
            <span>Xで共有</span>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="LINEで共有する"
            onClick={() => openShareWindow(createLineShareUrl(postText))}
          >
            <MessageCircle aria-hidden="true" size={18} />
            <span>LINEで共有</span>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="リンクをコピーする"
            onClick={() => void copyLink()}
          >
            {isCopied ? (
              <Check aria-hidden="true" size={18} />
            ) : (
              <Copy aria-hidden="true" size={18} />
            )}
            <span>リンクをコピー</span>
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
