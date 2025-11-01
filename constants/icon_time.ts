import { NAV_THEME } from "@/constants";
import { FontAwesome5, Fontisto, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FrequencyOption, MedicineFormOption } from "../components/AddMedsForm/types";

export const medicineFormOptions: MedicineFormOption[] = [
  {
    id: 1,
    title: "Tablet",
    iconName: "tablets",
    iconLibrary: "FontAwesome5",
    icon: React.createElement(FontAwesome5, { name: "tablets", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(FontAwesome5, { name: "tablets", size, color }),
  },
  {
    id: 2,
    title: "Capsule",
    iconName: "capsules",
    iconLibrary: "FontAwesome5",
    icon: React.createElement(FontAwesome5, { name: "capsules", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(FontAwesome5, { name: "capsules", size, color }),
  },
  {
    id: 3,
    title: "Liquid",
    iconName: "bottle-wine",
    iconLibrary: "MaterialCommunityIcons",
    icon: React.createElement(MaterialIcons, { name: "medication-liquid", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(MaterialIcons, { name: "medication-liquid", size, color }),
  },
  {
    id: 4,
    title: "Injection",
    iconName: "needle",
    iconLibrary: "MaterialCommunityIcons",
    icon: React.createElement(Fontisto, { name: "injection-syringe", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(Fontisto, { name: "injection-syringe", size, color }),
  },
  {
    id: 5,
    title: "Cream",
    iconName: "lotion",
    iconLibrary: "MaterialCommunityIcons",
    icon: React.createElement(MaterialCommunityIcons, { name: "lotion", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(MaterialCommunityIcons, { name: "lotion", size, color }),
  },
  {
    id: 6,
    title: "Inhaler",
    iconName: "lungs",
    iconLibrary: "MaterialCommunityIcons",
    icon: React.createElement(MaterialCommunityIcons, { name: "lungs", size: 40, color: NAV_THEME.dark.btn }),
    getIcon: (size = 40, color = NAV_THEME.dark.btn) => 
      React.createElement(MaterialCommunityIcons, { name: "lungs", size, color }),
  },
];

export const frequencyOptions: FrequencyOption[] = [
  { time: "08:00", tablets: 0 },
  { time: "09:00", tablets: 0 },
  { time: "10:00", tablets: 0 },
  { time: "11:00", tablets: 0 },
  { time: "12:00", tablets: 0 },
  { time: "13:00", tablets: 0 },
  { time: "14:00", tablets: 0 },
  { time: "15:00", tablets: 0 },
  { time: "16:00", tablets: 0 },
  { time: "17:00", tablets: 0 },
  { time: "18:00", tablets: 0 },
  { time: "19:00", tablets: 0 },
  { time: "20:00", tablets: 0 },
  { time: "21:00", tablets: 0 },
  { time: "22:00", tablets: 0 },
  { time: "23:00", tablets: 0 },
  { time: "00:00", tablets: 0 },
  { time: "01:00", tablets: 0 },
  { time: "02:00", tablets: 0 },
  { time: "03:00", tablets: 0 },
  { time: "04:00", tablets: 0 },
  { time: "05:00", tablets: 0 },
  { time: "06:00", tablets: 0 },
  { time: "07:00", tablets: 0 },
];
