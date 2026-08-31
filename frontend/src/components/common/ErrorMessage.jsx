export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-medium underline underline-offset-2 hover:text-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}