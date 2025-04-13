import React from "react";
import OnboardingStep from "../../components/OnboardingStep";
import { useRouter } from "expo-router";
import { images } from "../../constants";

export default function Step4() {
  const router = useRouter();

  return (
    <OnboardingStep
      step={4}
      title="You're All Set!"
      image={images.step4}
      bullets="Let's get started"
      onNext={() => router.push("/auth/select-role")}
    />
  );
}
