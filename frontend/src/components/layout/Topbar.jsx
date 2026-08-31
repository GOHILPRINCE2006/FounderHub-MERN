export default function Topbar({ title, actions }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}