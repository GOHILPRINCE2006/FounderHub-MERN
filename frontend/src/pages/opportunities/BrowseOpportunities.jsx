import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllOpenPosts } from "../../features/recruitment/recruitmentSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { MapPin, Briefcase } from "lucide-react";

export default function BrowseOpportunities() {
  const dispatch = useDispatch();
  const { openPosts, openPostsStatus, error } = useSelector(
    (state) => state.recruitment
  );

  useEffect(() => {
    dispatch(fetchAllOpenPosts());
  }, [dispatch]);

  if (openPostsStatus === "loading") {
    return <Loader label="Loading open roles" full />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-ink">
        Open Opportunities
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Roles startups are currently hiring for.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {openPosts.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No open roles right now. Check back soon.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {openPosts.map((post) => (
            <Link
              key={post._id}
              to={`/opportunities/${post.startup._id}`}
              className="block focus:outline-none"
            >
              <Card className="transition-colors hover:border-border-strong">
                <div className="flex items-start gap-4">
                  {post.startup?.logo ? (
                    <img
                      src={post.startup.logo}
                      alt={post.startup.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-semibold text-white">
                      {post.startup?.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {post.roleTitle}
                      </h3>
                      <Badge status={post.startup?.stage} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {post.startup?.name}
                      </span>
                      {post.startup?.industry && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {post.startup.industry}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {post.description}
                    </p>
                    {post.requiredSkills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.requiredSkills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                          >
                            {skill}
                          </span>
                        ))}
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