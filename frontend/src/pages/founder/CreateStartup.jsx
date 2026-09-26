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
import { Rocket, ImagePlus } from "lucide-react";

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

  useEffect(() => {
    dispatch(fetchMyStartup());
  }, [dispatch]);

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
    if (logoFile) formData.append("logo", logoFile);

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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-ink">
          {isEditMode ? "My Startup" : "Create Your Startup"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEditMode
            ? "Update your startup's details. Developers, mentors, and investors see this."
            : "Tell us what you're building. You can edit this later."}
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-paper ring-1 ring-border">
                <Rocket className="h-6 w-6 text-muted" />
              </div>
            )}
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink hover:bg-paper">
                <ImagePlus className="h-4 w-4" />
                {logoPreview ? "Change logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              <p className="mt-1.5 text-xs text-muted">PNG, JPG or WEBP</p>
            </div>
          </div>

          <Input
            label="Startup Name"
            placeholder="e.g. TaskFlow AI"
            error={errors.name?.message}
            {...register("name", { required: "Startup name is required" })}
          />

          <Textarea
            label="Description"
            rows={4}
            placeholder="What problem are you solving? What have you built so far?"
            error={errors.description?.message}
            {...register("description", { required: "Description is required" })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Industry"
              placeholder="e.g. SaaS, Fintech"
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
                <option value="" disabled>Select a stage</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.stage && (
                <p className="text-xs text-danger">{errors.stage.message}</p>
              )}
            </div>
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

          <div className="flex justify-end">
            <Button type="submit" loading={actionStatus === "loading"}>
              {isEditMode ? "Save Changes" : "Create Startup"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}