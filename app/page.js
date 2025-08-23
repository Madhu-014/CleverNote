"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    user && checkUser();
  }, [user]);

  const checkUser = async () => {
    await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl,
      userName: user?.fullName,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100 scroll-smooth">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="App Logo"
              width={150}
              height={150}
              className="rounded-md cursor-pointer"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <a href="#features" className="hover:text-black">
            Features
          </a>
          <a href="#solution" className="hover:text-black">
            Solution
          </a>
          <a href="#contact" className="hover:text-black">
            Contact Us
          </a>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/sign-in">
                <Button className="rounded-full px-6 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="rounded-full px-6 font-semibold"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20 flex-1">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Simplify <span className="text-red-600">PDF</span>{" "}
          <span className="text-blue-600">Note</span>-Taking <br />
          with <span className="text-black">AI-Powered</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          CleverNote helps you summarize, organize, and annotate PDFs effortlessly 
          using AI. Focus more on learning while we handle the rest.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/sign-up">
            <Button className="px-8 py-3 rounded-full text-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              variant="outline"
              className="px-8 py-3 rounded-full text-lg"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16 text-center bg-white"
      >
        <div>
          <h3 className="text-xl font-semibold">AI-Powered Summaries</h3>
          <p className="text-gray-500 mt-2">
            Get instant summaries of your PDFs, saving you hours of reading time.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Smart Annotations</h3>
          <p className="text-gray-500 mt-2">
            Highlight key insights and add notes with our intelligent annotation tools.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Organized Workspace</h3>
          <p className="text-gray-500 mt-2">
            Store, search, and categorize all your PDFs in one streamlined dashboard.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="px-8 py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold">Our Solution</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Traditional note-taking is messy and time-consuming. With CleverNote, 
          you upload your PDF, and our AI instantly generates structured summaries, 
          highlights important points, and organizes everything into your personal workspace.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-8 py-20 bg-white text-center">
        <h2 className="text-3xl font-bold">Get in Touch</h2>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Have questions or feedback? We’d love to hear from you.  
          Reach out anytime and let’s build a smarter way to take notes together.
        </p>
        <div className="mt-6">
          <a
            href="mailto:support@clevernote.com"
            className="text-blue-600 font-medium hover:underline"
          >
            madhusudhan.chandar@gmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CleverNote. All rights reserved.
      </footer>
    </div>
  );
}
