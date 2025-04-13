import React from "react";
import OnboardingStep from "../../components/OnboardingStep";
import { useRouter } from "expo-router";
import { images } from "../../constants";

export default function Step3() {
  const router = useRouter();
  return (
    <OnboardingStep
      step={3}
      title="For Service Providers"
      image={images.step3}
      bullets={[
        "Create your free account",
        "Share details about your services",
        "Grow your business and earn more",
      ]}
      onNext={() => router.push("/onboarding/step4")}
    />
  );
}
