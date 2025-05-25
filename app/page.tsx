'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:py-16 lg:py-20">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center mb-20">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl text-white p-10 sm:p-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Smarter Eating with AI-Powered Meal Planning
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Personalized meal plans tailored to your diet, goals & taste — all powered by AI.
          </p>
          <Link
            href={isSignedIn ? '/mealplan' : '/sign-up'}
            className="inline-block bg-white text-emerald-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-100 transition"
          >
            {isSignedIn ? 'Generate My Plan' : 'Get Started Free'}
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="mt-2 text-gray-600">
            Just a few simple steps to receive your personalized weekly meal plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'Create an Account',
              desc: 'Sign up to access personalized plans and track your preferences.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.121 17.804z" />
                </svg>
              ),
            },
            {
              title: 'Set Your Preferences',
              desc: 'Tell us about your goals, allergies, and food preferences.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              ),
            },
            {
              title: 'Generate Your Plan',
              desc: 'Get a fresh, weekly meal plan optimized for you — instantly.',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ),
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 text-center flex flex-col items-center"
            >
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-center text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Ready to eat smarter?
        </h3>
        <Link
          href={isSignedIn ? '/mealplan' : '/sign-up'}
          className="inline-block bg-emerald-500 text-white font-medium px-6 py-3 rounded-full shadow-md hover:bg-emerald-600 transition"
        >
          {isSignedIn ? 'View My Meal Plan' : 'Start Now'}
        </Link>
      </section>
    </main>
  );
}
