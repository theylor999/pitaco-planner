
"use client";

import type { CalendarViewMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Columns, Filter } from 'lucide-react'; // Removed CheckSquare
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PriorityFilter } from '@/app/page';

interface CalendarControlsProps {
  currentView: CalendarViewMode;
  selectedDate: Date;
  onViewChange: (view: CalendarViewMode) => void;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  selectedPriority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
}

export function CalendarControls({
  currentView,
  selectedDate,
  onViewChange,
  onDateChange,
  onNavigate,
  selectedPriority,
  onPriorityChange,
  showCompleted,
  onToggleShowCompleted,
}: CalendarControlsProps) {
  
  const getDisplayDate = () => {
    if (currentView === 'day') {
      return format(selectedDate, "PPP", { locale: ptBR });
    }
    if (currentView === 'week') {
      // For week view, always calculate start based on selectedDate for accurate display
      const weekStartForDisplay = startOfWeek(selectedDate, { locale: ptBR });
      const startOfWeekDate = format(weekStartForDisplay, "dd MMM", { locale: ptBR });
      const endOfWeekDate = format(new Date(weekStartForDisplay.getFullYear(), weekStartForDisplay.getMonth(), weekStartForDisplay.getDate() + 6), "dd MMM yyyy", { locale: ptBR });
      return `${startOfWeekDate} - ${endOfWeekDate}`;
    }
    if (currentView === 'month') {
      return format(selectedDate, "MMMM yyyy", { locale: ptBR });
    }
    return '';
  };

  // Handles "Today" button click
  const handleTodayClick = () => {
    if (currentView === 'week') {
      // If in week view, set selectedDate to the start of the current week
      onDateChange(startOfWeek(new Date(), { locale: ptBR }));
    } else {
      // For day or month view, just go to today's date
      onDateChange(new Date());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b rounded-t-lg bg-card">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={() => onNavigate('prev')} aria-label="Período anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-auto text-base sm:text-lg font-semibold px-3 sm:px-4">
              {getDisplayDate()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <ShadCalendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={() => onNavigate('next')} aria-label="Próximo período">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" onClick={handleTodayClick} className="text-sm sm:text-base px-3 sm:px-4">Hoje</Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority filter */}
        <Select value={selectedPriority} onValueChange={(value) => onPriorityChange(value as PriorityFilter)}>
            <SelectTrigger className="w-full sm:w-[170px] text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="high">Alta Prioridade</SelectItem>
                <SelectItem value="medium">Média Prioridade</SelectItem>
                <SelectItem value="low">Baixa Prioridade</SelectItem>
            </SelectContent>
        </Select>
        {/* Toggle for showing completed tasks */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showCompletedTasksCalendar" 
            checked={showCompleted} 
            onCheckedChange={onToggleShowCompleted}
          />
          <Label htmlFor="showCompletedTasksCalendar" className="text-xs sm:text-sm font-medium cursor-pointer">
            Ver concluídas
          </Label>
        </div>
        {/* View mode buttons */}
        <Button
          variant={currentView === 'day' ? 'default' : 'outline'}
          onClick={() => onViewChange('day')}
          className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" /> Dia
        </Button>
        <Button
          variant={currentView === 'week' ? 'default' : 'outline'}
          onClick={() => onViewChange('week')}
          className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Columns className="h-3 w-3 sm:h-4 sm:w-4" /> Semana
        </Button>
        <Button
          variant={currentView === 'month' ? 'default' : 'outline'}
          onClick={() => onViewChange('month')}
          className="gap-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4" /> Mês
        </Button>
      </div>
    </div>
  );
}
