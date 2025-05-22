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

  const [selectedDate, setSelectedDate] = useState(startOfWeek(new Date(), { locale: { code: 'pt-BR' }}));
  const [currentView, setCurrentView] = useState<CalendarViewMode>('week');
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showCompletedInCalendar, setShowCompletedInCalendar] = useState<boolean>(false);
  
  const [editingTaskOnTasksTab, setEditingTaskOnTasksTab] = useState<Task | null>(null);
  const [editingTaskInCalendar, setEditingTaskInCalendar] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tasks"); 

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<SettingsActionType>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (highlightedEventId) {
      timer = setTimeout(() => {
        setHighlightedEventId(null);
      }, 2000); 
    }
    return () => clearTimeout(timer);
  }, [highlightedEventId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setHighlightedEventId(null); 
  };

  const handleViewChange = (view: CalendarViewMode) => {
    setCurrentView(view);
    if (view === 'week') {
      setSelectedDate(startOfWeek(new Date(), { locale: { code: 'pt-BR' }}));
    } else if (view === 'month') {
      setSelectedDate(startOfMonth(new Date()));
    } else if (view === 'day' && (currentView === 'week' || currentView === 'month')) {
       setSelectedDate(selectedDate); 
    }
    setHighlightedEventId(null); 
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentView === 'day') {
      setSelectedDate(current => direction === 'prev' ? subDays(current, 1) : addDays(current, 1));
    } else if (currentView === 'week') {
      setSelectedDate(current => direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1));
    } else { 
      setSelectedDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
    }
    setHighlightedEventId(null); 
  };

  const handleTasksTabFormSubmit = (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
     if (editingTaskOnTasksTab) {
        updateTask({ ...editingTaskOnTasksTab, ...data });
        toast({ title: "Tarefa Atualizada!", description: `"${data.title}" foi atualizada.` });
        setEditingTaskOnTasksTab(null); 
     } else {
        addTask(data);
        toast({ title: "Tarefa Adicionada!", description: `"${data.title}" foi adicionada com sucesso.` });
     }
  };

  const handleCalendarTabFormSubmit = (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (editingTaskInCalendar) {
       updateTask({ ...editingTaskInCalendar, ...data });
       toast({ title: "Tarefa Atualizada!", description: `"${data.title}" foi atualizada no calendário.` });
       setEditingTaskInCalendar(null); 
    }
 };

  const handleEditTaskFromList = (taskToEdit: Task) => {
    setEditingTaskOnTasksTab(taskToEdit);
    setEditingTaskInCalendar(null); 
    setActiveTab('tasks'); 
  };

  const handleEditTaskFromCalendar = (taskToEdit: Task) => {
    setEditingTaskInCalendar(taskToEdit);
    setEditingTaskOnTasksTab(null); 
    setActiveTab('calendar'); 
  };

  const switchToWeekViewHandler = useCallback((date: Date) => {
    setSelectedDate(startOfWeek(date, { locale: { code: 'pt-BR' }}));
    setCurrentView('week');
    setHighlightedEventId(null);
  }, []);

  const switchToMonthViewHandler = useCallback(() => {
    setSelectedDate(startOfMonth(new Date())); 
    setCurrentView('month');
    setHighlightedEventId(null);
  }, []);

  const handleEventSelect = useCallback((date: Date, eventId: string) => {
    setSelectedDate(date);        
    setCurrentView('day');        
    setHighlightedEventId(eventId); 
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

  const handleResetToDefaultKeepGames = () => {
    openConfirmationDialog(
      'resetToDefaultKeepGames', 
      'Resetar (Limpar tarefas, manter jogos)?', 
      'Isso removerá todas as suas tarefas personalizadas e restaurará a lista de jogos padrão. Esta ação não pode ser desfeita.'
    );
  };

  const handleClearAllPlannerData = () => {
    openConfirmationDialog(
      'clearAllPlannerData', 
      'Limpar Tudo (Tarefas e Jogos)?', 
      'Isso removerá permanentemente todas as suas tarefas e todos os jogos do calendário. Esta ação não pode ser desfeita.'
    );
  };
  
  const handleRequestDeleteTaskFromCalendar = (taskIdToDelete: string) => {
    setTaskToDeleteId(taskIdToDelete); 
    openConfirmationDialog(
      'deleteTaskFromCalendar',
      'Confirmar Exclusão de Tarefa',
      'Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.'
    );
  };
  
  const confirmDialogAction = () => {
    if (dialogAction === 'resetToDefaultKeepGames') {
      clearUserTasks();
      setGameEventsData(mockGameEvents); 
      toast({ title: "Aplicativo Resetado!", description: "Suas tarefas foram limpas e os jogos padrão foram restaurados." });
    } else if (dialogAction === 'clearAllPlannerData') {
      clearUserTasks();
      setGameEventsData([]); 
      toast({ title: "Todos os Dados Removidos!", description: "Suas tarefas e jogos foram limpos com sucesso.", variant: "destructive" });
    } else if (dialogAction === 'deleteTaskFromCalendar' && taskToDeleteId) {
      deleteTask(taskToDeleteId);
      toast({ title: "Tarefa Removida!", description: "A tarefa foi removida com sucesso.", variant: "destructive" });
      setTaskToDeleteId(null); 
    }
    setDialogOpen(false);
    setDialogAction(null);
  };

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
            {editingTaskOnTasksTab ? (
              // Focused Edit View for Tasks Tab
              <div className="max-w-2xl mx-auto"> 
                <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                  <Edit3 className="mr-2 h-6 w-6" /> Editar Tarefa
                </h2>
                <TaskForm
                  onSubmit={handleTasksTabFormSubmit}
                  initialData={editingTaskOnTasksTab}
                  onCancel={() => setEditingTaskOnTasksTab(null)}
                />
              </div>
            ) : (
              // Default View for Tasks Tab (Add Task + Task List)
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h2 className="text-2xl font-semibold mb-4 text-primary">
                    Adicionar Nova Tarefa
                  </h2>
                  <TaskForm
                    onSubmit={handleTasksTabFormSubmit}
                    initialData={null}
                  />
                </div>
                <div className="lg:col-span-2">
                  <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)] pr-3">
                    <TaskList
                      tasks={tasks}
                      gameEvents={gameEventsData}
                      onToggleComplete={toggleTaskCompletion}
                      onDelete={(id) => { deleteTask(id); toast({title: "Tarefa Removida", variant: "destructive"}); }}
                      onEditTask={handleEditTaskFromList}
                      isLoading={!tasksLoaded}
                      showAllPending={showAllPending}
                      onToggleShowAllPending={toggleShowAllPendingHandler}
                    />
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
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
                <ScrollArea className="h-[calc(100vh-370px)] lg:h-[calc(100vh-330px)] mt-1">
                  {currentView === 'day' && (
                    <DayView 
                      selectedDate={selectedDate} 
                      tasks={tasks} 
                      gameEvents={gameEventsData}
                      onEditTask={handleEditTaskFromCalendar} 
                      onDeleteTask={handleRequestDeleteTaskFromCalendar} 
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
                      onDateChange={(date) => { 
                        setSelectedDate(date);
                        setCurrentView('day');
                        setHighlightedEventId(null);
                      }}
                      onEventSelect={handleEventSelect} 
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
                      onDateSelect={(date) => { 
                        setSelectedDate(date);
                        setCurrentView('day'); 
                        setHighlightedEventId(null);
                      }}
                      onEventSelect={handleEventSelect} 
                      priorityFilter={priorityFilter}
                      showCompleted={showCompletedInCalendar}
                    />
                  )}
                </ScrollArea>
              </>
            )}
            {editingTaskInCalendar && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary flex items-center">
                        <Edit3 className="mr-2 h-6 w-6" /> Editar Tarefa no Calendário
                    </h2>
                </div>
                <TaskForm
                  onSubmit={handleCalendarTabFormSubmit} 
                  initialData={editingTaskInCalendar}
                  onCancel={() => setEditingTaskInCalendar(null)} 
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
              className={(dialogAction === 'clearAllPlannerData' || dialogAction === 'deleteTaskFromCalendar') ? 'bg-destructive hover:bg-destructive/90' : ''}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
