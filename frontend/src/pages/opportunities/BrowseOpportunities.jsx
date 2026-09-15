import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllOpenPosts } from "../../features/recruitment/recruitmentSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function BrowseOpportunities() {
  const dispatch = useDispatch();
  const { openPosts, openPostsStatus, error } = useSelector((state) => state.recruitment);

  useEffect(() => {
    dispatch(fetchAllOpenPosts());
  }, [dispatch]);

  if (openPostsStatus === "loading") {
    return <Loader label="Loading open roles" full />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">
        Open Opportunities
      </h1>
      <p className="mb-6 text-sm text-muted">
        Roles startups are currently hiring for.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {openPosts.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">
            No open roles right now. Check back soon.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {openPosts.map((post) => (
            <Link key={post._id} to={`/opportunities/${post.startup._id}`}>
              <Card className="transition-shadow hover:shadow-md">
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-ink">
                        {post.roleTitle}
                      </h3>
                      <Badge status={post.startup?.stage} />
                    </div>
                    <p className="text-sm text-muted">
                      {post.startup?.name} · {post.startup?.industry}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {post.description}
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