/**
 * Landing Page - Guest Users
 * Modern landing page with smooth animations and guest tracking
 */

'use client';

import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import TrackingSection from '@/components/landing/TrackingSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />
      <HeroSection />
      <TrackingSection />
      <HowItWorksSection />
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="benefits">
        <BenefitsSection />
      </section>
      <SocialProofSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
