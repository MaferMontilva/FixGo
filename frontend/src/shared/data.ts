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

export type UiCategory = {
  id?: number;
  code?: string;
  name: string;
  slug?: string;
  description?: string | null;
  iconName?: string | null;
  icon: LucideIcon;
};

export type UiProfessional = {
  id?: number;
  name: string;
  trade: string;
  location: string;
  verified: boolean;
  homologated?: boolean;
  ratingAverage?: number;
  completedJobsCount?: number;
};

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

export const fallbackProfessionals: UiProfessional[] = [
  { name: "FixPro Reformas", trade: "Reformas", location: "Tarragona", verified: true },
  { name: "Multiservicios Molina", trade: "Fontaneria", location: "Barcelona", verified: true },
  { name: "Instalaciones Monti", trade: "Electricidad", location: "Madrid", verified: false },
  { name: "Hogar Tecnico", trade: "Climatizacion", location: "Valencia", verified: true },
  { name: "Taller Casa Clara", trade: "Pintura", location: "Sevilla", verified: false },
  { name: "Puertas y Reformas", trade: "Carpinteria", location: "Zaragoza", verified: true }
];
