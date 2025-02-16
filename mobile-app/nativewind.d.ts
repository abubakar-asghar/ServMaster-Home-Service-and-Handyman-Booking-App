import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }
  
  interface ImageProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface ButtonProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface FlatListProps {
    className?: string;
  }

  interface SectionListProps {
    className?: string;
  }

  interface ActivityIndicatorProps {
    className?: string;
  }

  interface PickerProps {
    className?: string;
  }

  interface SliderProps {
    className?: string;
  }
}
