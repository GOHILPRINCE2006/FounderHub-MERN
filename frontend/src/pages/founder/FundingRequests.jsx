import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEligibleInvestors,
  fetchMyFundingRequests,
  createFundingRequest,
  clearFundingError,
} from "../../features/funding/fundingSlice";
import { fetchMyStartup } from "../../features/startup/startupSlice";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Plus, X, IndianRupee } from "lucide-react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatINR = (n) =>
  "₹" + Number(n).toLocaleString("en-IN");

export default function FundingRequests() {
  const dispatch = useDispatch();
  const { myStartup } = useSelector((state) => state.startup);
  const {
    eligibleInvestors,
    eligibleStatus,
    myRequests,
    myRequestsStatus,
    actionStatus,
    error,
  } = useSelector((state) => state.funding);

  const [showForm, setShowForm] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(clearFundingError());
    dispatch(fetchMyStartup());
    dispatch(fetchEligibleInvestors());
    dispatch(fetchMyFundingRequests());
  }, [dispatch]);

  const onSubmit = async (data) => {
    dispatch(clearFundingError());
    const result = await dispatch(
      createFundingRequest({
        investorId: data.investorId,
        amount: Number(data.amount),
        equityOffered: Number(data.equityOffered),
        purpose: data.purpose,
        message: data.message,
      })
    );
    if (createFundingRequest.fulfilled.match(result)) {
      reset();
      setShowForm(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 4000);
    }
  };

  if (!myStartup) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-xl font-semibold text-ink">Funding</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Request funding from investors who've connected with your startup.
        </p>
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            Create your startup first to request funding.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Funding</h1>
          <p className="mt-1 text-sm text-muted">
            Send funding requests to investors who've accepted your connection.
          </p>
        </div>
        <Button
          variant={showForm ? "outline" : "primary"}
          onClick={() => setShowForm((v) => !v)}
          disabled={eligibleInvestors.length === 0}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> New request
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {savedMessage && (
        <div className="mb-4 rounded-lg bg-success-bg px-4 py-2 text-sm text-success">
          Funding request sent successfully.
        </div>
      )}

      {eligibleInvestors.length === 0 && eligibleStatus === "succeeded" && (
        <Card className="mb-6">
          <p className="py-3 text-center text-sm text-muted">
            No eligible investors yet. Investors must accept your connection request
            before you can send them a funding request.
          </p>
        </Card>
      )}

      {showForm && eligibleInvestors.length > 0 && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="investorId" className="text-sm font-medium text-ink">
                Investor *
              </label>
              <select
                id="investorId"
                className={`rounded-lg border bg-surface px-3 py-2 text-sm text-ink
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-gold
                  ${errors.investorId ? "border-danger" : "border-border"}`}
                {...register("investorId", { required: "Please select an investor" })}
                defaultValue=""
              >
                <option value="" disabled>Select an investor</option>
                {eligibleInvestors.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.name}
                    {inv.company ? ` — ${inv.company}` : ""}
                  </option>
                ))}
              </select>
              {errors.investorId && (
                <p className="text-xs text-danger">{errors.investorId.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Amount (INR) *"
                type="number"
                min={1}
                placeholder="e.g. 500000"
                error={errors.amount?.message}
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 1, message: "Must be greater than 0" },
                })}
              />
              <Input
                label="Equity offered (%) *"
                type="number"
                step="0.01"
                min={0.01}
                max={100}
                placeholder="e.g. 5"
                error={errors.equityOffered?.message}
                {...register("equityOffered", {
                  required: "Equity is required",
                  min: { value: 0.01, message: "Must be greater than 0" },
                  max: { value: 100, message: "Cannot exceed 100" },
                })}
              />
            </div>

            <Input
              label="Purpose *"
              placeholder="What will this funding be used for?"
              error={errors.purpose?.message}
              {...register("purpose", { required: "Purpose is required" })}
            />

            <Textarea
              label="Message (optional)"
              rows={3}
              placeholder="Anything else you'd like to tell the investor?"
              {...register("message")}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={actionStatus === "loading"}>
                Send request
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Outgoing requests */}
      <h2 className="mb-3 font-display text-sm font-semibold text-ink">
        Your requests
      </h2>

      {myRequestsStatus === "loading" && myRequests.length === 0 ? (
        <Loader label="Loading your requests" />
      ) : myRequests.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            No funding requests sent yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myRequests.map((r) => (
            <Card key={r._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {r.investor?.name || "Unknown investor"}
                    </h3>
                    <Badge status={r.status} />
                  </div>
                  {r.investor?.company && (
                    <p className="text-xs text-muted">{r.investor.company}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-ink">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {formatINR(r.amount)}
                    </span>
                    <span className="text-muted">
                      for <span className="font-medium text-ink">{r.equityOffered}%</span> equity
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-ink">{r.purpose}</p>
                  {r.message && (
                    <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-muted">
                      "{r.message}"
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted">
                    Sent {formatDate(r.createdAt)}
                    {r.respondedAt && ` · Responded ${formatDate(r.respondedAt)}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}