
"use client";

import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, CalendarDays, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO, isPast, isToday, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { iconMap, defaultTaskIconValue, UnknownIcon } from '@/lib/icons';


interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id:string) => void;
  onEdit: (task: Task) => void;
  isHighlighted?: boolean;
}

export function TaskItem({ task, onToggleComplete, onDelete, onEdit, isHighlighted }: TaskItemProps) {
  let taskDateObject: Date | null = null;
  let displayTaskDate = "Data não informada";
  let isOverdue = false;

  // Check if taskDate is a valid string and can be parsed
  if (task.taskDate && typeof task.taskDate === 'string') {
    const parsedDate = parseISO(task.taskDate);
    if (isValid(parsedDate)) {
      taskDateObject = parsedDate;
      displayTaskDate = format(taskDateObject, "dd/MM/yyyy", { locale: ptBR });
      // Task is overdue if not completed, date is in the past, and not today
      isOverdue = !task.completed && taskDateObject && isPast(taskDateObject) && !isToday(taskDateObject);
    } else {
      console.warn(`Task ${task.id} has an invalid date string: ${task.taskDate}`);
    }
  } else if (task.taskDate) { 
    // Catch cases where taskDate might exist but not be a string (e.g., from older data)
    console.warn(`Task ${task.id} has a malformed date field:`, task.taskDate);
  }

  const getPriorityBadgeVariant = (priority: Task['priority']): "default" | "secondary" | "destructive" => {
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default'; 
    return 'secondary';
  };
  
  const getPriorityText = (priority: Task['priority']): string => {
    if (priority === 'high') return 'Alta';
    if (priority === 'medium') return 'Média';
    return 'Baixa';
  }

  const IconComponent = iconMap[task.icon || defaultTaskIconValue] || UnknownIcon;

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      task.completed ? "bg-muted/50 opacity-70" : "bg-card",
      isOverdue ? "border-destructive" : "",
      isHighlighted && "ring-4 ring-accent ring-offset-2 ring-offset-background shadow-2xl shadow-accent/30 dark:shadow-accent/50" // Updated highlight style
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              aria-label={task.completed ? "Marcar como incompleta" : "Marcar como completa"}
            />
            <div className="flex items-center">
              <IconComponent className="mr-2 h-5 w-5 text-primary shrink-0" />
              <CardTitle className={cn("text-xl", task.completed && "line-through")}>
                {task.title}
              </CardTitle>
            </div>
          </div>
          <Badge variant={getPriorityBadgeVariant(task.priority)} className="capitalize whitespace-nowrap">
            {getPriorityText(task.priority)}
          </Badge>
        </div>
        {task.description && (
          // Align description with title + icon
          <CardDescription className={cn("pt-1 pl-10", task.completed && "line-through")}> 
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Data da Tarefa: {displayTaskDate}</span>
          {task.taskTime && (
            <>
              <Clock className="ml-3 mr-1 h-4 w-4" />
              <span>{task.taskTime}</span>
            </>
          )}
          {isOverdue && (
            <span className="ml-2 flex items-center text-destructive font-semibold">
              <AlertTriangle className="mr-1 h-4 w-4" /> Atrasada
            </span>
          )}
        </div>
         <p className="text-xs text-muted-foreground/80 mt-1">
          Criada em: {task.createdAt ? format(parseISO(task.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Data de criação indisponível'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(task)} aria-label="Editar tarefa">
          <Edit3 className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Editar</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)} aria-label="Excluir tarefa">
          <Trash2 className="h-4 w-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Excluir</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
