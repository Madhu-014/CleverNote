import React from "react";
import { Check } from "lucide-react";

function UpgradePlans() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade Your Plan
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. Unlock unlimited PDF uploads
          and advanced features to maximize your productivity.
        </p>
      </div>

      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Unlimited Plan */}
        <div className="rounded-2xl border border-indigo-600 bg-white p-8 shadow-lg ring-2 ring-indigo-600 hover:shadow-xl transition">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Unlimited</h3>
            <p className="mt-2">
              <strong className="text-4xl font-bold text-gray-900">
                $9.99
              </strong>
              <span className="ml-1 text-sm font-medium text-gray-600">
                one-time
              </span>
            </p>
          </div>

          <ul className="mt-6 space-y-3">
            {[
              "Unlimited PDF Uploads",
              "Unlimited Notes Taking",
              "Priority Email Support",
              "Help Center Access",
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-indigo-600" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="mt-8 block rounded-xl bg-indigo-600 px-6 py-3 text-center text-white font-medium hover:bg-indigo-700 transition"
          >
            Upgrade Now
          </a>
        </div>

        {/* Free Plan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Free</h3>
            <p className="mt-2">
              <strong className="text-4xl font-bold text-gray-900">$0</strong>
              <span className="ml-1 text-sm font-medium text-gray-600">
                /month
              </span>
            </p>
          </div>

          <ul className="mt-6 space-y-3">
            {["5 PDF Uploads", "Unlimited Notes Taking", "Email Support", "Help Center Access"].map(
              (feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              )
            )}
          </ul>

          <a
            href="#"
            className="mt-8 block rounded-xl border border-indigo-600 bg-white px-6 py-3 text-center font-medium text-indigo-600 hover:bg-indigo-50 transition"
          >
            Current Plan
          </a>
        </div>
      </div>
    </div>
  );
}

export default UpgradePlans;
