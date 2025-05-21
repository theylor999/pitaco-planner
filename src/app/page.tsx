
"use client";

import { Header } from '@/components/pitaco-planner/Header';
import { TaskForm } from '@/components/pitaco-planner/TaskForm';
import { TaskList } from '@/components/pitaco-planner/TaskList';
// GameEventHighlight is imported in CalendarViews and TaskList as needed
import { CalendarControls } from '@/components/pitaco-planner/CalendarControls';
import { DayView, WeekView, MonthView } from '@/components/pitaco-planner/CalendarViews';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from '@/hooks/useTasks';
import type { Task, GameEvent, CalendarViewMode, TaskPriority } from '@/lib/types';
import { gameEvents as mockGameEvents } from '@/lib/mockData';
import { getExampleTasks } from '@/lib/exampleTasks';
import { useState, useCallback, useEffect } from 'react';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, startOfMonth } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Calendar, Edit3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export type PriorityFilter = TaskPriority | 'all';
export type SettingsActionType = 'addExampleTasks' | 'resetToDefaultKeepGames' | 'clearAllPlannerData' | 'deleteTaskFromCalendar' | null;

export interface SettingsActions {
  onAddExampleTasks: () => void;
  onResetToDefaultKeepGames: () => void;
  onClearAllPlannerData: () => void;
}

