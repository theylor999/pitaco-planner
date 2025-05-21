
"use client";

import type { Task, GameEvent, TaskPriority } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { GameEventHighlight } from './GameEventHighlight';
import { Button } from '@/components/ui/button';
import { ExternalLink, Inbox, Clock, Swords, Columns, CalendarRange } from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  startOfMonth, 
  endOfMonth, 
  getDay,
  parseISO,
  isToday as fnsIsToday,
  isValid
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { PriorityFilter } from '@/app/page';

interface CalendarEventHandlers {
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleCompleteTask: (id: string) => void;
}

interface CommonCalendarViewProps {
  priorityFilter: PriorityFilter;
  showCompleted: boolean;
}

interface DayViewProps extends CalendarEventHandlers, CommonCalendarViewProps {
  selectedDate: Date;
  tasks: Task[];
  gameEvents: GameEvent[];
  onSwitchToWeek: (date: Date) => void;
  highlightedEventId?: string | null;
}

export function DayView({ 
  selectedDate, 
  tasks, 
  gameEvents, 
  onEditTask, 
  onDeleteTask, 
  onToggleCompleteTask, 
  onSwitchToWeek,
  highlightedEventId,
  priorityFilter,
  showCompleted
}: DayViewProps) {
  // Filter tasks for the selected day, considering priority and completion status
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false; // Hide completed if not requested
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) { // Apply priority filter
      return false;
    }
    // Ensure task has a valid date and it matches the selected day
    if (!task.taskDate || typeof task.taskDate !== 'string') return false;
    const parsedDate = parseISO(task.taskDate);
    return isValid(parsedDate) && isSameDay(parsedDate, selectedDate);
  });
  
  // Filter games for the selected day
  const gamesForDay = gameEvents.filter(game => {
    if (!game.date || typeof game.date !== 'string') return false;
    const parsedDate = parseISO(game.date);
    return isValid(parsedDate) && isSameDay(parsedDate, selectedDate);
  });

  // Sort tasks by time (if available), then by priority
  const sortedTasksForDay = filteredTasks.sort((a, b) => {
    if (a.taskTime && b.taskTime) {
      return a.taskTime.localeCompare(b.taskTime);
    }
    if (a.taskTime) return -1; // Tasks with time come before tasks without time
    if (b.taskTime) return 1;
    const priorityOrderValues: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };
    if (priorityOrderValues[a.priority] !== priorityOrderValues[b.priority]) {
        return priorityOrderValues[a.priority] - priorityOrderValues[b.priority];
    }
    return 0; // Keep original order if times and priorities are the same
  });

  return (
    <div className="p-4 space-y-6">
      {gamesForDay.map(game => (
        <GameEventHighlight 
          key={game.id} 
          game={game} 
          isHighlighted={game.id === highlightedEventId} 
        />
      ))}
      {sortedTasksForDay.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onEdit={onEditTask} 
          onDelete={onDeleteTask} 
          onToggleComplete={onToggleCompleteTask} 
          isHighlighted={task.id === highlightedEventId}
        />
      ))}
      {/* Message if no events are scheduled for the day */}
      {sortedTasksForDay.length === 0 && gamesForDay.length === 0 && (
         <div className="text-center py-10 text-muted-foreground">
          <Inbox className="mx-auto h-12 w-12 mb-3" />
          <p className="text-lg">Nenhum evento agendado para este dia.</p>
          <Button 
            onClick={() => onSwitchToWeek(selectedDate)} 
            variant="outline" 
            className="mt-4"
          >
            <Columns className="mr-2 h-4 w-4" /> Ver eventos da semana
          </Button>
        </div>
      )}
    </div>
  );
}

interface WeekViewProps extends CommonCalendarViewProps {
  selectedDate: Date;
  tasks: Task[];
  gameEvents: GameEvent[];
  onDateChange: (date: Date) => void; // Callback when a day cell is clicked
  onEventSelect: (date: Date, eventId: string, eventType: 'task' | 'game') => void;
  onSwitchToMonth: () => void;
}

// Helper to get Tailwind classes for task priority and completion status
const getTaskPriorityClass = (priority: TaskPriority, completed: boolean): string => {
    if (completed) return "bg-muted/40 text-muted-foreground"; // Style for completed tasks
    // For active tasks, use text-foreground for better contrast against colored backgrounds
    switch (priority) {
      case 'high':
        return "bg-destructive/20 text-foreground hover:bg-destructive/30";
      case 'medium':
        return "bg-primary/20 text-foreground hover:bg-primary/30";
      case 'low':
        return "bg-secondary/60 text-foreground hover:bg-secondary/70";
      default:
        return "bg-primary/20 text-foreground hover:bg-primary/30"; // Fallback, though should not be reached
    }
  };

