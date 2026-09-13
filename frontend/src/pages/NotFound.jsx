import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="font-mono text-sm text-muted">404</span>
      <h1 className="font-display text-2xl font-semibold text-ink">
        This page doesn't exist
      </h1>
      <p className="max-w-sm text-sm text-muted">
        The page you're looking for may have been moved or never existed.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </div>
  );
}