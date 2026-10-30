
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  loginUser,
  clearAuthError,
  fetchCurrentUser,
} from "../../features/auth/authSlice";
import { fetchMyStartups } from "../../features/startup/startupSlice";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(clearAuthError());

    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchCurrentUser());

      // Redirect founder to their first startup.
      // If they have no startup, redirect to create page.
      if (result.payload.role === "founder") {
        const startupsResult = await dispatch(fetchMyStartups()).unwrap();

        if (startupsResult.length > 0) {
          navigate(`/founder/${startupsResult[0]._id}/dashboard`);
        } else {
          navigate("/founder/create");
        }
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-6">
      <h1 className="mb-6 text-center font-display text-xl font-semibold text-ink sm:text-2xl">
        Log in to your account
      </h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button
          type="submit"
          loading={status === "loading"}
          className="mt-2 w-full"
        >
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-gold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
