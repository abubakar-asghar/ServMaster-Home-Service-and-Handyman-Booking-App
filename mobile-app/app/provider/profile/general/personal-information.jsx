import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import TabHeader from "../../../../components/ui/TabHeader";
import FormField from "../../../../components/ui/FormField";
import CustomButton from "../../../../components/ui/CustomButton";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { useUpdateProviderPersonalInfo } from "../../../../hooks/useProvider";
import CustomDropdown from "../../../../components/ui/CustomDropdown";
import { providerRoutes } from "../../../../lib/routes";

const ErrorText = ({ error }) => {
  return (
    <Text className="text-red-500 font-pregular text-sm mt-1 ml-2">
      {error}
    </Text>
  );
};

const ProviderPersonalInfo = () => {
  const [errors, setErrors] = useState({});

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    whatsapp: user?.personalInfo?.whatsapp || "",
    email: user?.personalInfo?.email || "",
    gender: user?.personalInfo?.gender || "",
  });

  const { mutateAsync: updateProviderPersonalInfo, isPending } =
    useUpdateProviderPersonalInfo();

  const getGenderFormat = {
    male: "Male",
    female: "Female",
    prefer_not_to_say: "Prefer not to say",
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (formData.whatsapp && !/^\d{11}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Phone number must be exactly 11 digits.";
    } else if (formData.whatsapp && !/^03\d{9}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Phone number must start with 03.";
    }

    if (
      formData.email &&
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Set undefined for empty or null fields
  const sanitizeFormData = (data) => {
    const sanitizedData = { ...data };

    for (const key in sanitizedData) {
      if (sanitizedData[key] === "" || sanitizedData[key] === null) {
        sanitizedData[key] = undefined;
      }
    }

    return sanitizedData;
  };

  const handleUpdatePersonalInfo = async () => {
    if (!validateForm()) return;

    try {
      const sanitizedData = sanitizeFormData(formData);
      console.log("Sanitized Data:", sanitizedData);
      const response = await updateProviderPersonalInfo(sanitizedData);

      if (!response.success) {
        console.log(response.message || "Updation failed. Please try again.");
      }
    } catch (error) {
      console.log("An error occurred. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <TabHeader
        title={"Personal Information"}
        goBack={providerRoutes.PROVIDER_PROFILE}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white p-5">
          {/* FullName */}
          <FormField
            title="Full Name"
            placeholder="Enter your full name"
            icon={null}
            value={formData.fullName}
            handleChangeText={(value) => {
              setFormData({ ...formData, fullName: value });
            }}
          />
          {errors.fullName && <ErrorText error={errors.fullName} />}

          {/* Mobile Number */}
          <FormField
            title="Mobile Number"
            placeholder="Enter your mobile number"
            icon={null}
            value={formData.phone}
            handleChangeText={(value) => {
              setFormData({ ...formData, phone: value });
            }}
            otherStyles="mt-5"
            editable={false}
          />

          {/* Whatsapp Number */}
          <FormField
            title="Whatsapp"
            placeholder="Enter your whatsapp number"
            icon={null}
            value={formData.whatsapp}
            handleChangeText={(value) => {
              setFormData({ ...formData, whatsapp: value });
            }}
            otherStyles="mt-5"
          />
          {errors.whatsapp && <ErrorText error={errors.whatsapp} />}

          {/* Email */}
          <FormField
            title="Email"
            placeholder="Enter your email address"
            icon={null}
            value={formData.email}
            handleChangeText={(value) => {
              setFormData({ ...formData, email: value });
            }}
            otherStyles="mt-5"
          />
          {errors.email && <ErrorText error={errors.email} />}

          {/* Gender Dropdown */}
          <View className="mt-5">
            <Text className="text-base text-text font-pmedium">Gender</Text>
            <CustomDropdown
              placeholder="Select Gender"
              selectedValue={formData.gender || ""}
              options={[
                // { key: "1", value: "Male" },
                // { key: "2", value: "Female" },
                // { key: "3", value: "Prefer not to say" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ]}
              onValueChange={(value) => {
                console.log("Selected", value);
                setFormData({
                  ...formData,
                  gender: value,
                });
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center justify-between p-5 border-t border-t-gray-200">
        <CustomButton
          title={"Go Back"}
          handlePress={() => router.replace(providerRoutes.PROVIDER_PROFILE)}
          containerStyles={"bg-secondary w-[48%]"}
        />
        <CustomButton
          title={"Update"}
          handlePress={handleUpdatePersonalInfo}
          containerStyles={"bg-primary w-[48%]"}
          isLoading={isPending}
        />
      </View>
    </View>
  );
};

export default ProviderPersonalInfo;
