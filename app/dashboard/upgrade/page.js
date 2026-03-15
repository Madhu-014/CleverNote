"use client";

import React, { useState } from "react";
import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

function UpgradePlans() {
  const handleUpgradeClick = (e) => {
    e.preventDefault();
    toast.info("📅 Feature not available now. Coming soon!");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] px-2 py-10 md:px-0">
      <div className="reveal-pop panel-luxe relative mb-8 overflow-hidden rounded-3xl px-6 py-8 text-center md:px-10">
        <div className="float-soft absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="float-soft absolute -right-14 bottom-0 h-40 w-40 rounded-full bg-accent/28 blur-3xl" />

        <p className="relative inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <Crown className="h-3.5 w-3.5 text-primary" />
          Premium Access
        </p>

        <h2 className="relative mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Upgrade Your Plan
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-muted-foreground">
          Choose the plan that best fits your needs. Unlock unlimited PDF uploads
          and advanced features to maximize your productivity.
        </p>

        <div className="relative mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[
            ["Unlimited", "PDF uploads"],
            ["Priority", "Support queue"],
            ["Always On", "AI assistant"],
          ].map(([value, label], idx) => (
            <div key={label} className={`fade-rise rounded-xl border border-border/70 bg-background/70 px-3 py-2 ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
              <p className="text-sm font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Pick Your Plan
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Transparent pricing with premium-grade capabilities.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Unlimited Plan */}
        <div className="reveal-pop panel-luxe rich-card tilt-soft lift-on-hover relative overflow-hidden rounded-2xl p-8 ring-1 ring-primary/30">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Best Value
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Unlimited</h3>
            <p className="mt-2">
              <strong className="text-4xl font-bold text-foreground">
                $9.99
              </strong>
              <span className="ml-1 text-sm font-medium text-muted-foreground">
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
                <Check className="h-5 w-5 text-primary" />
                <span className="text-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgradeClick}
            className="mt-8 block w-full rounded-xl bg-primary px-6 py-3 text-center text-primary-foreground font-medium transition hover:brightness-105 cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>

        {/* Free Plan */}
        <div className="reveal-pop panel-luxe rich-card lift-on-hover rounded-2xl p-8 stagger-1">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Free</h3>
            <p className="mt-2">
              <strong className="text-4xl font-bold text-foreground">$0</strong>
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                /month
              </span>
            </p>
          </div>

          <ul className="mt-6 space-y-3">
            {["5 PDF Uploads", "Unlimited Notes Taking", "Email Support", "Help Center Access"].map(
              (feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-foreground/90">{feature}</span>
                </li>
              )
            )}
          </ul>

          <a
            href="#"
            className="mt-8 block rounded-xl border border-primary/40 bg-background/80 px-6 py-3 text-center font-medium text-primary hover:bg-accent/50 transition"
          >
            Current Plan
          </a>
        </div>
      </div>
    </div>
  );
}

export default UpgradePlans;
