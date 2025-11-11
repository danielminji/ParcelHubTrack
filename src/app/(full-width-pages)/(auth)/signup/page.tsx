import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ParcelTrack - Join Our Platform",
  description: "Create your ParcelTrack account - Start tracking and managing parcels with ease",
};

export default function SignUp() {
  return <SignUpForm />;
}
