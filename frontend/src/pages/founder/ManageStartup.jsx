import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateStartup,
  createStartup,
  clearStartupError,
} from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import TagInput from "../../components/common/TagInput";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import { Rocket, ImagePlus, Lock, Globe } from "lucide-react";

const STAGES = ["Idea", "MVP", "Funded", "Scaling"];
const FUNDING = ["Bootstrapped", "Pre-seed", "Seed", "Raised"];

export default function ManageStartup() {
  const { startupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { myStartups, actionStatus, error } = useSelector((state) => state.startup);
  
  // If there is no ID in the URL, we are creating a new startup.
  const isEditMode = Boolean(startupId);
  const myStartup = isEditMode ? myStartups.find((s) => s._id === startupId) : null;

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredRoles, setRequiredRoles] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Populate the form when the startup is found (only in Edit mode)
  useEffect(() => {
    if (isEditMode && myStartup) {
      reset({
        name: myStartup.name || "",
        tagline: myStartup.tagline || "",
        industry: myStartup.industry || "",
        stage: myStartup.stage || "",
        location: myStartup.location || "",
        website: myStartup.website || "",
        problem: myStartup.problem || "",
        solution: myStartup.solution || "",
        teamSize: myStartup.teamSize ?? 1,
        foundingYear: myStartup.foundingYear ?? "",
        fundingStatus: myStartup.fundingStatus || "",
        traction: myStartup.traction || "",
      });
      setRequiredSkills(myStartup.requiredSkills || []);
      setRequiredRoles(myStartup.requiredRoles || []);
      setLookingFor(myStartup.lookingFor || []);
      setTechnologies(myStartup.technologies || []);
      setLogoPreview(myStartup.logo || null);
    }
  }, [isEditMode, myStartup, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    dispatch(clearStartupError());
    setSavedMessage(false);

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });
    formData.append("requiredSkills", JSON.stringify(requiredSkills));
    formData.append("requiredRoles", JSON.stringify(requiredRoles));
    formData.append("lookingFor", JSON.stringify(lookingFor));
    formData.append("technologies", JSON.stringify(technologies));
    if (logoFile) formData.append("logo", logoFile);

    if (isEditMode) {
      const result = await dispatch(updateStartup({ id: startupId, formData }));
      if (updateStartup.fulfilled.match(result)) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 4000);
      }
    } else {
      const result = await dispatch(createStartup(formData));
      if (createStartup.fulfilled.match(result)) {
        navigate(`/founder/${result.payload._id}/dashboard`);
      }
    }
  };

  // Only show loader if we are in edit mode and still waiting for data
  if (isEditMode && !myStartup) {
    return <Loader label="Loading startup details" full />;
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            {isEditMode ? "Startup Settings" : "Launch a New Startup"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditMode 
              ? "Update your startup's public and private details."
              : "Fill in the details below to launch your new startup."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {savedMessage && (
        <div className="mb-4 rounded-lg bg-success-bg px-4 py-2 text-sm text-success">
          Startup updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* ===== PUBLIC ===== */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Public details
            </h2>
            <span className="text-xs text-muted">— everyone can see these</span>
          </div>

          <div className="flex flex-col gap-4">
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
              label="Startup Name *"
              placeholder="e.g. TaskFlow AI"
              error={errors.name?.message}
              {...register("name", { required: "Startup name is required" })}
            />

            <Input
              label="Tagline *"
              placeholder="One line that describes your startup"
              maxLength={120}
              error={errors.tagline?.message}
              {...register("tagline", { required: "Tagline is required" })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Industry *"
                placeholder="e.g. SaaS, Fintech"
                error={errors.industry?.message}
                {...register("industry", { required: "Industry is required" })}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="stage" className="text-sm font-medium text-ink">
                  Stage *
                </label>
                <select
                  id="stage"
                  className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                    ${errors.stage ? "border-danger" : "border-border"}`}
                  {...register("stage", { required: "Please select a stage" })}
                >
                  <option value="" disabled>Select a stage</option>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.stage && <p className="text-xs text-danger">{errors.stage.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Location"
                placeholder="e.g. Ahmedabad, India or Remote"
                {...register("location")}
              />
              <Input
                label="Website"
                placeholder="https://..."
                {...register("website")}
              />
            </div>

            <TagInput
              label="Required Skills *"
              value={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="e.g. React, Node.js"
            />

            <TagInput
              label="Required Roles *"
              value={requiredRoles}
              onChange={setRequiredRoles}
              placeholder="e.g. developer, designer"
            />

            <TagInput
              label="Looking For *"
              value={lookingFor}
              onChange={setLookingFor}
              placeholder="e.g. Co-founder, Early hire"
            />
          </div>
        </Card>

        {/* ===== PRIVATE ===== */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gold-dark" />
            <h2 className="font-display text-sm font-semibold text-ink">
              Private details
            </h2>
            <span className="text-xs text-muted">
              — only you, your team, and approved connections see these
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Textarea
              label="Problem Statement *"
              rows={4}
              placeholder="What problem are you solving? Who has this problem?"
              error={errors.problem?.message}
              {...register("problem", { required: "Problem statement is required" })}
            />

            <Textarea
              label="Solution Approach *"
              rows={4}
              placeholder="How do you plan to solve it? What's your approach?"
              error={errors.solution?.message}
              {...register("solution", { required: "Solution approach is required" })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Team Size"
                type="number"
                min={1}
                placeholder="1"
                {...register("teamSize")}
              />
              <Input
                label="Founding Year"
                type="number"
                min={2000}
                max={2100}
                placeholder="e.g. 2026"
                {...register("foundingYear")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fundingStatus" className="text-sm font-medium text-ink">
                Funding Status
              </label>
              <select
                id="fundingStatus"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                {...register("fundingStatus")}
              >
                <option value="">Not specified</option>
                {FUNDING.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <Textarea
              label="Traction"
              rows={3}
              placeholder="Users, revenue, waitlist, pilots — anything you've achieved"
              {...register("traction")}
            />

            <TagInput
              label="Technologies"
              value={technologies}
              onChange={setTechnologies}
              placeholder="e.g. React, Node.js, AWS"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={actionStatus === "loading"}>
            {isEditMode ? "Save Changes" : "Create Startup"}
          </Button>
        </div>
      </form>
    </div>
  );
}