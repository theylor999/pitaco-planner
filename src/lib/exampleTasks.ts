
"use client";
import type { Task } from './types';
import { format, addDays, startOfWeek } from 'date-fns';
import { defaultTaskIconValue } from './icons';
import type { TaskPriority } from './types';

// Generates example tasks for the current week
export const getExampleTasks = (): Omit<Task, 'id' | 'completed' | 'createdAt'>[] => {
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Assuming week starts on Monday

  // Define details for example tasks
  const exampleTaskDetails: Array<{ 
    title: string; 
    description?: string; 
    taskTime?: string; 
    priority: TaskPriority; 
    icon: string; 
    dayOffset: number; // 0 for Monday, 1 for Tuesday, etc., relative to week start
  }> = [
    { title: 'Reunião de Planejamento Semanal', description: 'Discutir metas e prioridades da semana.', taskTime: '09:00', priority: 'high', icon: 'Users', dayOffset: 0 },
    { title: 'Comprar mantimentos essenciais', description: 'Lista: Leite, pão, ovos, frutas, vegetais.', taskTime: '18:00', priority: 'medium', icon: 'ShoppingCart', dayOffset: 1 },
    { title: 'Sessão de Treino na Academia', description: 'Foco em cardio e pesos leves.', taskTime: '07:00', priority: 'medium', icon: 'Dumbbell', dayOffset: 5 },
    { title: 'Contratar o novo Product Engineer do Rei do Pitaco', description: 'Theylor Machado parece ser uma boa opção.', taskTime: '14:00', priority: 'high', icon: 'Briefcase', dayOffset: 2 },
    { title: 'Ligar para o mecânico', description: 'Agendar revisão anual do carro.', taskTime: '10:00', priority: 'high', icon: 'Car', dayOffset: 4 },
    { title: 'Planejar viagem de fim de semana', description: 'Pesquisar acomodações e atividades.', priority: 'low', icon: 'Plane', dayOffset: 3 },
    { title: 'Pagar contas mensais', description: 'Energia, água, internet e aluguel.', taskTime: '11:00', priority: 'high', icon: 'DollarSign', dayOffset: 0 },
    { title: 'Limpeza geral e organização da casa', description: 'Focar na sala e cozinha.', priority: 'medium', icon: 'HomeIcon', dayOffset: 5 },
    { title: 'Dar um pitaco nos jogos da semana', description: 'Dar um pitaco e assistir esportes.', taskTime: '17:00', priority: 'low', icon: 'Swords', dayOffset: 6},
  ];

  // Map details to task objects with formatted dates
  return exampleTaskDetails.map(detail => {
    const taskDateRaw = addDays(currentWeekStart, detail.dayOffset);
    return {
      title: detail.title,
      description: detail.description,
      taskDate: format(taskDateRaw, 'yyyy-MM-dd'), // Format date as YYYY-MM-DD
      taskTime: detail.taskTime,
      priority: detail.priority,
      icon: detail.icon || defaultTaskIconValue,
    };
  });
};
