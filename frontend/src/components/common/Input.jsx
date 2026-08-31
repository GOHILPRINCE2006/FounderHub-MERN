import { forwardRef } from "react";

// forwardRef is required so React Hook Form's register() can attach its
// ref directly to the underlying <input>.
const Input = forwardRef(function Input(
  { label, error, id, className = "", ...rest },
  ref
) {
  const inputId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted
          focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
          ${error ? "border-danger" : "border-border"} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;