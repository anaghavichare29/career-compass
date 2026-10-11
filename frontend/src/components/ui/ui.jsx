import React, { useEffect } from "react";

/* Small, dependency-free UI building blocks that use the cc- design system
   (see src/styles/theme.css). */

export const initialsOf = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const cx = (...parts) => parts.filter(Boolean).join(" ");

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="cc-page-header">
      <div>
        {eyebrow && <span className="cc-eyebrow">{eyebrow}</span>}
        <h1 className="cc-page-title">{title}</h1>
        {subtitle && <p className="cc-page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="cc-page-actions">{actions}</div>}
    </header>
  );
}

export function StatCard({ icon, tone = "blue", label, value, hint, hintUp, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className="cc-stat"
      onClick={onClick}
      style={onClick ? { cursor: "pointer", textAlign: "left", font: "inherit" } : undefined}
    >
      <div className={`cc-stat__icon cc-tone-${tone}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="cc-stat__body">
        <span className="cc-stat__label">{label}</span>
        <strong className="cc-stat__value">{value}</strong>
        {hint && (
          <span className={cx("cc-stat__hint", hintUp && "cc-stat__hint--up")}>
            {hintUp && <i className="bi bi-arrow-up-short"></i>}
            {hint}
          </span>
        )}
      </div>
    </Tag>
  );
}

export function Card({ title, subtitle, action, flush, className, children }) {
  return (
    <section className={cx("cc-card", className)}>
      {(title || action) && (
        <div className="cc-card__head">
          <div>
            {title && <h3 className="cc-card__title">{title}</h3>}
            {subtitle && <p className="cc-card__sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cx("cc-card__body", flush && "cc-card__body--flush")}>{children}</div>
    </section>
  );
}

export function Badge({ tone = "gray", dot, children }) {
  return <span className={cx("cc-badge", `cc-tone-${tone}`, dot && "cc-badge--dot")}>{children}</span>;
}

export function Avatar({ name, size, square, className }) {
  return (
    <div className={cx("cc-avatar", size && `cc-avatar--${size}`, square && "cc-avatar--sq", className)}>
      {initialsOf(name)}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, footer, size }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="cc-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx("cc-modal", size === "lg" && "cc-modal--lg")} role="dialog" aria-modal="true">
        <div className="cc-modal__head">
          <div>
            <h3 className="cc-modal__title">{title}</h3>
            {subtitle && <p className="cc-modal__sub">{subtitle}</p>}
          </div>
          <button type="button" className="cc-btn cc-btn--ghost cc-btn--icon" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="cc-modal__body">{children}</div>
        {footer && <div className="cc-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "bi-inbox", title, children, action }) {
  return (
    <div className="cc-empty">
      <div className="cc-empty__icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Loading({ label = "Loading..." }) {
  return (
    <div className="cc-loading">
      <div className="cc-spinner"></div>
      <span>{label}</span>
    </div>
  );
}

export function Alert({ tone = "info", children }) {
  const icon = tone === "success" ? "bi-check-circle-fill" : tone === "error" ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill";
  return (
    <div className={`cc-alert cc-alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <i className={`bi ${icon}`}></i>
      <span>{children}</span>
    </div>
  );
}

export function Field({ label, hint, span2, children }) {
  return (
    <label className={cx("cc-field", span2 && "cc-span-2")}>
      {label && <span className="cc-label">{label}</span>}
      {children}
      {hint && <span className="cc-hint">{hint}</span>}
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="cc-search">
      <i className="bi bi-search"></i>
      <input className="cc-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="cc-segmented" role="tablist">
      {options.map((opt) => {
        const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
        return (
          <button key={o.value} type="button" className={value === o.value ? "is-active" : ""} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Progress({ value = 0, tone }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cx("cc-progress", tone && `cc-progress--${tone}`)}>
      <span style={{ width: `${pct}%` }}></span>
    </div>
  );
}

/* Map common status strings to a badge tone. */
export function toneForStatus(status = "") {
  const s = String(status).toLowerCase();
  if (["active", "approved", "verified", "completed", "resolved", "success"].includes(s)) return "green";
  if (["pending", "in progress", "submitted", "open"].includes(s)) return "orange";
  if (["rejected", "suspended", "inactive", "blocked", "needs revision", "disabled"].includes(s)) return "red";
  return "gray";
}
