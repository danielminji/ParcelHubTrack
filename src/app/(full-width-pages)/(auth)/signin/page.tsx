import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | ParcelTrack - Modern Parcel Management",
  description: "Sign in to ParcelTrack - Your complete parcel tracking and management solution",
};

export default function SignIn() {
  return <SignInForm />;
}
