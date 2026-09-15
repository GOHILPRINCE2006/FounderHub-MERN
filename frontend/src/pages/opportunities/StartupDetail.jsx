import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStartupById } from "../../features/startup/startupSlice";
import { applyToPost, clearApplicationError } from "../../features/application/applicationSlice";
import axiosInstance from "../../api/axiosInstance";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

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

  // Recruitment posts aren't filterable by startup on the backend yet,
  // so we fetch all open posts and filter client-side for this startup.
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

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          {activeStartup.logo ? (
            <img
              src={activeStartup.logo}
              alt={activeStartup.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-navy text-lg font-semibold text-white">
              {activeStartup.name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">
                {activeStartup.name}
              </h1>
              <Badge status={activeStartup.stage} />
            </div>
            <p className="text-sm text-muted">{activeStartup.industry}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink">{activeStartup.description}</p>
        {activeStartup.requiredSkills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeStartup.requiredSkills.map((skill) => (
              <span key={skill} className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">
                {skill}
              </span>
            ))}
          </div>
        )}
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Open Roles</h2>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {postsLoading ? (
        <Loader label="Loading roles" />
      ) : posts.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">No open roles at this startup right now.</p>
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
                  <Badge tone="success" className="mt-3">
                    Applied
                  </Badge>
                ) : user?.role !== "developer" ? null : isApplyingHere ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <Textarea
                      label="Cover message (optional)"
                      value={coverMessage}
                      onChange={(e) => setCoverMessage(e.target.value)}
                      placeholder="Why are you a good fit for this role?"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={applyStatus === "loading"}
                        onClick={() => handleApply(post._id)}
                      >
                        Submit Application
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
                  <Button size="sm" className="mt-3" onClick={() => setApplyingPostId(post._id)}>
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