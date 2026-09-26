import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStartups } from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import TagInput from "../../components/common/TagInput";
import { Search, Sparkles, X } from "lucide-react";

const STAGES = ["Idea", "MVP", "Funded", "Scaling"];

const ROLES = [
  { value: "", label: "Any role" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
];

// Take up to 3 of the developer's profile skills to pre-fill the filter.
const pickSkillDefaults = (skills = []) =>
  Array.isArray(skills) ? skills.filter(Boolean).slice(0, 3) : [];

export default function BrowseStartups() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allStartups, browseStatus, error } = useSelector(
    (state) => state.startup
  );

  const profileSkills = pickSkillDefaults(user?.skills);

  const [keyword, setKeyword] = useState("");
  const [skills, setSkills] = useState(profileSkills);
  const [role, setRole] = useState("");
  const [stage, setStage] = useState("");
  const [usingProfileSkills, setUsingProfileSkills] = useState(
    profileSkills.length > 0
  );

  // Strip empty values before sending, so we never send e.g. stage="".
  const buildParams = (overrides = {}) => {
    const raw = {
      keyword: keyword.trim(),
      skills: skills.join(","),
      role,
      stage,
      ...overrides,
    };
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v));
  };

  // Initial load — pre-fill from the developer's profile skills.
  useEffect(() => {
    dispatch(fetchAllStartups(buildParams()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchAllStartups(buildParams()));
  };

  const clearSkills = () => {
    setSkills([]);
    setUsingProfileSkills(false);
    dispatch(fetchAllStartups(buildParams({ skills: "" })));
  };

  const clearAll = () => {
    setKeyword("");
    setSkills([]);
    setRole("");
    setStage("");
    setUsingProfileSkills(false);
    dispatch(fetchAllStartups({}));
  };

  const isLoading = browseStatus === "idle" || browseStatus === "loading";
  const hasActiveFilters =
    keyword.trim() || skills.length > 0 || role || stage;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Browse Startups
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Find startups that need what you can build.
      </p>

      {/* Skills-first banner */}
      {usingProfileSkills && skills.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-bg">
            <Sparkles className="h-4 w-4 text-gold-dark" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">
              Showing startups that need{" "}
              <span className="font-medium">
                {skills.join(", ")}
              </span>{" "}
              — matched to your profile skills.
            </p>
            <button
              type="button"
              onClick={clearSkills}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
            >
              <X className="h-3 w-3" />
              Clear skill filter
            </button>
          </div>
        </div>
      )}

      {/* No skills on profile yet — gentle nudge, not a blocker */}
      {!usingProfileSkills && profileSkills.length === 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Add skills on your{" "}
          <Link to="/profile" className="font-medium text-ink hover:underline">
            profile
          </Link>{" "}
          to auto-match startups that need them.
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name or description"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <TagInput
          label="Skills"
          value={skills}
          onChange={(next) => {
            setSkills(next);
            setUsingProfileSkills(false);
          }}
          placeholder="e.g. React, Node.js"
        />

        <div className="flex items-center justify-between">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Clear all filters
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {isLoading && allStartups.length === 0 ? (
        <Loader label="Loading startups" />
      ) : allStartups.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No startups match your filters.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allStartups.map((startup) => (
            <Link
              key={startup._id}
              to={`/opportunities/${startup._id}`}
              className="block focus:outline-none"
            >
              <Card className="transition-colors hover:border-border-strong">
                <div className="flex items-start gap-4">
                  {startup.logo ? (
                    <img
                      src={startup.logo}
                      alt={startup.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-base font-semibold text-white">
                      {startup.name?.[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {startup.name}
                      </h3>
                      <Badge status={startup.stage} />
                    </div>
                    <p className="text-xs text-muted">
                      {startup.industry}
                      {startup.founder?.name && ` · ${startup.founder.name}`}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {startup.description}
                    </p>
                    {startup.requiredSkills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {startup.requiredSkills.slice(0, 6).map((skill) => {
                          const matched = skills.some(
                            (s) => s.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={skill}
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                matched
                                  ? "bg-warning-bg text-gold-dark"
                                  : "bg-paper text-muted"
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}