
"use client";

import type { GameEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Swords, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameEventHighlightProps {
  game: GameEvent;
  className?: string;
  isHighlighted?: boolean;
}

export function GameEventHighlight({ game, className, isHighlighted }: GameEventHighlightProps) {
  // Style for games with betting links
  const cardClasses = game.bettingLink
    ? 'border-accent shadow-lg bg-gradient-to-br from-accent/10 to-background'
    : 'shadow-md'; // Default styling for games without betting link

  const titleColor = game.bettingLink ? 'text-accent' : 'text-primary';
  const iconColor = game.bettingLink ? 'text-accent' : 'text-primary';

  return (
    <Card className={cn(
      cardClasses, 
      className,
      "transition-all transform-gpu", // Keep transition for other potential effects
      isHighlighted && "ring-4 ring-accent ring-offset-2 ring-offset-background shadow-2xl shadow-accent/30 dark:shadow-accent/50" // Updated highlight style
      )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg flex items-center", titleColor)}>
            <Swords className={cn("h-5 w-5 mr-2", iconColor)} /> Jogo: {game.teamName}
          </CardTitle>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-semibold">{game.tournament}</span>
        </div>
        <CardDescription className="text-foreground/80">
          {game.teamName} vs {game.opponent}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-foreground/90">
          <CalendarClock className={cn("h-4 w-4 mr-2", iconColor)} />
          <span>
            {new Date(game.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {game.time && game.time !== "TBD" && ` às ${game.time}`}
            {game.time === "TBD" && ` (Horário a definir)`}
          </span>
        </div>
      </CardContent>
      {game.bettingLink && (
        <CardFooter>
          <Button asChild variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <a href={game.bettingLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Dar Pitaco
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
