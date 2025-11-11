"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load 3D animation - won't block initial page load
const Auth3DAnimation = dynamic(() => import("@/components/auth/Auth3DAnimation"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500">
      <div className="text-white text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
        <p>Loading 3D...</p>
      </div>
    </div>
  ),
});

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"RECIPIENT" | "OPERATOR">("RECIPIENT");
  const [hubs, setHubs] = useState<any[]>([]);
  const [selectedHub, setSelectedHub] = useState("");
  const [isLoadingHubs, setIsLoadingHubs] = useState(true);
  const router = useRouter();

  // Fetch available hubs on component mount
  React.useEffect(() => {
    const fetchHubs = async () => {
      try {
        const response = await fetch("/api/hubs");
        const result = await response.json();
        if (result.success) {
          setHubs(result.data);
          if (result.data.length > 0) {
            setSelectedHub(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hubs:", error);
      } finally {
        setIsLoadingHubs(false);
      }
    };
    fetchHubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("fname") as string,
      lastName: formData.get("lname") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      role: role,
      hubId: selectedHub,
    };

    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (!data.hubId) {
      setError("Please select a location/hub");
      setIsLoading(false);
      return;
    }

    if (!isChecked) {
      setError("You must agree to the Terms and Conditions");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/signin?registered=true");
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Form Section - Left Side */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar bg-white dark:bg-gray-900">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ChevronLeftIcon />
            Back to home
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 pb-10">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-bold text-gray-900 text-3xl dark:text-white sm:text-4xl">
                Create Account
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join us today and start tracking your parcels!
              </p>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <button suppressHydrationWarning className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 transition-all bg-white border-2 border-gray-200 rounded-xl px-6 hover:border-blue-300 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90 dark:hover:bg-gray-750 dark:hover:border-blue-600">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4" />
                    <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853" />
                    <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05" />
                    <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335" />
                  </svg>
                  Google
                </button>
                <button suppressHydrationWarning className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 transition-all bg-white border-2 border-gray-200 rounded-xl px-6 hover:border-blue-300 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white/90 dark:hover:bg-gray-750 dark:hover:border-blue-600">
                  <svg width="21" className="fill-current" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                  </svg>
                  X
                </button>
              </div>
              <div className="relative py-4 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 py-1 text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400">Or continue with</span>
                </div>
              </div>
              {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} suppressHydrationWarning>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1" suppressHydrationWarning>
                      <Label>First Name<span className="text-red-500">*</span></Label>
                      <Input type="text" id="fname" name="fname" placeholder="John" />
                    </div>
                    <div className="sm:col-span-1">
                      <Label>Last Name<span className="text-red-500">*</span></Label>
                      <Input type="text" id="lname" name="lname" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label>Email<span className="text-red-500">*</span></Label>
                    <Input type="email" id="email" name="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Phone<span className="text-red-500">*</span></Label>
                    <Input type="tel" id="phone" name="phone" placeholder="+60 12-345 6789" />
                  </div>
                  <div>
                    <Label>I am registering as<span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setRole("RECIPIENT")}
                        className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          role === "RECIPIENT"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white"> Recipient</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">I receive parcels</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("OPERATOR")}
                        className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          role === "OPERATOR"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white"> Operator</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">I manage parcels</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Location/Hub<span className="text-red-500">*</span></Label>
                    {isLoadingHubs ? (
                      <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                        <span className="text-sm text-gray-500">Loading locations...</span>
                      </div>
                    ) : hubs.length === 0 ? (
                      <div className="px-4 py-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                        No locations available. Please contact support.
                      </div>
                    ) : (
                      <select
                        value={selectedHub}
                        onChange={(e) => setSelectedHub(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                      >
                        {hubs.map((hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} - {hub.address}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {role === "RECIPIENT" 
                        ? "Select the location where you will receive parcels"
                        : "Select the location you will manage parcels at"}
                    </p>
                  </div>
                  <div>
                    <Label>Password<span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input placeholder="Enter your password" type={showPassword ? "text" : "password"} id="password" name="password" />
                      <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                        {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox className="w-5 h-5 mt-0.5" checked={isChecked} onChange={setIsChecked} />
                    <p className="inline-block text-sm font-normal text-gray-600 dark:text-gray-400">
                      I agree to the{" "}
                      <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Terms and Conditions</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Privacy Policy</Link>
                    </p>
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center w-full px-6 py-3.5 text-sm font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>Creating account...</>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </div>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Animation Section - Right Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900">
        <div className="absolute inset-0">
          <Auth3DAnimation />
        </div>
        <div className="absolute bottom-10 left-10 right-10 z-10 p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Join Our Parcel Tracking Platform
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Experience seamless parcel management with real-time tracking, instant notifications, and an intuitive dashboard.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Easy to use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
