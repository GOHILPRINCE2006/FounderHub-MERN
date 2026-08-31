export default function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}