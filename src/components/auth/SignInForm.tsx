"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

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

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear form on component mount (after logout redirect)
  useEffect(() => {
    setEmailOrPhone('');
    setPassword('');
    setError('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Determine if input is email or phone
      const isEmail = emailOrPhone.includes('@');
      
      console.log('Attempting signin with:', { isEmail, emailOrPhone });
      
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [isEmail ? 'email' : 'phone']: emailOrPhone,
          password 
        }),
      });

      const data = await response.json();
      console.log('Signin response:', { status: response.status, data });

      if (!response.ok) {
        setError(data.error?.message || data.error || data.message || "Sign in failed");
        setIsLoading(false);
        return;
      }

      // Store JWT token and user data
      if (data.data?.token) {
        localStorage.setItem("token", data.data.token);
        console.log('Token stored');
      }
      
      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        console.log('User stored:', data.data.user.role);
      }

      const user = data.data?.user;
      if (user?.role === "ADMIN") {
        console.log('Redirecting to /admin');
        // Clear form before redirect
        setEmailOrPhone('');
        setPassword('');
        router.push("/admin");
      } else if (user?.role === "OPERATOR") {
        console.log('Redirecting to /operator/dashboard');
        setEmailOrPhone('');
        setPassword('');
        router.push("/operator/dashboard");
      } else if (user?.role === "RECIPIENT") {
        console.log('Redirecting to /recipient/dashboard');
        setEmailOrPhone('');
        setPassword('');
        router.push("/recipient/dashboard");
      }
    } catch (err) {
      console.error('Signin error:', err);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <ChevronLeftIcon />
            Back to homepage
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 pb-10">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Sign In</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and password to sign in!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">{error}</div>
            )}
            <div>
              <Label>Email or Phone <span className="text-error-500">*</span></Label>
              <Input 
                key={`email-${Date.now()}`}
                placeholder="john.doe@student.com or +60123456789" 
                type="text" 
                name="emailOrPhone" 
                onChange={(e) => setEmailOrPhone(e.target.value)} 
              />
            </div>
            <div>
              <Label>Password <span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input 
                  key={`password-${Date.now()}`}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  name="password" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                  {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-gray-700 text-sm dark:text-gray-400">Keep me logged in</span>
              </div>
              <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot password?</Link>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" disabled={isLoading || !emailOrPhone || !password}>{isLoading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
            Don't have an account? <Link href="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">Sign Up</Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative">
        <Auth3DAnimation />
      </div>
    </div>
  );
}
