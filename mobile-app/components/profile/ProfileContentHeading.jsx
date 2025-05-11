import { Text } from "react-native";

const ProfileContentHeading = ({heading}) => {
  return (
    <Text className="px-5 py-4 text-base font-psemibold bg-muted-100 text-primary uppercase">
      {heading}
    </Text>
  );
};

export default ProfileContentHeading;
