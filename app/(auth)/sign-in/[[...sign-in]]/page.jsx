import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="p-6 rounded-2xl shadow-lg bg-white">
        <SignIn redirectUrl="/dashboard" />
      </div>
    </div>
  );
}
