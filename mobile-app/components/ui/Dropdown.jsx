import { useState } from "react";
import { Modal, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const Dropdown = ({ value, options, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Select";

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.dropdownTrigger}
      >
        <Text>{selectedLabel}</Text>
        <Icon name="chevron-down" />
      </TouchableOpacity>

      <Modal visible={visible} transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text>{item.label}</Text>
                  {value === item.value && <Icon name="check" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  dropdownContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 8,
    maxHeight: "60%",
  },
  option: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

// import { View } from "react-native";
// import React, { useCallback, useState, useRef, useEffect } from "react";
// import { SelectList } from "react-native-dropdown-select-list";
// import { AntDesign } from "@expo/vector-icons";
// import { colors } from "../../constants/colors";

// const Dropdown = ({
//   placeholder,
//   defaultValue,
//   data,
//   onChange,
//   containerStyles,
//   dropdownHeight,
// }) => {
//   const [selected, setSelected] = useState("");

//   useEffect(() => {
//     if (defaultValue) {
//       setSelected(defaultValue);
//       const formatted = formatValue(defaultValue);
//       onChange(formatted);
//     }
//   }, [defaultValue]);

//   const formatValue = (value) => {
//     return value.toLowerCase().replace(/\s+/g, "_");
//   };

//   const handleSelection = (val) => {
//     setSelected(val);
//     const formattedValue = formatValue(val);
//     onChange(formattedValue);
//   };

//   return (
//     <View className={`${containerStyles}`}>
//       <SelectList
//         setSelected={handleSelection}
//         data={data}
//         save="value"
//         search={false}
//         placeholder={placeholder}
//         defaultOption={
//           defaultValue
//             ? data.find((item) => item.value === defaultValue)
//             : undefined
//         }
//         boxStyles={{
//           borderRadius: 14,
//           borderWidth: 2,
//           borderColor: "lightgray",
//           height: 56,
//           backgroundColor: "white",
//           display: "flex",
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//         inputStyles={{
//           fontSize: 14,
//           color: selected ? colors.text : colors.muted || "#000",
//           fontFamily: "Poppins-Medium",
//         }}
//         dropdownStyles={{
//           borderRadius: 14,
//           borderColor: "lightgray",
//           backgroundColor: "#FFFFF",
//           maxHeight: dropdownHeight || 180,
//         }}
//         dropdownItemStyles={{
//           paddingVertical: 10,
//         }}
//         dropdownTextStyles={{
//           fontSize: 14,
//           color: colors.muted || "#000",
//           fontFamily: "Poppins-Medium",
//         }}
//         arrowicon={
//           <View className="items-center justify-center">
//             <AntDesign
//               name="caretdown"
//               size={14}
//               color={colors.primary || "#999"}
//             />
//           </View>
//         }
//         />
//     </View>
//   );
//   const [expanded, setExpanded] = useState(false);
//   //   const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);
//   const [label, setLabel] = useState("");
//   const buttonRef = useRef(null);

// //   const [dropdownTop, setDropdownTop] = useState(0);
// //   const [dropdownLeft, setDropdownLeft] = useState(0);
// //   const [dropdownWidth, setDropdownWidth] = useState("100%");
//     const [top, setTop] = useState(0);
//   const onSelect = useCallback((item) => {
//     onChange(item.value);
//     setLabel(item.label);
//     setExpanded(false);
//   }, []);

//   useEffect(() => {
//     if (defaultValue) {
//       const selectedItem = data.find((item) => item.value === defaultValue);
//       if (selectedItem) {
//         setLabel(selectedItem.label);
//       }
//     }
//   }, [defaultValue, data]);

//   const toggleExpanded = () => {
//     if (buttonRef.current) {
//       buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
//         const dropdownTop = pageY + height; // bottom of field
//         setTop(dropdownTop);
//         setExpanded((prev) => !prev);
//       });
//     }
//   };

//   return (
//     // <View
//     //   ref={buttonRef}
//     //   onLayout={(e) => {
//     //     const layout = e.nativeEvent.layout;
//     //     const topOffset = layout.y;
//     //     const heightOfComponent = layout.height;

//     //     const finalValue =
//     //       topOffset + heightOfComponent + (Platform.OS === "android" ? -32 : 3);
//     //     setTop(finalValue);
//     //   }}
//     // >
//     <View ref={buttonRef}>
//       <TouchableOpacity
//         className={`h-16 px-5 bg-black-100 rounded-2xl border-2 border-gray-300 flex flex-row items-center justify-between ${containerStyles}`}
//         onPress={toggleExpanded}
//         activeOpacity={0.7}
//       >
//         <Text
//           className={`font-psemibold text-base ${
//             label ? "text-text" : "text-muted"
//           }`}
//         >
//           {label || placeholder}
//         </Text>
//         <AntDesign
//           name={expanded ? "caretup" : "caretdown"}
//           size={15}
//           color={colors.muted}
//         />
//       </TouchableOpacity>
//       {expanded ? (
//         <Modal visible={expanded} transparent>
//           <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
//             <View className="flex-1 justify-center items-center px-4">
//               <View
//                 className="absolute bg-white w-full p-2 rounded-2xl max-h-[200px] border-2 border-gray-300"
//                 style={{ top }}
//                 // style={{
//                 //   position: "absolute",
//                 //   top: dropdownTop,
//                 //   left: dropdownLeft,
//                 //   width: dropdownWidth,
//                 //   backgroundColor: "white",
//                 //   borderRadius: 12,
//                 //   padding: 10,
//                 //   maxHeight: 200,
//                 //   borderWidth: 1,
//                 //   borderColor: "#ccc",
//                 //   zIndex: 999,
//                 // }}
//               >
//                 <FlatList
//                   keyExtractor={(item) => item.value}
//                   data={data}
//                   renderItem={({ item }) => (
//                     <TouchableOpacity
//                       activeOpacity={0.7}
//                       className="p-3"
//                       onPress={() => onSelect(item)}
//                     >
//                       <Text className="font-pmedium text-base">
//                         {item.label}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                   ItemSeparatorComponent={() => <View className="h-2" />}
//                 />
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </Modal>
//       ) : null}
//     </View>
//   );
// };

export default Dropdown;
