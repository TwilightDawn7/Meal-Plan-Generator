"use client";

import { availablePlans } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast, { Toaster} from "react-hot-toast";


type SubscribeResponse = {
  url: string;
}

type SubscribeError = {
  error: string;
}

async function subscribeToPlan(
  planType: string, 
  userId: string, 
  email: string
): Promise<SubscribeResponse> {

  const response = await fetch("/api/checkout",{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        planType,
        userId,
        email,
      })
  })

  if(!response.ok){
    const errorData: SubscribeError = await response.json()
    throw new Error(errorData.error || "Something went wrong.")
  }

  const data: SubscribeResponse = await response.json();

  return data;
}

export default function Subscribe(){
  const {user} = useUser();
  const router = useRouter();

  const userId = user?.id;
  const email = user?.emailAddresses[0].emailAddress || "";

  const {mutate, isPending} = useMutation<SubscribeResponse, Error, {planType: string}>({
    mutationFn: async({planType}) => {
      if(!userId) {
        throw new Error("User not signed in.")
      }

      return subscribeToPlan(planType, userId, email);
    },

    onMutate: () => {
      toast.loading("Processing your subscription...", { id: "subscribe" });
    },

    onSuccess: (data) => {
      toast.success("Redirecting to checkout!", { id: "subscribe" });
      window.location.href = data.url;
    },

    onError: (error) => {
      toast.error("Something went wrong.") ;
    },

  });

  function handleSubscribe(planType: string) {
    if(!userId){
      router.push("/sign-up");
      return
    }

    mutate({planType});
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
  <div className="text-center mb-12">
    <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
    <p className="text-lg text-gray-600">
      Get started on our weekly plan or upgrade to monthly or yearly when you're ready.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {availablePlans.map((plan, key) => (
      <div
        key={key}
        className={`relative rounded-2xl shadow-lg p-8 border ${
          plan.isPopular
            ? "border-emerald-500 ring-2 ring-emerald-500"
            : "border-gray-200"
        } bg-white hover:scale-[1.02] transition-transform duration-200 ease-out`}
      >
        {plan.isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
            Most Popular
          </div>

        )}

        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{plan.name}</h3>

        <p className="text-3xl font-bold text-gray-900 mb-2">
          ${plan.amount}
          <span className="text-base font-semibold text-gray-800"> /{plan.interval}</span>
        </p>

        <p className="text-gray-600 mb-6">{plan.description}</p>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button 
        className={`w-full 
          ${plan.isPopular 
          ? `bg-emerald-500 text-white hover:bg-emerald-600` 
          : `bg-emerald-100 text-emerald-700 hover:bg-emerald-200`} 
          font-medium text-center py-2 px-4 rounded-lg transition 
          disabled:bg-gray-400 disabled:cursor-not-allowed
        `}
        
        onClick={() => handleSubscribe(plan.interval)}
        disabled={isPending}
        >
          {isPending ? "Please wait..." : `Subscribe to ${plan.name}`}
        </button>
      </div>
    ))}
  </div>
</div>

  );
}