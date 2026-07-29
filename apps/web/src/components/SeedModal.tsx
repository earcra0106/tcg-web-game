import { Check, Copy, Play, X } from 'lucide-react';
import { useState } from 'react';
import {
  createRandomSeed,
  isUuidSeed,
  normalizeUuidSeed,
} from '../game/seed.ts';

type SeedModalProps = {
  currentSeed: string;
  onClose: () => void;
  onRetry: (seed: string) => void;
};

export function SeedModal({ currentSeed, onClose, onRetry }: SeedModalProps) {
  const [seedInput, setSeedInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const normalizedSeed = normalizeUuidSeed(seedInput);
  const isSeedInputValid =
    seedInput.trim() === '' || isUuidSeed(normalizedSeed);

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(currentSeed);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const retry = () => {
    if (!isSeedInputValid) {
      return;
    }

    onRetry(seedInput.trim() === '' ? createRandomSeed() : normalizedSeed);
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="seed-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seed-modal-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        <header className="seed-modal__header">
          <h2 id="seed-modal-title">シード値</h2>
          <button
            className="icon-button icon-button--square icon-button--quiet"
            type="button"
            aria-label="シード値モーダルを閉じる"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            retry();
          }}
        >
          <label className="seed-modal__label" htmlFor="current-seed">
            現在のシード値
          </label>
          <div className="seed-modal__field-row">
            <output id="current-seed" className="seed-modal__current-seed">
              {currentSeed}
            </output>
            <button
              className="icon-button icon-button--square"
              type="button"
              aria-label="現在のシード値をコピーする"
              onClick={() => void copySeed()}
            >
              {isCopied ? (
                <Check aria-hidden="true" size={18} />
              ) : (
                <Copy aria-hidden="true" size={18} />
              )}
            </button>
          </div>
          <label className="seed-modal__label" htmlFor="retry-seed">
            シード値を指定してリトライ
          </label>
          <div className="seed-modal__field-row">
            <input
              id="retry-seed"
              className="seed-modal__input"
              type="text"
              autoComplete="off"
              value={seedInput}
              placeholder="シード値を入力(空ならランダムシード)"
              aria-invalid={!isSeedInputValid}
              aria-describedby={
                isSeedInputValid ? undefined : 'retry-seed-error'
              }
              onChange={(event) => setSeedInput(event.target.value)}
            />
            <button
              className="icon-button icon-button--square"
              type="submit"
              aria-label="指定したシード値でリトライする"
              disabled={!isSeedInputValid}
            >
              <Play aria-hidden="true" size={18} />
            </button>
          </div>
          {!isSeedInputValid ? (
            <p id="retry-seed-error" className="seed-modal__error">
              UUID形式で入力してください。
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
