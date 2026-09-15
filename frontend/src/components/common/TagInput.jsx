import { useState } from "react";

// Simple add-on-Enter tag input. `value` is a string array; `onChange`
// receives the updated array. Used for requiredSkills / requiredRoles,
// which the backend expects as JSON arrays (not comma text) since
// startup creation is multipart/form-data.
export default function TagInput({ label, value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink">{label}</label>}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted hover:text-danger"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
      <p className="text-xs text-muted">Press Enter or comma to add</p>
    </div>
  );
}