export default function PitacoPlannerPage() {
  const { 
    tasks, 
    addTask, 
    addMultipleTasks, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    clearUserTasks,
    isLoaded: tasksLoaded 
  } = useTasks();
  const [gameEventsData, setGameEventsData] = useState<GameEvent[]>(mockGameEvents);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(startOfWeek(new Date(), { locale: { code: 'pt-BR' }})); // Default to current week
  const [currentView, setCurrentView] = useState<CalendarViewMode>('week'); // Default to week view
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showCompletedInCalendar, setShowCompletedInCalendar] = useState<boolean>(false);
  
  // State for editing tasks, one for each tab's form instance
  const [editingTaskOnTasksTab, setEditingTaskOnTasksTab] = useState<Task | null>(null);
  const [editingTaskInCalendar, setEditingTaskInCalendar] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tasks"); // Default to tasks tab

  // State for confirmation dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<SettingsActionType>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);


  // Clear highlight after a short delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (highlightedEventId) {
      timer = setTimeout(() => {
        setHighlightedEventId(null);
      }, 2000); // 2 seconds
    }
    return () => clearTimeout(timer);
  }, [highlightedEventId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setHighlightedEventId(null); // Clear highlight when date changes
  };

  const handleViewChange = (view: CalendarViewMode) => {
    setCurrentView(view);
    // If switching to week or month, set to the start of the *current* week/month
    if (view === 'week') {
      setSelectedDate(startOfWeek(new Date(), { locale: { code: 'pt-BR' }}));
    } else if (view === 'month') {
      setSelectedDate(startOfMonth(new Date()));
    } else if (view === 'day' && (currentView === 'week' || currentView === 'month')) {
       // If switching from week/month to day, keep the selectedDate (likely a day picked from calendar)
       setSelectedDate(selectedDate); 
    }
    setHighlightedEventId(null); 
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentView === 'day') {
      setSelectedDate(current => direction === 'prev' ? subDays(current, 1) : addDays(current, 1));
    } else if (currentView === 'week') {
      setSelectedDate(current => direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1));
    } else { // month view
      setSelectedDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
    }
    setHighlightedEventId(null); 
  };

  // Form submission from the "Tasks" tab
  const handleTasksTabFormSubmit = (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
     if (editingTaskOnTasksTab) {
        updateTask({ ...editingTaskOnTasksTab, ...data });
        toast({ title: "Tarefa Atualizada!", description: `"${data.title}" foi atualizada.` });
        setEditingTaskOnTasksTab(null); // Clear editing state for this form
     } else {
        addTask(data);
        toast({ title: "Tarefa Adicionada!", description: `"${data.title}" foi adicionada com sucesso.` });
     }
  };

  // Form submission from the "Calendar" tab (when editing a task there)
  const handleCalendarTabFormSubmit = (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (editingTaskInCalendar) {
       updateTask({ ...editingTaskInCalendar, ...data });
       toast({ title: "Tarefa Atualizada!", description: `"${data.title}" foi atualizada no calendário.` });
       setEditingTaskInCalendar(null); // Clear editing state and hide form
    }
 };

  // Initiates editing a task from the TaskList (Tasks tab)
  const handleEditTaskFromList = (taskToEdit: Task) => {
    setEditingTaskOnTasksTab(taskToEdit);
    setEditingTaskInCalendar(null); // Ensure calendar edit form is not active
    setActiveTab('tasks'); // Switch to tasks tab if not already there
  };

  // Initiates editing a task from the Calendar's DayView
  const handleEditTaskFromCalendar = (taskToEdit: Task) => {
    setEditingTaskInCalendar(taskToEdit);
    setEditingTaskOnTasksTab(null); // Ensure tasks tab edit form is not active
    setActiveTab('calendar'); // Stay on calendar tab
  };

  // Switches to week view, typically from DayView
  const switchToWeekViewHandler = useCallback((date: Date) => {
    setSelectedDate(startOfWeek(date, { locale: { code: 'pt-BR' }}));
    setCurrentView('week');
    setHighlightedEventId(null);
  }, []);

  // Switches to month view, typically from WeekView
  const switchToMonthViewHandler = useCallback(() => {
    setSelectedDate(startOfMonth(new Date())); // Go to current month
    setCurrentView('month');
    setHighlightedEventId(null);
  }, []);

  // When an event (task/game) is selected from WeekView or MonthView
  const handleEventSelect = useCallback((date: Date, eventId: string) => {
    setSelectedDate(date);         // Set the date of the event
    setCurrentView('day');         // Switch to day view
    setHighlightedEventId(eventId); // Highlight the selected event
  }, []);

  const toggleShowAllPendingHandler = useCallback(() => {
    setShowAllPending(prev => !prev);
  }, []);

  const handlePriorityFilterChange = useCallback((filterValue: PriorityFilter) => {
    setPriorityFilter(filterValue);
  }, []);

  const toggleShowCompletedInCalendarHandler = useCallback(() => {
    setShowCompletedInCalendar(prev => !prev);
  }, []);

  // Opens the confirmation dialog for settings actions
  const openConfirmationDialog = (action: SettingsActionType, title: string, description: string) => {
    setDialogAction(action);
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const handleAddExampleTasks = () => {
    const examples = getExampleTasks();
    addMultipleTasks(examples);
    toast({ title: "Tarefas de Exemplo Adicionadas!", description: `${examples.length} tarefas foram adicionadas para a semana atual.` });
  };

  // Prepares confirmation for resetting tasks and restoring default games
  const handleResetToDefaultKeepGames = () => {
    openConfirmationDialog(
      'resetToDefaultKeepGames', 
      'Resetar (Limpar tarefas, manter jogos)?', 
      'Isso removerá todas as suas tarefas personalizadas e restaurará a lista de jogos padrão. Esta ação não pode ser desfeita.'
    );
  };

  // Prepares confirmation for clearing ALL data (tasks and games)
  const handleClearAllPlannerData = () => {
    openConfirmationDialog(
      'clearAllPlannerData', 
      'Limpar Tudo (Tarefas e Jogos)?', 
      'Isso removerá permanentemente todas as suas tarefas e todos os jogos do calendário. Esta ação não pode ser desfeita.'
    );
  };
  
  // Prepares confirmation for deleting a task from the calendar view
  const handleRequestDeleteTaskFromCalendar = (taskIdToDelete: string) => {
    setTaskToDeleteId(taskIdToDelete); // Store ID of task to delete
    openConfirmationDialog(
      'deleteTaskFromCalendar',
      'Confirmar Exclusão de Tarefa',
      'Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.'
    );
  };
  
  // Executes the action confirmed in the dialog
  const confirmDialogAction = () => {
    if (dialogAction === 'resetToDefaultKeepGames') {
      clearUserTasks();
      setGameEventsData(mockGameEvents); // Restore default games
      toast({ title: "Aplicativo Resetado!", description: "Suas tarefas foram limpas e os jogos padrão foram restaurados." });
    } else if (dialogAction === 'clearAllPlannerData') {
      clearUserTasks();
      setGameEventsData([]); // Clear all games
      toast({ title: "Todos os Dados Removidos!", description: "Suas tarefas e jogos foram limpos com sucesso.", variant: "destructive" });
    } else if (dialogAction === 'deleteTaskFromCalendar' && taskToDeleteId) {
      deleteTask(taskToDeleteId);
      toast({ title: "Tarefa Removida!", description: "A tarefa foi removida com sucesso.", variant: "destructive" });
      setTaskToDeleteId(null); // Clear stored ID
    }
    setDialogOpen(false);
    setDialogAction(null);
  };

  // Actions passed to the Header component for the settings menu
  const headerActions: SettingsActions = {
    onAddExampleTasks: handleAddExampleTasks,
    onResetToDefaultKeepGames: handleResetToDefaultKeepGames,
    onClearAllPlannerData: handleClearAllPlannerData,
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header {...headerActions} />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6 h-auto sm:h-10">
            <TabsTrigger value="tasks" className="py-2 sm:py-1.5 text-base sm:text-sm flex items-center justify-center gap-2">
              <ClipboardList className="h-5 w-5" /> Tarefas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="py-2 sm:py-1.5 text-base sm:text-sm flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5" /> Calendário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  {editingTaskOnTasksTab ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
                </h2>
                <TaskForm 
                  onSubmit={handleTasksTabFormSubmit} 
                  initialData={editingTaskOnTasksTab}
                  onCancel={() => setEditingTaskOnTasksTab(null)} // Clear editing state for this tab's form
                />
              </div>
              <div className="lg:col-span-2">
                 <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)] pr-3">
                  <TaskList
                    tasks={tasks}
                    gameEvents={gameEventsData}
                    onToggleComplete={toggleTaskCompletion}
                    onDelete={(id) => { deleteTask(id); toast({title: "Tarefa Removida", variant: "destructive"}); }}
                    onEditTask={handleEditTaskFromList} // Use the specific handler for this tab
                    isLoading={!tasksLoaded}
                    showAllPending={showAllPending}
                    onToggleShowAllPending={toggleShowAllPendingHandler}
                  />
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            {/* Show calendar views and controls only if NOT editing a task within the calendar tab */}
            {!editingTaskInCalendar && (
              <>
                <CalendarControls
                  currentView={currentView}
                  selectedDate={selectedDate}
                  onViewChange={handleViewChange}
                  onDateChange={handleDateChange}
                  onNavigate={handleNavigate}
                  selectedPriority={priorityFilter}
                  onPriorityChange={handlePriorityFilterChange}
                  showCompleted={showCompletedInCalendar}
                  onToggleShowCompleted={toggleShowCompletedInCalendarHandler}
                />
                {/* Reduced calendar height */}
                <ScrollArea className="h-[calc(100vh-370px)] lg:h-[calc(100vh-330px)] mt-1">
                  {currentView === 'day' && (
                    <DayView 
                      selectedDate={selectedDate} 
                      tasks={tasks} 
                      gameEvents={gameEventsData}
                      onEditTask={handleEditTaskFromCalendar} // Use specific handler for calendar edit
                      onDeleteTask={handleRequestDeleteTaskFromCalendar} // Request confirmation for delete
                      onToggleCompleteTask={toggleTaskCompletion}
                      onSwitchToWeek={switchToWeekViewHandler}
                      highlightedEventId={highlightedEventId}
                      priorityFilter={priorityFilter}
                      showCompleted={showCompletedInCalendar}
                    />
                  )}
                  {currentView === 'week' && (
                    <WeekView 
                      selectedDate={selectedDate} 
                      tasks={tasks} 
                      gameEvents={gameEventsData}
                      onDateChange={(date) => { // Clicking a day in WeekView switches to DayView
                        setSelectedDate(date);
                        setCurrentView('day');
                        setHighlightedEventId(null);
                      }}
                      onEventSelect={handleEventSelect} // Clicking an event in WeekView
                      onSwitchToMonth={switchToMonthViewHandler}
                      priorityFilter={priorityFilter}
                      showCompleted={showCompletedInCalendar}
                    />
                  )}
                  {currentView === 'month' && (
                    <MonthView 
                      selectedDate={selectedDate} 
                      tasks={tasks} 
                      gameEvents={gameEventsData}
                      onDateSelect={(date) => { // Clicking a day in MonthView switches to DayView
                        setSelectedDate(date);
                        setCurrentView('day'); 
                        setHighlightedEventId(null);
                      }}
                      onEventSelect={handleEventSelect} // Clicking an event in MonthView
                      priorityFilter={priorityFilter}
                      showCompleted={showCompletedInCalendar}
                    />
                  )}
                </ScrollArea>
              </>
            )}
            {/* Show TaskForm within Calendar tab if editingTaskInCalendar is set */}
            {editingTaskInCalendar && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary flex items-center">
                        <Edit3 className="mr-2 h-6 w-6" /> Editar Tarefa no Calendário
                    </h2>
                </div>
                <TaskForm
                  onSubmit={handleCalendarTabFormSubmit} // Use specific submit handler
                  initialData={editingTaskInCalendar}
                  onCancel={() => setEditingTaskInCalendar(null)} // Clear state to hide form
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pitaco Planner. Todos os direitos reservados.
      </footer>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDialogAction(null); setTaskToDeleteId(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDialogAction} 
              // Apply destructive style for specific actions
              className={(dialogAction === 'clearAllPlannerData' || dialogAction === 'deleteTaskFromCalendar') ? 'bg-destructive hover:bg-destructive/90' : ''}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
