
"use client";

import type { Task } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Edit3, Clock } from 'lucide-react'; // Added Clock icon
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { taskIconsList, defaultTaskIconValue } from '@/lib/icons';

// Schema for task form validation
const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'O título é obrigatório.' }).max(100, { message: 'O título deve ter no máximo 100 caracteres.'}),
  description: z.string().max(500, { message: 'A descrição deve ter no máximo 500 caracteres.'}).optional(),
  taskDate: z.date({ required_error: 'A data da tarefa é obrigatória.' }),
  taskTime: z.string().optional().refine(val => { // Optional: refine to check HH:mm format if needed
    if (!val || val === '') return true; // Allow empty string (no time)
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
  }, { message: "Formato de hora inválido. Use HH:MM." }),
  priority: z.enum(['high', 'medium', 'low'], { required_error: 'A prioridade é obrigatória.' }),
  icon: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  initialData?: Task | null; // For editing existing tasks
  onCancel?: () => void; // To handle cancellation of edit
}

export function TaskForm({ onSubmit, initialData, onCancel }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData
      ? { // Pre-fill form if editing
          ...initialData,
          taskDate: new Date(initialData.taskDate), // Convert date string back to Date object
          taskTime: initialData.taskTime || '', // Ensure taskTime is a string for the input
          icon: initialData.icon || defaultTaskIconValue,
        }
      : { // Default values for new task
          title: '',
          description: '',
          priority: 'medium',
          taskTime: '', // Empty string for the input
          icon: defaultTaskIconValue,
          // taskDate is undefined initially, user must pick one
        },
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit({
      ...data,
      taskDate: format(data.taskDate, 'yyyy-MM-dd'), // Format date to YYYY-MM-DD string
      taskTime: data.taskTime || undefined, // Convert empty string to undefined
      icon: data.icon || defaultTaskIconValue,
    });
    if (!initialData) { 
      // Reset form only if it was an "add new" submission
      form.reset({ 
        title: '', 
        description: '', 
        priority: 'medium', 
        taskDate: undefined, // Clear date field to prompt new selection
        taskTime: '', 
        icon: defaultTaskIconValue 
      });
    }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4 border rounded-lg shadow-sm bg-card">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Tarefa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Comprar mantimentos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes adicionais sobre a tarefa..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            control={form.control}
            name="taskDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Tarefa</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Time input */}
          <FormField
            control={form.control}
            name="taskTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hora (Opcional)</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      className="pl-10" // Add padding for the icon
                    />
                  </FormControl>
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone da Tarefa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um ícone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskIconsList.map((iconItem) => (
                        <SelectItem key={iconItem.value} value={iconItem.value}>
                          <div className="flex items-center">
                            <iconItem.component className="mr-2 h-4 w-4" />
                            {iconItem.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          {/* Show cancel button only if editing and onCancel is provided */}
          {initialData && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {initialData ? 'Salvar Alterações' : 'Adicionar Tarefa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
