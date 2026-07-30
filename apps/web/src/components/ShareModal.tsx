import { Check, Copy, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const GAME_URL = 'https://cookers-web-game.vercel.app/';

type ShareModalProps = {
  stageNumber: number;
  seed: string;
  onClose: () => void;
};

export function buildShareText(stageNumber: number, seed: string) {
  return `ステージ ${stageNumber} の生産目標を達成！\nシード値: ${seed}\n\nプレイはこちらから\n${GAME_URL}\n\n#cookers!`;
}

export function ShareModal({ stageNumber, seed, onClose }: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const shareText = buildShareText(stageNumber, seed);
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const lineShareUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? `https://line.me/R/share?text=${encodeURIComponent(shareText)}`
    : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(GAME_URL)}&text=${encodeURIComponent(shareText)}`;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
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
        <img
          className="share-modal__logo"
          src="/assets/sprites/logo.png"
          alt="cookers!"
        />
        <div className="share-modal__actions" aria-label="共有先">
          <a
            className="share-modal__action"
            href={xShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Xで共有する"
          >
            <Share2 aria-hidden="true" size={22} />
            <span>Xで共有</span>
          </a>
          <a
            className="share-modal__action"
            href={lineShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LINEで共有する"
          >
            <Share2 aria-hidden="true" size={22} />
            <span>LINEで共有</span>
          </a>
          <button
            className="share-modal__action"
            type="button"
            aria-label="共有文をコピーする"
            onClick={() => void copyLink()}
          >
            {isCopied ? (
              <Check aria-hidden="true" size={22} />
            ) : (
              <Copy aria-hidden="true" size={22} />
            )}
            <span>{isCopied ? 'コピーしました' : 'リンクをコピー'}</span>
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
