
"use client";
import { ThemeToggle } from "./ThemeToggle";
import { Target, Settings, Trash2, ListPlus, RotateCcw, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SettingsActions } from "@/app/page"; 

interface HeaderProps extends SettingsActions {}

export function Header({ 
  onAddExampleTasks,
  onResetToDefaultKeepGames,
  onClearAllPlannerData,
}: HeaderProps) {
  return (
    <header className="py-4 px-6 border-b border-border shadow-md sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Pitaco <span className="text-primary">Planner</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Configurações">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64"> 
              <DropdownMenuLabel>Configurações de Dados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onAddExampleTasks} className="cursor-pointer">
                <ListPlus className="mr-2 h-4 w-4" />
                <span>Adicionar Tarefas de Exemplo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onResetToDefaultKeepGames} className="cursor-pointer">
                <RotateCcw className="mr-2 h-4 w-4 text-orange-500 dark:text-orange-400" />
                <span>Resetar (Limpar tarefas, manter jogos)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onClearAllPlannerData} className="cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                <span>Limpar Tudo (Tarefas e Jogos)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Meu Portfólio Theylor">
            <a href="https://theylor.vercel.app" target="_blank" rel="noopener noreferrer">
              <User className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

