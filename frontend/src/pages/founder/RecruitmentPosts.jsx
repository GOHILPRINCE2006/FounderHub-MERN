import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchMyRecruitmentPosts,
  createRecruitmentPost,
  updateRecruitmentPost,
  deleteRecruitmentPost,
  clearRecruitmentError,
} from "../../features/recruitment/recruitmentSlice";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import TagInput from "../../components/common/TagInput";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";

export default function RecruitmentPosts() {
  const dispatch = useDispatch();
  const { myPosts, fetchStatus, actionStatus, error } = useSelector(
    (state) => state.recruitment
  );

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchMyRecruitmentPosts());
  }, [dispatch]);

  const onSubmit = async (data) => {
    dispatch(clearRecruitmentError());
    const result = await dispatch(
      createRecruitmentPost({
        roleTitle: data.roleTitle,
        description: data.description,
        requiredSkills,
      })
    );
    if (createRecruitmentPost.fulfilled.match(result)) {
      reset();
      setRequiredSkills([]);
      setShowForm(false);
    }
  };

  const toggleOpen = (post) => {
    dispatch(
      updateRecruitmentPost({
        id: post._id,
        payload: { isOpen: !post.isOpen },
      })
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this recruitment post? This cannot be undone.")) {
      dispatch(deleteRecruitmentPost(id));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            Recruitment Posts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Open roles developers and designers can apply to.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Post"}
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Role Title"
              placeholder="e.g. Frontend Developer"
              error={errors.roleTitle?.message}
              {...register("roleTitle", { required: "Role title is required" })}
            />
            <Textarea
              label="Description"
              placeholder="What will this person work on?"
              error={errors.description?.message}
              {...register("description", { required: "Description is required" })}
            />
            <TagInput
              label="Required Skills"
              value={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="e.g. React, Tailwind"
            />
            <Button type="submit" loading={actionStatus === "loading"} className="mt-1">
              Publish Post
            </Button>
          </form>
        </Card>
      )}

      {fetchStatus === "loading" ? (
        <Loader label="Loading your posts" />
      ) : myPosts.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-muted">
            No recruitment posts yet. Create one to start receiving applications.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myPosts.map((post) => (
            <Card key={post._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {post.roleTitle}
                    </h3>
                    <Badge status={post.isOpen ? "Open" : "Closed"} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{post.description}</p>
                  {post.requiredSkills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/founder/recruitment/${post._id}/applications`}
                    className="mt-2 inline-block text-sm font-medium text-gold hover:underline"
                  >
                    View Applications →
                  </Link>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleOpen(post)}>
                    {post.isOpen ? "Close" : "Reopen"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(post._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}