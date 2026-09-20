import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStartups } from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const STAGES = ["Idea", "MVP", "Funded", "Scaling"];

export default function DiscoverStartups() {
  const dispatch = useDispatch();
  const { allStartups, browseStatus, error } = useSelector((state) => state.startup);
  const [keyword, setKeyword] = useState("");
  const [stage, setStage] = useState("");

  const search = (filters) => {
    // Only send filters that have a value.
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
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
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">Discover Startups</h1>
      <p className="mb-6 text-sm text-muted">
        Browse startups and send a connection request to the founders you want to talk to.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by name or description"
          aria-label="Search startups"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          aria-label="Filter by stage"
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
          <ErrorMessage message={error} onRetry={() => search({ keyword: keyword.trim(), stage })} />
        </div>
      )}

      {isLoading && allStartups.length === 0 ? (
        <Loader label="Loading startups" />
      ) : allStartups.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">No startups match your search.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allStartups.map((startup) => (
            <Link
              key={startup._id}
              to={`/investor/startups/${startup._id}`}
              className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Card className="transition-shadow hover:shadow-md">
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
                      {startup.founder?.name && ` · Founded by ${startup.founder.name}`}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-ink">{startup.description}</p>
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
