import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStartupById } from "../../features/startup/startupSlice";
import {
  applyToPost,
  clearApplicationError,
} from "../../features/application/applicationSlice";
import axiosInstance from "../../api/axiosInstance";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ArrowLeft, Check, Lock } from "lucide-react";

export default function StartupDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeStartup, detailStatus } = useSelector((state) => state.startup);
  const { applyStatus, error } = useSelector((state) => state.application);
  const { user } = useSelector((state) => state.auth);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [applyingPostId, setApplyingPostId] = useState(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [appliedPostIds, setAppliedPostIds] = useState([]);

  useEffect(() => {
    dispatch(fetchStartupById(id));
  }, [dispatch, id]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await axiosInstance.get("/recruitments");
        setPosts(res.data.data.filter((p) => p.startup?._id === id));
      } catch {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, [id]);

  const handleApply = async (postId) => {
    dispatch(clearApplicationError());
    const result = await dispatch(applyToPost({ postId, coverMessage }));
    if (applyToPost.fulfilled.match(result)) {
      setAppliedPostIds((prev) => [...prev, postId]);
      setApplyingPostId(null);
      setCoverMessage("");
    }
  };

  if (detailStatus === "loading" || !activeStartup) {
    return <Loader label="Loading startup" full />;
  }

  const canViewPrivate = activeStartup.canViewPrivate === true;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/browse-startups"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* PUBLIC */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          {activeStartup.logo ? (
            <img
              src={activeStartup.logo}
              alt={activeStartup.name}
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy text-lg font-semibold text-white">
              {activeStartup.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">
                {activeStartup.name}
              </h1>
              <Badge status={activeStartup.stage} />
            </div>
            <p className="text-sm text-muted">{activeStartup.industry}</p>
            {activeStartup.location && (
              <p className="text-xs text-muted">{activeStartup.location}</p>
            )}
          </div>
        </div>

        {activeStartup.tagline && (
          <p className="mt-4 text-sm text-ink">{activeStartup.tagline}</p>
        )}

        {activeStartup.lookingFor?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeStartup.lookingFor.map((l) => (
              <span
                key={l}
                className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-gold-dark"
              >
                Looking for: {l}
              </span>
            ))}
          </div>
        )}

        {activeStartup.requiredSkills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeStartup.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* PRIVATE */}
      <Card className="mb-6">
        {canViewPrivate ? (
          <>
            <h2 className="mb-3 font-display text-sm font-semibold text-ink">
              Private details
            </h2>
            <div className="flex flex-col gap-4 text-sm">
              {activeStartup.problem && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">Problem</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{activeStartup.problem}</p>
                </div>
              )}
              {activeStartup.solution && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">Solution</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{activeStartup.solution}</p>
                </div>
              )}
              {activeStartup.traction && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">Traction</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{activeStartup.traction}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                {activeStartup.teamSize > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">Team size</p>
                    <p className="mt-1 text-ink">{activeStartup.teamSize}</p>
                  </div>
                )}
                {activeStartup.foundingYear && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">Founded</p>
                    <p className="mt-1 text-ink">{activeStartup.foundingYear}</p>
                  </div>
                )}
                {activeStartup.fundingStatus && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">Funding</p>
                    <p className="mt-1 text-ink">{activeStartup.fundingStatus}</p>
                  </div>
                )}
              </div>
              {activeStartup.technologies?.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">Stack</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeStartup.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper">
              <Lock className="h-4 w-4 text-muted" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                Private details are locked
              </p>
              <p className="text-xs text-muted">
                Unlock by joining the team, or when the founder approves your connection.
              </p>
            </div>
          </div>
        )}
      </Card>

      <h2 className="mb-3 font-display text-base font-semibold text-ink">
        Open Roles
      </h2>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {postsLoading ? (
        <Loader label="Loading roles" />
      ) : posts.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No open roles at this startup right now.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const alreadyApplied = appliedPostIds.includes(post._id);
            const isApplyingHere = applyingPostId === post._id;

            return (
              <Card key={post._id}>
                <h3 className="font-display text-base font-semibold text-ink">
                  {post.roleTitle}
                </h3>
                <p className="mt-1 text-sm text-muted">{post.description}</p>
                {post.requiredSkills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {post.requiredSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {alreadyApplied ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-success">
                    <Check className="h-4 w-4" /> Applied
                  </p>
                ) : user?.role !== "developer" ? null : isApplyingHere ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <Textarea
                      label="Cover message (optional)"
                      rows={3}
                      value={coverMessage}
                      onChange={(e) => setCoverMessage(e.target.value)}
                      placeholder="Why are you a good fit?"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={applyStatus === "loading"}
                        onClick={() => handleApply(post._id)}
                      >
                        Submit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setApplyingPostId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setApplyingPostId(post._id)}
                  >
                    Apply
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}