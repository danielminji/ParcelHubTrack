/**
 * Password Reset Request Page
 * User enters email/phone to receive reset link
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import 3D animation with no SSR
const Auth3DAnimation = dynamic(() => import('@/components/auth/Auth3DAnimation'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
  ),
});

export default function ResetPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to send reset link');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background Animation */}
      <div className="absolute inset-0 w-full h-full">
        <Auth3DAnimation />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo/logo-dark.svg"
                alt="ParcelTrack"
                width={180}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/images/logo/logo.svg"
                alt="ParcelTrack"
                width={180}
                height={40}
                className="hidden dark:block"
              />
            </Link>
          </div>

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your email or phone number and we'll send you a link to reset your password
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="emailOrPhone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email or Phone Number
                  </label>
                  <input
                    id="emailOrPhone"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="john@example.com or +60123456789"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to Sign In */}
              <div className="mt-6 text-center">
                <Link
                  href="/signin"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Check Your Inbox
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We've sent a password reset link to <strong>{emailOrPhone}</strong>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                  If you don't see the email, check your spam folder or try again with a different email address.
                </p>
                <Link
                  href="/signin"
                  className="inline-block py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@parceltrack.com" className="text-blue-600 dark:text-blue-400 hover:underline">
            support@parceltrack.com
          </a>
        </p>
      </div>
    </div>
  );
}
