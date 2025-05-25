"use client";

import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: string;
  days?: number;
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

async function generateMealPlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-mealplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export default function MealPlanDashboard() {
  const { mutate, isPending, data, isSuccess } = useMutation<MealPlanResponse, Error, MealPlanInput>({
    mutationFn: generateMealPlan,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      dietType: formData.get("dietType")?.toString() || "",
      calories: Number(formData.get("calories")) || 2000,
      allergies: formData.get("allergies")?.toString() || "",
      cuisine: formData.get("cuisine")?.toString() || "",
      snacks: formData.get("snacks")?.toString() || "",
      days: 7,
    };

    mutate(payload);
  }

  const daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
    if (!data?.mealPlan) return undefined;

    return data.mealPlan[day];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-6">AI Meal Plan Generator</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dietType" className="block text-sm font-medium text-gray-700">Diet Type</label>
              <input
                type="text"
                id="dietType"
                name="dietType"
                required
                placeholder="e.g. Vegetarian, Vegan, Keto"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Daily Calorie Goal</label>
              <input
                type="number"
                id="calories"
                name="calories"
                required
                placeholder="e.g. 2000"
                min={500}
                max={15000}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                required
                placeholder="e.g. Nuts, Dairy, None"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">Preferred Cuisine</label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                required
                placeholder="e.g. Italian, Indian, Chinese"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="snacks"
                name="snacks"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="snacks" className="ml-2 text-sm text-gray-700">Include Snacks</label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {isPending ? "Generating..." : "Generate Meal Plan"}
              </button>
            </div>
          </form>
        </div>

        {/* Meal Plan Output Section */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Weekly Meal Plan</h2>
          {data?.mealPlan && isSuccess ? (
    <div className="space-y-6">
      {daysOfTheWeek.map((day, key) => {
        const mealplan = getMealPlanForDay(day);
        return (
          <div key={key} className="border border-emerald-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-emerald-600 mb-3 border-b pb-1">{day}</h3>

            {mealplan ? (
              <div className="space-y-2 text-gray-800">
                <div>
                  <span className="font-medium text-emerald-700">Breakfast:</span> {mealplan.Breakfast}
                </div>
                <div>
                  <span className="font-medium text-emerald-700">Lunch:</span> {mealplan.Lunch}
                </div>
                <div>
                  <span className="font-medium text-emerald-700">Dinner:</span> {mealplan.Dinner}
                </div>
                {mealplan.Snacks && (
                  <div>
                    <span className="font-medium text-emerald-700">Snacks:</span> {mealplan.Snacks}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-500">No meal plan available for this day.</p>
            )}
          </div>
        );
      })}
    </div>
          ) : isPending ? (
            <div className="flex justify-center items-center h-32"><Spinner /></div>
          ) : (
            <p className="text-gray-500 text-center">Please generate a meal plan to see it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
