
import type { LucideIcon } from 'lucide-react';
import {
  ClipboardPenLine, ShoppingCart, Utensils, Car, Users, Briefcase,
  Dumbbell, BookOpen, HomeIcon, DollarSign, Plane, AlertCircle, Swords, Settings, Trash2, ListPlus, Brain
} from 'lucide-react'; // Brain was for AI, can be kept or removed

export interface TaskIcon {
  name: string; // Display name for select dropdown
  value: string; // Key for the icon, typically the Lucide component name as a string
  component: LucideIcon; // The actual Lucide icon component
}

// List of icons available for task selection
export const taskIconsList: TaskIcon[] = [
  { name: 'Padrão (Lista)', value: 'ClipboardPenLine', component: ClipboardPenLine },
  { name: 'Compras', value: 'ShoppingCart', component: ShoppingCart },
  { name: 'Refeição/Comida', value: 'Utensils', component: Utensils },
  { name: 'Transporte/Carro', value: 'Car', component: Car },
  { name: 'Reunião/Social', value: 'Users', component: Users },
  { name: 'Trabalho/Escritório', value: 'Briefcase', component: Briefcase },
  { name: 'Exercício/Esporte', value: 'Dumbbell', component: Dumbbell },
  { name: 'Estudo/Leitura', value: 'BookOpen', component: BookOpen },
  { name: 'Casa/Doméstico', value: 'HomeIcon', component: HomeIcon },
  { name: 'Finanças/Dinheiro', value: 'DollarSign', component: DollarSign },
  { name: 'Viagem/Férias', value: 'Plane', component: Plane },
  { name: 'Jogos/Lazer', value: 'Swords', component: Swords }, // Game/leisure related
];

export const defaultTaskIconValue = 'ClipboardPenLine'; // Default icon if none is selected

// Map icon string values to their Lucide components for easy lookup
export const iconMap: Record<string, LucideIcon> = taskIconsList.reduce((acc, icon) => {
  acc[icon.value] = icon.component;
  return acc;
}, {} as Record<string, LucideIcon>);

// Add other icons used in the UI directly but not for task selection
iconMap['Settings'] = Settings;
iconMap['Trash2'] = Trash2;
iconMap['ListPlus'] = ListPlus;
iconMap['Brain'] = Brain; // Kept for now, in case AI features are reconsidered

// Fallback icon for cases where an icon string doesn't match any known icon
export const UnknownIcon = AlertCircle;
