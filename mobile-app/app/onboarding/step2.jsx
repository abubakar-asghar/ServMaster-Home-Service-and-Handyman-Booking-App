import React from "react";
import OnboardingStep from "../../components/OnboardingStep";
import { useRouter } from "expo-router";
import { images } from "../../constants";

export default function Step2() {
  const router = useRouter();
  return (
    <OnboardingStep
      step={2}
      title="Easy to Use"
      image={images.step2}
      bullets={[
        "Select your desired service and location",
        "Get offers from nearby skilled professionals",
        "Hire the right service provider as per your need",
      ]}
      onNext={() => router.push("/onboarding/step3")}
    />
  );
}
