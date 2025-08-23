import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

function WorkspaceHeader({ fileName }) {
  return (
    <div className="relative p-4 flex items-center shadow-md">
      {/* Left side: logo → Dashboard */}
      <div className="flex-shrink-0">
        <Link href="/dashboard">
          <Image
            src="/logo.svg"
            alt="logo"
            width={140}
            height={100}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Center: file name */}
      <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold">
        {fileName}
      </h2>

      {/* Right side: user button */}
      <div className="ml-auto">
        <UserButton />
      </div>
    </div>
  );
}

export default WorkspaceHeader;