export function WeekView({ 
  selectedDate, 
  tasks, 
  gameEvents, 
  onDateChange, 
  onEventSelect, 
  onSwitchToMonth,
  priorityFilter,
  showCompleted
}: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Check if the entire week is empty based on current filters
  const isWeekEmpty = daysInWeek.every(day => {
    const tasksForThisDay = tasks.filter(task => {
      if (!showCompleted && task.completed) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (!task.taskDate || typeof task.taskDate !== 'string') return false;
      const parsedDate = parseISO(task.taskDate);
      return isValid(parsedDate) && isSameDay(parsedDate, day);
    });
    const gamesForThisDay = gameEvents.filter(game => {
      if (!game.date || typeof game.date !== 'string') return false;
      const parsedDate = parseISO(game.date);
      return isValid(parsedDate) && isSameDay(parsedDate, day);
    });
    return tasksForThisDay.length === 0 && gamesForThisDay.length === 0;
  });

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-1 border rounded-lg overflow-hidden">
        {daysInWeek.map(day => {
          // Filter and sort tasks for the current day in the loop
          const tasksForDay = tasks.filter(task => {
            if (!showCompleted && task.completed) return false;
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
            if (!task.taskDate || typeof task.taskDate !== 'string') return false;
            const parsedDate = parseISO(task.taskDate);
            return isValid(parsedDate) && isSameDay(parsedDate, day);
          }).sort((a, b) => { 
            if (a.taskTime && b.taskTime) return a.taskTime.localeCompare(b.taskTime);
            if (a.taskTime) return -1;
            if (b.taskTime) return 1;
            const priorityOrderValues: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };
             if (priorityOrderValues[a.priority] !== priorityOrderValues[b.priority]) {
                return priorityOrderValues[a.priority] - priorityOrderValues[b.priority];
            }
            return 0;
          });

          // Filter games for the current day
          const gamesForDay = gameEvents.filter(game => {
            if (!game.date || typeof game.date !== 'string') return false;
            const parsedDate = parseISO(game.date);
            return isValid(parsedDate) && isSameDay(parsedDate, day);
          });
          const isCurrentDay = fnsIsToday(day); // Highlight if it's today
          return (
            <div key={day.toString()} className={cn("border-r last:border-r-0 p-3 bg-card min-h-[200px]", isCurrentDay && "bg-primary/10")}>
              <h3 
                className={cn("font-semibold text-center mb-3 cursor-pointer hover:text-primary", isCurrentDay && "text-primary font-bold")}
                onClick={() => onDateChange(day)} // Click on day header to go to DayView
              >
                {format(day, "EEE", { locale: ptBR })}
                <br />
                <span className="text-2xl">{format(day, "d")}</span>
              </h3>
              <div className="space-y-2">
                {gamesForDay.map(game => (
                  <Button 
                    key={game.id} 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                        "w-full text-xs h-auto py-1 justify-start truncate",
                        // Different styling for games with betting links
                        game.bettingLink 
                          ? "border-accent text-accent-foreground dark:text-accent hover:bg-accent/10 dark:hover:text-accent-foreground" 
                          : "border-primary/50 text-foreground dark:text-primary hover:bg-primary/10 dark:hover:text-foreground"
                    )}
                    onClick={() => onEventSelect(day, game.id, 'game')} // Click on game to go to DayView and highlight
                    title={`${game.teamName} vs ${game.opponent}`}
                  >
                     {game.bettingLink ? (
                        <ExternalLink className="h-3 w-3 mr-1 shrink-0"/>
                      ) : (
                         <Swords className="h-3 w-3 mr-1 shrink-0"/>
                      )}
                       Jogo: {game.teamName}
                  </Button>
                ))}
                {/* Display up to 3 tasks, then a "more tasks" indicator */}
                {tasksForDay.slice(0,3).map(task => (
                   <div 
                      key={task.id} 
                      className={cn(
                        "text-xs p-1.5 rounded cursor-pointer truncate flex items-center gap-1",
                        getTaskPriorityClass(task.priority, task.completed),
                        task.completed && "line-through" // Strikethrough if completed
                      )}
                      onClick={() => onEventSelect(day, task.id, 'task')} // Click on task to go to DayView and highlight
                      title={task.title}
                   >
                    {task.taskTime && <Clock className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {tasksForDay.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center cursor-pointer" onClick={() => onDateChange(day)}>
                    + {tasksForDay.length - 3} mais tarefas
                  </p>
                )}
                 {/* Placeholder if day is empty */}
                 {tasksForDay.length === 0 && gamesForDay.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-4">Vazio</p>
                 )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Message if the whole week is empty */}
      {isWeekEmpty && (
        <div className="text-center py-10 text-muted-foreground mt-4">
          <Inbox className="mx-auto h-12 w-12 mb-3" />
          <p className="text-lg">Nenhum evento agendado para esta semana.</p>
          <Button 
            onClick={onSwitchToMonth} 
            variant="outline" 
            className="mt-4"
          >
            <CalendarRange className="mr-2 h-4 w-4" /> Ver eventos do mês
          </Button>
        </div>
      )}
    </div>
  );
}

interface MonthViewProps extends CommonCalendarViewProps {
  selectedDate: Date; // Current month being viewed
  tasks: Task[];
  gameEvents: GameEvent[];
  onDateSelect: (date: Date) => void; // Callback when a day cell is clicked
  onEventSelect: (date: Date, eventId: string, eventType: 'task' | 'game') => void;
}

export function MonthView({ 
  selectedDate, 
  tasks, 
  gameEvents, 
  onDateSelect, 
  onEventSelect,
  priorityFilter,
  showCompleted 
}: MonthViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate empty cells needed at the start of the month grid
  const firstDayOfMonthWeekDay = getDay(monthStart); 
  const emptyStartCells = Array(firstDayOfMonthWeekDay).fill(null);

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-px border rounded-lg overflow-hidden bg-border">
        {/* Day name headers */}
        {dayNames.map(dayName => (
          <div key={dayName} className="py-2 text-center font-medium bg-muted text-muted-foreground text-sm">
            {dayName}
          </div>
        ))}
        {/* Empty cells for padding at the start of the month */}
        {emptyStartCells.map((_, index) => (
          <div key={`empty-${index}`} className="bg-card h-28 md:h-32" />
        ))}
        {/* Cells for each day in the month */}
        {daysInMonth.map(day => {
          // Filter and sort tasks for the current day
          const tasksForDay = tasks.filter(task => {
            if (!showCompleted && task.completed) return false;
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
            if (!task.taskDate || typeof task.taskDate !== 'string') return false;
            const parsedDate = parseISO(task.taskDate);
            return isValid(parsedDate) && isSameDay(parsedDate, day);
          }).sort((a, b) => { 
            if (a.taskTime && b.taskTime) return a.taskTime.localeCompare(b.taskTime);
            if (a.taskTime) return -1;
            if (b.taskTime) return 1;
            const priorityOrderValues: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };
            if (priorityOrderValues[a.priority] !== priorityOrderValues[b.priority]) {
                return priorityOrderValues[a.priority] - priorityOrderValues[b.priority];
            }
            return 0;
          });

          // Filter games for the current day
          const gamesForDay = gameEvents.filter(game => {
            if (!game.date || typeof game.date !== 'string') return false;
            const parsedDate = parseISO(game.date);
            return isValid(parsedDate) && isSameDay(parsedDate, day);
          });
          const isCurrentDay = fnsIsToday(day);
          const isSelectedMonth = isSameMonth(day, selectedDate); // For styling days outside current month

          return (
            <div
              key={day.toString()}
              className={cn(
                "p-2 cursor-pointer hover:bg-secondary min-h-[7rem] md:min-h-[8rem] flex flex-col",
                isSelectedMonth ? "bg-card" : "bg-muted/30", // Dim days not in current month
                isCurrentDay && "bg-primary/10 border-2 border-primary", // Highlight today
              )}
              onClick={() => onDateSelect(day)} // Click day cell to go to DayView
            >
              <span className={cn("font-medium self-end", isCurrentDay && "text-primary font-bold")}>{format(day, "d")}</span>
              <div className="flex-grow space-y-1 mt-1 overflow-hidden">
                {/* Display first game, then "more games" indicator */}
                {gamesForDay.slice(0, 1).map(game => (
                  <div
                    key={game.id}
                    className={cn(
                      "p-1 rounded text-xs font-semibold text-center truncate cursor-pointer",
                      game.bettingLink 
                        ? "bg-accent/20 text-accent-foreground hover:bg-accent/30" 
                        : "bg-primary/20 text-foreground dark:text-foreground hover:bg-primary/30"
                    )}
                    onClick={(e) => { e.stopPropagation(); onEventSelect(day, game.id, 'game'); }} // Click game to go to DayView and highlight
                    title={`${game.teamName} vs ${game.opponent}`}
                  >
                    Jogo: {game.teamName}
                  </div>
                ))}
                {gamesForDay.length > 1 && (
                   <p className="text-xs text-muted-foreground text-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onDateSelect(day);}}>+ {gamesForDay.length -1} mais jogos</p>
                )}
                {/* Display up to 2 tasks, then "more tasks" indicator */}
                {tasksForDay.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "text-xs p-1 rounded flex items-center gap-1 cursor-pointer hover:bg-opacity-80 truncate",
                      getTaskPriorityClass(task.priority, task.completed),
                      task.completed && "line-through"
                    )}
                    onClick={(e) => { e.stopPropagation(); onEventSelect(day, task.id, 'task'); }} // Click task to go to DayView and highlight
                    title={task.title}
                  >
                    {task.taskTime && <Clock className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {tasksForDay.length > 2 && (
                  <p className="text-xs text-primary/80 text-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onDateSelect(day);}}>+ {tasksForDay.length - 2} mais tarefas</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
