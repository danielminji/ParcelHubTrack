import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ParcelTrack - Join Our Platform",
  description: "Create your ParcelTrack account - Start tracking and managing parcels with ease",
};

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function SignUp() {
  return <SignUpForm />;
}
