import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStartups } from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Search } from "lucide-react";

const STAGES = ["Idea", "MVP", "Funded", "Scaling"];

export default function DiscoverStartups() {
  const dispatch = useDispatch();
  const { allStartups, browseStatus, error } = useSelector(
    (state) => state.startup
  );
  const [keyword, setKeyword] = useState("");
  const [stage, setStage] = useState("");

  const search = (filters) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );
    dispatch(fetchAllStartups(params));
  };

  useEffect(() => {
    dispatch(fetchAllStartups({}));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    search({ keyword: keyword.trim(), stage });
  };

  const isLoading = browseStatus === "idle" || browseStatus === "loading";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Discover Startups
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Browse startups and send connection requests to founders.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
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
        <Button type="submit" variant="secondary">
          Search
        </Button>
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
            No startups match your search.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allStartups.map((startup) => (
            <Link
              key={startup._id}
              to={`/investor/startups/${startup._id}`}
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