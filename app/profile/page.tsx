"use client";

import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/nextjs";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function fetchSubscriptionStatus() {
  const response = await fetch("/api/profile/subscription-status");
  return response.json();
}

async function updatePlan(newPlan: string) {
  
  const response = await fetch("/api/profile/change-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({newPlan}),
  });
  return response.json();
}

async function unsubscribe() {
  
  const response = await fetch("/api/profile/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const queryClient = useQueryClient();

  const router = useRouter();

  const {
    data: subscription,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscriptionStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
  
  const {
    data: updatedPlan, 
    mutate: updatePlanMutation,
    isPending: isUpdatePlanPending,
  } = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
      toast.success("Subscription plan updated successfully!")
      refetch();
    },
    onError: () => {
      toast.success("Error updating plan.")
    }
  })

  const {
    data: canceledPlan, 
    mutate: unsubscribeMutation,
    isPending: isUnsubscribePlanPending,
  } = useMutation({
    mutationFn: unsubscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription"]
      });
      router.push("/subscribe")
    },
    onError: () => {
      toast.success("Error unsubscribing.")
    }
  })




  const currentPlan = availablePlans.find(
    (plan) => plan.interval === subscription?.subscription.subscriptionTier
  );

  function handleUpdatePlan() {
    if( selectedPlan) {
      updatePlanMutation(selectedPlan)
    }

    setSelectedPlan("")
  }

  function handleUnsubscribe() {
    if(confirm("Are your sure you want to unsubscribe? You will lose to premiem features.")){
      unsubscribeMutation();
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        <Spinner /> <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 font-medium">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">
  <div className="flex flex-col lg:flex-row gap-10">
    {/* Left Column */}
    <div className="flex-1 space-y-10">
      {/* Profile Info */}
      <div className="flex items-center space-x-6">
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Subscription Info */}
      <div>
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">Subscription Details</h2>
        {isLoading ? (
          <div className="flex items-center text-gray-600">
            <Spinner /> <span className="ml-2">Loading subscription details...</span>
          </div>
        ) : isError ? (
          <p className="text-red-600">{error?.message}</p>
        ) : subscription ? (
          <div className="bg-emerald-50 p-4 rounded-lg space-y-2 border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800">Current Plan</h3>
            {currentPlan ? (
              <>
                <p>
                  <span className="font-bold">Plan:</span> {currentPlan.name}
                </p>
                <p>
                  <span className="font-bold">Amount:</span> ${currentPlan.amount} {currentPlan.currency}
                </p>
                <p>
                  <span className="font-bold">Status:</span> Active
                </p>
              </>
            ) : (
              <p className="text-yellow-700">Current Plan not found.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">You are not subscribed to any plan.</p>
        )}
      </div>
    </div>

    {/* Right Column - Change Plan */}
    <div className="w-full lg:w-[350px] bg-gray-50 p-6 rounded-2xl shadow border border-emerald-200 h-fit">
      <h3 className="text-xl font-semibold mb-4 text-emerald-800">Change Subscription Plan</h3>

      {currentPlan && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a New Plan
          </label>
          <select
            defaultValue={currentPlan?.interval}
            disabled={isUpdatePlanPending}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedPlan(event.target.value)
            }
            className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          >
            <option value="" disabled>
              Select a New Plan
            </option>
            {availablePlans.map((plan, key) => (
              <option key={key} value={plan.interval}>
                {plan.name} - ${plan.amount} / {plan.interval}
              </option>
            ))}
          </select>

          <button
            onClick={handleUpdatePlan}
            disabled={isUpdatePlanPending}
            className="w-full bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            Save Change
          </button>

          {isUpdatePlanPending && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Spinner />
              <span>Updating Plan...</span>
            </div>
          )}
        </>
      )}

      <div className="w-full mt-10 bg-red-50 border border-red-200 p-6 rounded-2xl shadow-md">
  <h3 className="text-xl font-semibold text-red-700 mb-4">Unsubscribe</h3>

  <p className="text-sm text-red-600 mb-4">
    This will cancel your current subscription and you will lose access at the end of the billing period.
  </p>

  <button
    onClick={handleUnsubscribe}
    disabled={isUnsubscribePlanPending}
    className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
  >
    {isUnsubscribePlanPending ? "Unsubscribing..." : "Unsubscribe"}
  </button>
</div>

    </div>
  </div>
</div>

    </div>
  );
}
