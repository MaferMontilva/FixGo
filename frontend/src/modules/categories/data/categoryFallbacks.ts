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
  { id: 1, code: "HANDYMAN", name: "Manitas", slug: "manitas", iconName: "Hammer", icon: Hammer, sortOrder: 10, active: true },
  { id: 2, code: "ELECTRICITY", name: "Electricidad", slug: "electricidad", iconName: "Zap", icon: PlugZap, sortOrder: 20, active: true },
  { id: 3, code: "PLUMBING", name: "Fontanería", slug: "fontaneria", iconName: "Droplets", icon: ShowerHead, sortOrder: 30, active: true },
  { id: 9, code: "PAINTING", name: "Pintura", slug: "pintura", iconName: "PaintRoller", icon: PaintRoller, sortOrder: 40, active: true },
  { id: 15, code: "CLEANING", name: "Limpieza", slug: "limpieza", iconName: "Sparkles", icon: Sparkles, sortOrder: 50, active: true },
  { id: 17, code: "MOVING", name: "Mudanzas", slug: "mudanzas", iconName: "Truck", icon: Truck, sortOrder: 60, active: true },
  { id: 11, code: "LOCKSMITH", name: "Cerrajería", slug: "cerrajeria", iconName: "KeyRound", icon: ShieldCheck, sortOrder: 70, active: true },
  { id: 16, code: "GARDENING", name: "Jardinería", slug: "jardineria", iconName: "Leaf", icon: Leaf, sortOrder: 80, active: true }
];
