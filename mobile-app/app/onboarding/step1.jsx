import React from "react";
import OnboardingStep from "../../components/OnboardingStep";
import { useRouter } from "expo-router";
import { images } from "../../constants";

export default function Step1() {
  const router = useRouter();
  return (
    <OnboardingStep
      step={1}
      title="Get your tasks done effortlessly"
      image={images.step1}
      bullets={[
        "Immediately",
        "At extremely affordable prices",
        "With high standards",
        "With safety",
      ]}
      onNext={() => router.push("/onboarding/step2")}
    />
  );
}
