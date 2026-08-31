export default function Loader({ label = "Loading", full = false }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-muted ${
        full ? "min-h-[60vh]" : "py-8"
      }`}
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent"
        aria-hidden="true"
      />
      <span className="text-sm">{label}...</span>
    </div>
  );
}