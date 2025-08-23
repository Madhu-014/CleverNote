"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Dashboard() {
  const { user } = useUser();

  // Fetch files belonging to the logged-in user
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  // Placeholder array while loading
  const placeholders = Array.from({ length: 6 });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="font-bold text-3xl text-gray-800">📂 Your Workspace</h2>
        <p className="text-gray-500 text-sm">
          {fileList ? `${fileList.length} file(s)` : "Loading..."}
        </p>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {fileList
          ? fileList.map((file, index) => (
              <Link
                key={file.fileId || index}
                href={`/workspace/${file.fileId}`}
                className="group flex flex-col items-center justify-center p-6 bg-white shadow-sm rounded-xl border hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all"
              >
                <div className="w-20 h-20 flex items-center justify-center bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                  <Image src="/pdf.png" alt="file" width={50} height={50} />
                </div>
                <h2 className="mt-4 font-medium text-base text-center text-gray-700 group-hover:text-blue-600 line-clamp-2">
                  {file.fileName}
                </h2>
              </Link>
            ))
          : placeholders.map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-white shadow-sm rounded-xl border animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-300 rounded-lg mb-3"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default Dashboard;
