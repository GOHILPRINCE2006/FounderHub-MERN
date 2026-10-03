import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, clearAuthError } from "../../features/auth/authSlice";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ShieldCheck } from "lucide-react";

const ROLES = [
  { value: "founder", label: "Founder" },
  { value: "developer", label: "Developer / Designer" },
  { value: "mentor", label: "Mentor" },
  { value: "investor", label: "Investor" },
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const roleField = watch("role") || selectedRole;
  const needsVerification = roleField === "mentor" || roleField === "investor";

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center font-display text-xl font-semibold text-ink">
        Create your account
      </h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />

        <Input
          label="Phone"
          type="text"
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
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium text-ink">
            I am a...
          </label>
          <select
            id="role"
            className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink
              focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
              ${errors.role ? "border-danger" : "border-border"}`}
            {...register("role", {
              required: "Please select a role",
              onChange: (e) => setSelectedRole(e.target.value),
            })}
            defaultValue=""
          >
            <option value="" disabled>Select your role</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
        </div>

        {needsVerification && (
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
            <p>
              {roleField === "mentor" ? "Mentor" : "Investor"} accounts need
              admin verification before you can access your dashboard. You can
              sign up now — we&apos;ll notify you once you&apos;re verified.
            </p>
          </div>
        )}

        <Button type="submit" loading={status === "loading"} className="mt-1 w-full">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-gold-dark hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}