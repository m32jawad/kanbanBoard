import React, { useMemo, useRef } from "react";

const toFileList = (files) => Array.from(files || []);

const IMPORTANCE_OPTIONS = [
  { value: "", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function CardDetail({ card, onClose, onUpdate }) {
  const dialogRef = useRef(null);

  const screenshotItems = useMemo(
    () =>
      card.screenshots.map((shot, index) => ({
        id: `${card.id}-${index}`,
        src: shot,
      })),
    [card.screenshots, card.id]
  );

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleUpload = async (event) => {
    const files = toFileList(event.target.files);
    if (!files.length) {
      return;
    }
    const reads = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    const results = await Promise.all(reads);
    onUpdate({ screenshots: [...card.screenshots, ...results] });
    event.target.value = "";
  };

  const handleRemoveScreenshot = (index) => {
    const next = card.screenshots.filter((_, i) => i !== index);
    onUpdate({ screenshots: next });
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={handleBackdrop}>
      <div className="modal-content" ref={dialogRef}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Card</p>
            <h2>{card.title}</h2>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <section className="modal-body">
          <label className="field">
            Title
            <input
              type="text"
              value={card.title}
              onChange={(event) => onUpdate({ title: event.target.value })}
            />
          </label>
          <label className="field">
            Notes
            <textarea
              rows={6}
              value={card.description}
              onChange={(event) => onUpdate({ description: event.target.value })}
              placeholder="Describe the task..."
            />
          </label>
          <label className="field">
            Importance
            <div className="importance-picker">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn importance-btn ${card.importance === opt.value || (!card.importance && opt.value === "") ? "active" : ""}`}
                  data-importance={opt.value}
                  onClick={() => onUpdate({ importance: opt.value || null })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </label>
          <div className="field">
            <div className="field-label">Screenshots</div>
            <div className="uploader">
              <input type="file" accept="image/*" multiple onChange={handleUpload} />
              <p>Files are stored locally in your browser.</p>
            </div>
            {screenshotItems.length ? (
              <div className="screenshot-scroll">
                <div className="screenshot-grid">
                  {screenshotItems.map((shot, index) => (
                    <div key={shot.id} className="screenshot-item">
                      <img src={shot.src} alt="Screenshot" />
                      <button
                        className="btn ghost screenshot-remove"
                        type="button"
                        onClick={() => handleRemoveScreenshot(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty">No screenshots yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
