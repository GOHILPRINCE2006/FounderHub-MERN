const VARIANT_CLASSES = {
  primary: "bg-gold text-ink hover:bg-gold-dark focus-visible:outline-navy",
  secondary: "bg-navy text-white hover:bg-navy-light",
  outline: "border border-border bg-surface text-ink hover:bg-paper",
  danger: "bg-danger text-white hover:bg-red-700",
  ghost: "text-muted hover:text-ink hover:bg-paper",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}