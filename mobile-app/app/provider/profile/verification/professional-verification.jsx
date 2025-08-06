import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { useVerifyProviderProfessionalInfo } from "../../../../hooks/useProvider";
import { providerRoutes } from "../../../../lib/routes";

const ProfessionalInformationVerification = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    experienceYears: "",
    education: "",
    hasProfessionalQualification: null,
    certification: {
      name: "",
      issuingOrganization: "",
      yearObtained: "",
    },
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: updateProfessionalInfo } =
    useVerifyProviderProfessionalInfo();

  // Initialize form with user data if available
  useEffect(() => {
    if (user?.verification?.professional) {
      setFormData({
        experienceYears:
          user.verification.professional.experienceYears?.toString() || "",
        education: user.verification.professional.education || "",
        hasProfessionalQualification: user.verification.professional
          .certification?.name
          ? true
          : false,
        certification: {
          name: user.verification.professional.certification?.name || "",
          issuingOrganization:
            user.verification.professional.certification?.issuingOrganization ||
            "",
          yearObtained:
            user.verification.professional.certification?.yearObtained?.toString() ||
            "",
        },
      });
    }
  }, [user]);

  // Validate form whenever formData changes
  useEffect(() => {
    const validateForm = () => {
      const {
        experienceYears,
        education,
        hasProfessionalQualification,
        certification,
      } = formData;

      // Basic required fields
      if (
        !experienceYears ||
        isNaN(experienceYears) ||
        !education ||
        education.length > 200 ||
        hasProfessionalQualification === null
      ) {
        return false;
      }

      // If has professional qualification, validate certification fields
      if (hasProfessionalQualification) {
        if (!certification.name || !certification.issuingOrganization) {
          return false;
        }
        if (certification.yearObtained && isNaN(certification.yearObtained)) {
          return false;
        }
      }

      return true;
    };

    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCertificationChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      certification: {
        ...prev.certification,
        [name]: value,
      },
    }));
  };

  const handleQualificationSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      hasProfessionalQualification: value,
      // Reset certification if changing from Yes to No
      certification: value
        ? prev.certification
        : { name: "", issuingOrganization: "", yearObtained: "" },
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const submissionData = {
        experienceYears: parseInt(formData.experienceYears, 10),
        education: formData.education,
        status: "submitted",
        ...(formData.hasProfessionalQualification && {
          certification: {
            name: formData.certification.name,
            issuingOrganization: formData.certification.issuingOrganization,
            ...(formData.certification.yearObtained && {
              yearObtained: parseInt(formData.certification.yearObtained, 10),
            }),
          },
        }),
      };

      await updateProfessionalInfo(submissionData);
      Alert.alert("Success", "Professional information updated successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to update professional information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for required field indicator
  const RequiredField = ({ children }) => (
    <View className="flex-row items-center">
      <Text className="text-danger mr-1">*</Text>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader
        title={"Professional Information"}
        goBack={providerRoutes.PROVIDER_PROFILE}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-1 bg-white p-5">
          {/* Experience */}
          <View className="mb-5">
            <RequiredField>
              <Text className="text-base text-text font-pmedium">
                Working Experience (Years)
              </Text>
            </RequiredField>
            <FormField
              placeholder="Enter working experience in years"
              icon={null}
              value={formData.experienceYears}
              handleChangeText={(value) =>
                handleInputChange(
                  "experienceYears",
                  value.replace(/[^0-9]/g, "")
                )
              }
              keyboardType="numeric"
            />
            {formData.experienceYears && isNaN(formData.experienceYears) && (
              <Text className="text-danger text-xs mt-1">
                Please enter a valid number
              </Text>
            )}
          </View>

          {/* Education */}
          <View className="mb-5">
            <RequiredField>
              <Text className="text-base text-text font-pmedium">
                Education
              </Text>
            </RequiredField>
            <FormField
              placeholder="Enter education details (max 200 characters)"
              icon={null}
              value={formData.education}
              handleChangeText={(value) =>
                handleInputChange("education", value)
              }
              maxLength={200}
            />
            {formData.education.length > 200 && (
              <Text className="text-danger text-xs mt-1">
                Education cannot exceed 200 characters
              </Text>
            )}
          </View>

          {/* Professional Qualification */}
          <View className="mb-5">
            <RequiredField>
              <Text className="text-base text-text font-pmedium">
                Do you have Professional Qualification/Diploma?
              </Text>
            </RequiredField>
            <View className="flex-row items-center justify-between mt-3">
              <Pressable
                className={`rounded-xl p-3 w-[48%] ${
                  formData.hasProfessionalQualification === true
                    ? "bg-primary"
                    : "bg-gray-100"
                }`}
                onPress={() => handleQualificationSelect(true)}
              >
                <Text
                  className={`text-base text-center font-pmedium ${
                    formData.hasProfessionalQualification === true
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  Yes
                </Text>
              </Pressable>
              <Pressable
                className={`rounded-xl p-3 w-[48%] ${
                  formData.hasProfessionalQualification === false
                    ? "bg-primary"
                    : "bg-gray-100"
                }`}
                onPress={() => handleQualificationSelect(false)}
              >
                <Text
                  className={`text-base text-center font-pmedium ${
                    formData.hasProfessionalQualification === false
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  No
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Certifications Section */}
          {formData.hasProfessionalQualification && (
            <View className="mt-4">
              <Text className="text-base font-pmedium text-gray-800 mb-3">
                Certification Details
              </Text>

              {/* Certification Name */}
              <View className="mb-4">
                <RequiredField>
                  <Text className="text-sm font-pmedium text-gray-600">
                    Certification Name
                  </Text>
                </RequiredField>
                <FormField
                  placeholder="Enter certification name"
                  icon={null}
                  value={formData.certification.name}
                  handleChangeText={(value) =>
                    handleCertificationChange("name", value)
                  }
                />
              </View>

              {/* Issuing Organization */}
              <View className="mb-4">
                <RequiredField>
                  <Text className="text-sm font-pmedium text-gray-600">
                    Issuing Organization
                  </Text>
                </RequiredField>
                <FormField
                  placeholder="Enter issuing organization"
                  icon={null}
                  value={formData.certification.issuingOrganization}
                  handleChangeText={(value) =>
                    handleCertificationChange("issuingOrganization", value)
                  }
                />
              </View>

              {/* Year Obtained */}
              <View className="mb-2">
                <Text className="text-sm font-pmedium text-gray-600">
                  Year Obtained (Optional)
                </Text>
                <FormField
                  placeholder="Enter year obtained"
                  icon={null}
                  value={formData.certification.yearObtained}
                  handleChangeText={(value) =>
                    handleCertificationChange(
                      "yearObtained",
                      value.replace(/[^0-9]/g, "")
                    )
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3 gap-4">
          <CustomButton
            title="Cancel"
            containerStyles="flex-1 bg-secondary"
            textStyles="text-white"
            handlePress={() => router.replace(providerRoutes.PROVIDER_PROFILE)}
            disabled={isLoading}
          />
          <CustomButton
            title="Submit"
            containerStyles={`flex-1 bg-primary`}
            textStyles="text-white"
            handlePress={handleSubmit}
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default ProfessionalInformationVerification;
