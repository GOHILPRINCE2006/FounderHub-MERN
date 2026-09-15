import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  { label, error, id, rows = 4, className = "", ...rest },
  ref
) {
  const textareaId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={`resize-none rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted
          focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
          ${error ? "border-danger" : "border-border"} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Textarea;