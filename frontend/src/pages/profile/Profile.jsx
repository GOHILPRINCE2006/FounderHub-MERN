import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  clearProfileError,
} from "../../features/profile/profileSlice";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import TagInput from "../../components/common/TagInput";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Camera, Code2, Briefcase, Globe } from "lucide-react";

const AVAILABILITY = ["Full-time", "Part-time", "Internship"];

export default function Profile() {
  const dispatch = useDispatch();
  const {
    data: profile,
    fetchStatus,
    actionStatus,
    error,
  } = useSelector((state) => state.profile);

  const [skills, setSkills] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        website: profile.website || "",
        experience: profile.experience || "",
        about: profile.about || "",
        availability: profile.availability || "",
        expertise: profile.expertise || "",
        yearsOfExperience: profile.yearsOfExperience ?? "",
        sessionPrice: profile.sessionPrice ?? "",  
        currentRole: profile.currentRole || "",
        company: profile.company || "",
        investmentFocus: profile.investmentFocus || "",
        ticketSize: profile.ticketSize || "",
      });
      setSkills(profile.skills || []);
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile, reset]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      await dispatch(uploadAvatar(file));
    }
  };

  const onSubmit = async (data) => {
    dispatch(clearProfileError());
    setSavedMessage(false);
    const payload = {
      name: data.name,
      phone: data.phone,
      location: data.location,
      github: data.github,
      linkedin: data.linkedin,
      website: data.website,
      experience: data.experience,
      about: data.about,
      skills,
    };

    // Only send the role-specific block that belongs to this user.
    if (profile?.role === "developer") {
      payload.availability = data.availability || "";
    } else if (profile?.role === "mentor") {
      payload.expertise = data.expertise || "";
      payload.yearsOfExperience =
        data.yearsOfExperience === "" ? 0 : Number(data.yearsOfExperience);
      payload.currentRole = data.currentRole || "";
      payload.company = data.company || "";
      payload.sessionPrice =
      data.sessionPrice === "" ? 0 : Number(data.sessionPrice); 
    } else if (profile?.role === "investor") {
      payload.investmentFocus = data.investmentFocus || "";
      payload.ticketSize = data.ticketSize || "";
      payload.company = data.company || "";
    }

    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) {
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  if (fetchStatus === "loading" && !profile) {
    return <Loader label="Loading profile" full />;
  }

  const role = profile?.role;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-xl font-semibold text-ink">My Profile</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        This is what other users see about you.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {savedMessage && (
        <div className="mb-4 rounded-lg bg-success-bg px-4 py-2 text-sm text-success">
          Profile updated successfully.
        </div>
      )}

      <Card>
        {/* Avatar header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-semibold text-white">
                {profile?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink hover:bg-paper">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-ink">
              {profile?.name}
            </p>
            <p className="text-sm text-muted">{profile?.email}</p>
            <p className="font-mono text-xs uppercase text-muted">{role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* --- Identity --- */}
          <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-ink">
              Identity
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Full Name *"
                error={errors.name?.message}
                {...register("name", { required: "Name is required" })}
              />
              <Input
                label="Email (locked)"
                value={profile?.email || ""}
                disabled
                readOnly
                className="cursor-not-allowed bg-paper text-muted"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Phone *"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  error={errors.phone?.message}
                  {...register("phone", {
                    required: "Phone is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone must be exactly 10 digits",
                    },
                  })}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  }}
                />
                <Input
                  label="Location"
                  placeholder="e.g. Ahmedabad, India"
                  {...register("location")}
                />
              </div>
            </div>
          </section>

          {/* --- Role-specific --- */}
          {role === "developer" && (
            <section>
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">
                Developer details
              </h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="availability" className="text-sm font-medium text-ink">
                  Availability *
                </label>
                <select
                  id="availability"
                  className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                    ${errors.availability ? "border-danger" : "border-border"}`}
                  {...register("availability", {
                    required: "Availability is required",
                  })}
                  defaultValue=""
                >
                  <option value="" disabled>Select availability</option>
                  {AVAILABILITY.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {errors.availability && (
                  <p className="text-xs text-danger">{errors.availability.message}</p>
                )}
              </div>
            </section>
          )}

                    {role === "mentor" && (
            <section>
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">
                Mentor details
              </h3>
              <div className="flex flex-col gap-4">
                <Input
                  label="Current Role *"
                  placeholder="e.g. Senior Engineer"
                  error={errors.currentRole?.message}
                  {...register("currentRole", { required: "Current role is required" })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Company *"
                    placeholder="e.g. Google"
                    error={errors.company?.message}
                    {...register("company", { required: "Company is required" })}
                  />
                  <Input
                    label="Years of Experience *"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    error={errors.yearsOfExperience?.message}
                    {...register("yearsOfExperience", {
                      required: "Years of experience is required",
                      min: { value: 0, message: "Cannot be negative" },
                    })}
                  />
                </div>
                <Input
                  label="Expertise *"
                  placeholder="e.g. Product management, SaaS, Fundraising"
                  error={errors.expertise?.message}
                  {...register("expertise", { required: "Expertise is required" })}
                />
                <Input
                  label="Session price (INR) *"
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  error={errors.sessionPrice?.message}
                  {...register("sessionPrice", {
                    required: "Session price is required",
                    min: { value: 1, message: "Must be at least ₹1" },
                  })}
                />
              </div>
            </section>
          )}

          {role === "investor" && (
            <section>
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">
                Investor details
              </h3>
              <div className="flex flex-col gap-4">
                <Input
                  label="Fund / Company *"
                  placeholder="e.g. Acme Ventures"
                  error={errors.company?.message}
                  {...register("company", { required: "Company is required" })}
                />
                <Input
                  label="Investment Focus *"
                  placeholder="e.g. SaaS, Fintech, AI"
                  error={errors.investmentFocus?.message}
                  {...register("investmentFocus", {
                    required: "Investment focus is required",
                  })}
                />
                <Input
                  label="Ticket Size"
                  placeholder="e.g. $10k – $50k"
                  {...register("ticketSize")}
                />
              </div>
            </section>
          )}

          {/* --- Links --- */}
          <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-ink">
              Links
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 shrink-0 text-muted" />
                <Input
                  className="flex-1"
                  placeholder="github.com/username"
                  {...register("github")}
                />
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 shrink-0 text-muted" />
                <Input
                  className="flex-1"
                  placeholder="linkedin.com/in/username"
                  {...register("linkedin")}
                />
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 shrink-0 text-muted" />
                <Input
                  className="flex-1"
                  placeholder="your-site.com"
                  {...register("website")}
                />
              </div>
            </div>
          </section>

          {/* --- About --- */}
          <section>
            <h3 className="mb-3 font-display text-sm font-semibold text-ink">
              About you
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Experience"
                placeholder="e.g. 2nd year Computer Engineering student"
                {...register("experience")}
              />
              <Textarea
                label="About *"
                rows={4}
                placeholder="Tell others a bit about yourself"
                error={errors.about?.message}
                {...register("about", { required: "About is required" })}
              />
              <TagInput
                label="Skills"
                value={skills}
                onChange={setSkills}
                placeholder="e.g. React, Node.js"
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" loading={actionStatus === "loading"}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}