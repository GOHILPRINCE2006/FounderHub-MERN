import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyStartup,
  createStartup,
  updateStartup,
  clearStartupError,
} from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import TagInput from "../../components/common/TagInput";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";

const STAGES = ["Idea", "MVP", "Funded", "Scaling"];

export default function CreateStartup() {
  const dispatch = useDispatch();
  const { myStartup, fetchStatus, actionStatus, error } = useSelector(
    (state) => state.startup
  );

  const isEditMode = Boolean(myStartup);

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredRoles, setRequiredRoles] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load the founder's existing startup once on mount, if any.
  useEffect(() => {
    dispatch(fetchMyStartup());
  }, [dispatch]);

  // Once loaded, pre-fill the form for edit mode.
  useEffect(() => {
    if (myStartup) {
      reset({
        name: myStartup.name,
        description: myStartup.description,
        industry: myStartup.industry,
        stage: myStartup.stage,
      });
      setRequiredSkills(myStartup.requiredSkills || []);
      setRequiredRoles(myStartup.requiredRoles || []);
      setLogoPreview(myStartup.logo || null);
    }
  }, [myStartup, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    dispatch(clearStartupError());

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("industry", data.industry);
    formData.append("stage", data.stage);
    formData.append("requiredSkills", JSON.stringify(requiredSkills));
    formData.append("requiredRoles", JSON.stringify(requiredRoles));
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (isEditMode) {
      dispatch(updateStartup({ id: myStartup._id, formData }));
    } else {
      dispatch(createStartup(formData));
    }
  };

  if (fetchStatus === "loading") {
    return <Loader label="Loading your startup" full />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">
        {isEditMode ? "Edit Your Startup" : "Create Your Startup"}
      </h1>
      <p className="mb-6 text-sm text-muted">
        {isEditMode
          ? "Update your startup's details below."
          : "Tell us about what you're building — this is what developers, mentors, and investors will see."}
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Startup Name"
            placeholder="e.g. TaskFlow AI"
            error={errors.name?.message}
            {...register("name", { required: "Startup name is required" })}
          />

          <Textarea
            label="Description"
            placeholder="What problem are you solving? What have you built so far?"
            error={errors.description?.message}
            {...register("description", { required: "Description is required" })}
          />

          <Input
            label="Industry"
            placeholder="e.g. SaaS, Fintech, EdTech"
            error={errors.industry?.message}
            {...register("industry", { required: "Industry is required" })}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="stage" className="text-sm font-medium text-ink">
              Stage
            </label>
            <select
              id="stage"
              className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                ${errors.stage ? "border-danger" : "border-border"}`}
              {...register("stage", { required: "Please select a stage" })}
              defaultValue=""
            >
              <option value="" disabled>
                Select a stage
              </option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.stage && <p className="text-xs text-danger">{errors.stage.message}</p>}
          </div>

          <TagInput
            label="Required Skills"
            value={requiredSkills}
            onChange={setRequiredSkills}
            placeholder="e.g. React, Node.js"
          />

          <TagInput
            label="Required Roles"
            value={requiredRoles}
            onChange={setRequiredRoles}
            placeholder="e.g. developer, designer"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Logo</label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="mb-2 h-16 w-16 rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleLogoChange}
              className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
            />
          </div>

          <Button type="submit" loading={actionStatus === "loading"} className="mt-2">
            {isEditMode ? "Save Changes" : "Create Startup"}
          </Button>
        </form>
      </Card>
    </div>
  );
}