/**
 * Terms of Service Page
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: November 10, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using ParcelTrack, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use of Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              ParcelTrack provides a parcel tracking and management system for educational institutions and residential communities. You agree to use this service only for lawful purposes and in accordance with these Terms.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to misuse or abuse the service</li>
              <li>You will not attempt to gain unauthorized access to any portion of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Parcel Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Our service facilitates the tracking and management of parcels. We are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Lost, damaged, or stolen parcels</li>
              <li>Delays in parcel delivery by third-party couriers</li>
              <li>Contents of parcels handled through our system</li>
              <li>Disputes between recipients and senders</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Privacy and Data Protection
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your use of ParcelTrack is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              The service and its original content, features, and functionality are and will remain the exclusive property of ParcelTrack and its licensors. The service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In no event shall ParcelTrack, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-900 dark:text-white font-medium">ParcelTrack Support</p>
              <p className="text-gray-600 dark:text-gray-400">Email: support@parceltrack.com</p>
              <p className="text-gray-600 dark:text-gray-400">Phone: +60 12-345-6789</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign In
          </Link>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
