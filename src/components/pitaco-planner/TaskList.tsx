
"use client";

import type { Task, TaskPriority, GameEvent } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { GameEventHighlight } from './GameEventHighlight';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Inbox, Eye, EyeOff, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { isToday, parseISO, isValid, compareAsc } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: Task[];
  gameEvents: GameEvent[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEditTask: (task: Task) => void;
  isLoading: boolean;
  showAllPending: boolean;
  onToggleShowAllPending: () => void;
}

const priorityOrder: Record<TaskPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

// Interface for items to be displayed in the combined list
interface DisplayableItem {
  id: string;
  type: 'task' | 'game';
  date: string; // YYYY-MM-DD format for sorting
  time?: string; // HH:mm format for sorting
  originalData: Task | GameEvent; // The actual task or game object
  title: string; // For display and accessibility
  // Task specific fields for sorting and display
  priority?: TaskPriority;
  createdAt?: string;
  completed?: boolean;
}

// Animation variants for collapsible sections
const sectionVariants = {
  open: { opacity: 1, height: 'auto', marginTop: '1rem' },
  closed: { opacity: 0, height: 0, marginTop: '0' }
};

export function TaskList({ 
  tasks, 
  gameEvents,
  onToggleComplete, 
  onDelete, 
  onEditTask,
  isLoading,
  showAllPending,
  onToggleShowAllPending 
}: TaskListProps) {
  const [isPendingListOpen, setIsPendingListOpen] = useState(true);
  const [isCompletedListOpen, setIsCompletedListOpen] = useState(true);

  const togglePendingList = () => setIsPendingListOpen(prev => !prev);
  const toggleCompletedList = () => setIsCompletedListOpen(prev => !prev);
  
  // Memoized list of pending tasks for today, sorted by priority, then time, then creation
  const pendingTasksToday = useMemo(() => {
    return tasks
      .filter(task => {
        if (task.completed) return false;
        // Ensure task date is valid and today
        if (!task.taskDate || typeof task.taskDate !== 'string') return false;
        const parsedDate = parseISO(task.taskDate);
        return isValid(parsedDate) && isToday(parsedDate);
      })
      .sort((a, b) => {
        // Sort by priority
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Then by time
        if (a.taskTime && b.taskTime) {
          const timeComparison = a.taskTime.localeCompare(b.taskTime);
          if (timeComparison !== 0) return timeComparison;
        } else if (a.taskTime) {
          return -1; // Tasks with time come first
        } else if (b.taskTime) {
          return 1;
        }
        // Finally by creation date
        if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  }, [tasks]);

  // Memoized list of ALL pending items (tasks and games), sorted by date, then time
  const allPendingItems = useMemo(() => {
    const pendingUserTasks: DisplayableItem[] = tasks
      .filter(task => !task.completed)
      .map(task => ({
        id: task.id,
        type: 'task' as const,
        date: task.taskDate, 
        time: task.taskTime,
        originalData: task,
        title: task.title,
        priority: task.priority,
        createdAt: task.createdAt,
        completed: task.completed,
      }));

    const gameItems: DisplayableItem[] = gameEvents.map(game => ({
      id: game.id,
      type: 'game' as const,
      date: game.date,
      time: game.time === 'TBD' ? undefined : game.time,
      originalData: game,
      title: `${game.teamName} vs ${game.opponent}`,
    }));

    const combined = [...pendingUserTasks, ...gameItems];

    // Sort combined list
    return combined.sort((a, b) => {
      let dateAValue, dateBValue;
      try {
        dateAValue = a.date ? parseISO(a.date) : new Date(0); 
        if (!isValid(dateAValue)) dateAValue = new Date(0);
      } catch { dateAValue = new Date(0); }
      try {
        dateBValue = b.date ? parseISO(b.date) : new Date(0); 
        if (!isValid(dateBValue)) dateBValue = new Date(0);
      } catch { dateBValue = new Date(0); }

      const dateComparison = compareAsc(dateAValue, dateBValue);
      if (dateComparison !== 0) return dateComparison;

      if (a.time && b.time) {
        const timeComparison = a.time.localeCompare(b.time);
        if (timeComparison !== 0) return timeComparison;
      } else if (a.time) { 
        return -1;
      } else if (b.time) { 
        return 1;
      }

      if (a.type === 'task' && b.type === 'task' && a.priority && b.priority && a.createdAt && b.createdAt) {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
         return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (a.type === 'task' && b.type === 'game') return -1;
      if (a.type === 'game' && b.type === 'task') return 1;
      
      return 0;
    });
  }, [tasks, gameEvents]);


  const completedTasks = useMemo(() => 
    [...tasks]
      .filter(task => task.completed)
      .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return 0;
      }), 
    [tasks]
  );

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm bg-card animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0 && gameEvents.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Inbox className="mx-auto h-16 w-16 mb-4" />
        <p className="text-xl font-semibold">Nenhum item por aqui!</p>
        <p>Adicione sua primeira tarefa ou confira a aba Calendário para ver os jogos.</p>
      </div>
    );
  }

  const itemsToShow = showAllPending ? allPendingItems : pendingTasksToday.map(task => ({
      id: task.id,
      type: 'task' as const,
      date: task.taskDate,
      time: task.taskTime,
      originalData: task,
      title: task.title,
      priority: task.priority,
      createdAt: task.createdAt,
      completed: task.completed,
  }));
  
  const TitleIcon = showAllPending ? CalendarDays : ListChecks;
  const currentListTitle = showAllPending 
    ? `Todos os Itens Pendentes (${allPendingItems.length})` 
    : `Tarefas Pendentes (Hoje - ${pendingTasksToday.length})`;
  
  const toggleButtonText = showAllPending 
    ? "Mostrar apenas tarefas de hoje" 
    : "Mostrar todos os itens pendentes (inclui jogos)";
  
  const ToggleIcon = showAllPending ? EyeOff : Eye;

  return (
    <div className="space-y-6 mt-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 
            onClick={togglePendingList}
            className="text-xl font-semibold flex items-center cursor-pointer hover:text-primary transition-colors"
            aria-expanded={isPendingListOpen}
            aria-controls="pending-items-section"
          >
            {isPendingListOpen ? <ChevronDown className="mr-2 h-5 w-5" /> : <ChevronRight className="mr-2 h-5 w-5" />}
            <TitleIcon className="mr-2 h-5 w-5 text-accent" /> {currentListTitle}
          </h3>
          {(tasks.length > 0 || gameEvents.length > 0) && (
              <Button variant="outline" size="sm" onClick={onToggleShowAllPending}>
                  <ToggleIcon className="mr-2 h-4 w-4" />
                  {toggleButtonText}
              </Button>
          )}
        </div>
        <motion.section
          id="pending-items-section"
          variants={sectionVariants}
          initial={false} // Start based on state, don't animate initial open
          animate={isPendingListOpen ? "open" : "closed"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {itemsToShow.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {itemsToShow.map(item => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, filter: "blur(5px)", transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {item.type === 'task' ? (
                      <TaskItem
                        task={item.originalData as Task}
                        onToggleComplete={onToggleComplete}
                        onDelete={onDelete} 
                        onEdit={onEditTask}
                      />
                    ) : (
                      <GameEventHighlight 
                        game={item.originalData as GameEvent} 
                        className="my-2"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
             <div className="text-center py-6 text-muted-foreground">
                <Inbox className="mx-auto h-12 w-12 mb-3" />
                <p>
                  {showAllPending 
                    ? "Nenhum item pendente encontrado." 
                    : (tasks.length === 0 && gameEvents.length > 0 ? "Nenhuma tarefa pendente para hoje. Verifique a opção 'Mostrar todos os itens' para ver jogos." : "Nenhuma tarefa pendente para hoje.")
                  }
                </p>
            </div>
          )}
        </motion.section>
      </div>
      
      {completedTasks.length > 0 && ( 
         <div>
          <h3 
            onClick={toggleCompletedList}
            className="text-xl font-semibold mb-3 mt-8 flex items-center cursor-pointer hover:text-primary transition-colors"
            aria-expanded={isCompletedListOpen}
            aria-controls="completed-items-section"
          >
            {isCompletedListOpen ? <ChevronDown className="mr-2 h-5 w-5" /> : <ChevronRight className="mr-2 h-5 w-5" />}
            <ListChecks className="mr-2 h-5 w-5 text-green-500" /> Tarefas Concluídas ({completedTasks.length})
          </h3>
          <motion.section
            id="completed-items-section"
            variants={sectionVariants}
            initial={false}
            animate={isCompletedListOpen ? "open" : "closed"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <AnimatePresence>
                {completedTasks.map(task => (
                   <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(5px)", transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onEdit={onEditTask}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      )}
    </div>
  );
}

