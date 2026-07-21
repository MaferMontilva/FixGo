import {
  AirVent,
  Bug,
  Hammer,
  HardHat,
  HousePlus,
  KeyRound,
  Leaf,
  Lightbulb,
  PanelsTopLeft,
  PaintRoller,
  PlugZap,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  Truck,
  WashingMachine,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UiCategory } from "../types/category";

export const iconByName: Record<string, LucideIcon> = {
  AirVent,
  BrickWall: HardHat,
  Bug,
  Droplets: ShowerHead,
  Hammer,
  HardHat,
  HousePlus,
  KeyRound,
  Leaf,
  Lightbulb,
  PaintRoller,
  PanelTop: PanelsTopLeft,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Truck,
  WashingMachine,
  Wrench,
  Zap: PlugZap
};

export const fallbackCategories: UiCategory[] = [
  { name: "Manitas", iconName: "Hammer", icon: Hammer },
  { name: "Electricidad", iconName: "Zap", icon: PlugZap },
  { name: "Fontaneria", iconName: "Droplets", icon: ShowerHead },
  { name: "Climatizacion", iconName: "AirVent", icon: AirVent },
  { name: "Pintura", iconName: "PaintRoller", icon: PaintRoller },
  { name: "Albanileria", iconName: "BrickWall", icon: HardHat },
  { name: "Cerrajeria", iconName: "KeyRound", icon: ShieldCheck },
  { name: "Reformas", iconName: "HousePlus", icon: Wrench },
  { name: "Iluminacion", iconName: "Lightbulb", icon: Lightbulb }
];
