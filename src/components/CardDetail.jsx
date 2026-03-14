import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";

const toFileList = (files) => Array.from(files || []);

const IMPORTANCE_OPTIONS = [
  { value: "", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function ScreenshotLightbox({ src, onClose }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    // Try to derive a file extension from the data URL
    const ext = src.startsWith("data:image/png")
        ? "png"
        : src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")
        ? "jpg"
        : src.startsWith("data:application/pdf")
        ? "pdf"
        : "img";
    a.download = `screenshot.${ext}`;
    a.click();
  };

  return (
    <div className="lightbox-overlay" onClick={handleBackdrop}>
      <div className="lightbox-content">
        <button className="btn ghost lightbox-close" type="button" onClick={onClose}>✕</button>
        <img src={src} alt="Screenshot" className="lightbox-img" />
        <div className="lightbox-actions">
          <button className="btn primary" type="button" onClick={handleDownload}>
            ⬇ Download
          </button>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ src, mime }) {
  const isPdf = mime === "application/pdf" || src.startsWith("data:application/pdf");
  if (isPdf) {
    return (
      <div className="thumb-icon thumb-pdf" title="PDF">
        <span>PDF</span>
      </div>
    );
  }
  return <img src={src} alt="thumb" className="thumb-img" />;
}

export default function CardDetail({ card, onClose, onUpdate }) {
  const dialogRef = useRef(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const screenshotItems = useMemo(
    () =>
      card.screenshots.map((shot, index) => ({
        id: `${card.id}-${index}`,
        src: shot,
        index,
      })),
    [card.screenshots, card.id]
  );

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const readFilesAsDataURL = async (files) => {
    const reads = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(reads);
  };

  const handleUpload = async (event) => {
    const files = toFileList(event.target.files);
    if (!files.length) return;
    const results = await readFilesAsDataURL(files);
    onUpdate({ screenshots: [...card.screenshots, ...results] });
    event.target.value = "";
  };

  const handleRemoveScreenshot = (index) => {
    const next = card.screenshots.filter((_, i) => i !== index);
    onUpdate({ screenshots: next });
  };

  // Cmd/Ctrl+V paste support
  const handlePaste = useCallback(
    async (event) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItems = items.filter(
        (item) => item.kind === "file" && (item.type.startsWith("image/") || item.type === "application/pdf")
      );
      if (!imageItems.length) return;
      event.preventDefault();
      const files = imageItems.map((item) => item.getAsFile()).filter(Boolean);
      const results = await readFilesAsDataURL(files);
      onUpdate({ screenshots: [...card.screenshots, ...results] });
    },
    [card.screenshots, onUpdate]
  );

  useEffect(() => {
    // Focus the modal container so Cmd/Ctrl+V always fires here
    dialogRef.current?.focus();
  }, []);

  return (
    <>
      <div className="modal" role="dialog" aria-modal="true" onClick={handleBackdrop} onPaste={handlePaste}>
        <div className="modal-content" ref={dialogRef} tabIndex={-1} style={{ outline: "none" }}>
          <header className="modal-header">
            <div>
              <p className="eyebrow">Card</p>
              <h2>{card.title}</h2>
            </div>
            <button className="btn ghost" type="button" onClick={onClose}>Close</button>
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
              <div className="field-label">
                Screenshots
                <span className="field-hint"> — drag files, click to upload, or paste (⌘V / Ctrl+V)</span>
              </div>
              <div className="uploader">
                <input type="file" accept="image/*,.pdf" multiple onChange={handleUpload} />
                <p>Files are stored locally in your browser.</p>
              </div>
              {screenshotItems.length ? (
                <div className="thumb-grid">
                  {screenshotItems.map((shot) => (
                    <div key={shot.id} className="thumb-tile">
                      <button
                        type="button"
                        className="thumb-btn"
                        onClick={() => setLightboxSrc(shot.src)}
                        title="Click to enlarge"
                      >
                        <FileIcon src={shot.src} />
                      </button>
                      <button
                        className="thumb-remove"
                        type="button"
                        onClick={() => handleRemoveScreenshot(shot.index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">No screenshots yet — upload or paste an image</div>
              )}
            </div>
          </section>
        </div>
      </div>
      {lightboxSrc && (
        <ScreenshotLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}
