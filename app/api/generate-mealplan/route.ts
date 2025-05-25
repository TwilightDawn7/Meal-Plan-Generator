import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openAI = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function POST(request: NextRequest){


  try{
    const {dietType, calories, allergies, cuisine, snacks, days} = await request.json()

    const prompt = `
You are a professional nutritionist. Create a ${days}-day meal plan in strict JSON format.

Requirements:
- Diet: ${dietType}
- Daily calories: ${calories}
- Allergies: ${allergies || "none"}
- Cuisine: ${cuisine || "any"}
- Include snacks: ${snacks ? "yes" : "no"}

Format each day like this:
{
  "Monday": {
    "Breakfast": "Meal - X calories",
    "Lunch": "Meal - X calories",
    "Dinner": "Meal - X calories",
    "Snacks": "Meal - X calories"
  },
  ...
}

✅ Return only valid JSON.
❌ No explanation.
❌ No extra text.
❌ No backticks.
❌ No markdown.

Respond only with JSON.
`;


    const response = await openAI.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free",
      messages: [
        {
          role: "user",
          content: prompt
        },
      ],

      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiContent = response.choices[0].message.content!.trim();
    console.log("Raw AI Response:", aiContent);

    const cleaned = aiContent
    .replace(/```json|```/g, "")
    .trim();

    let parsedMealPlan: {[days: string]: DailyMealPlan}

    try{
      parsedMealPlan = JSON.parse(cleaned)
    } catch (parseError){
      console.error("Parsing error:", parseError);
      console.error("Cleaned content:", cleaned);
      return NextResponse.json(
        {error: "Failed to parse meal plan. Pleasee try again."}, 
        {status: 500}
      );
    }

    if (typeof parsedMealPlan !== "object" || parsedMealPlan === null){
      return NextResponse.json(
        {error: "Failed to parse meal plan. Please try again."}, 
        {status: 500}
      );
    }

    return NextResponse.json({mealPlan: parsedMealPlan})

  } catch(error: any) {
    return NextResponse.json(
      {error: "Internal error."},
      {status: 500}
    )  
  }
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}