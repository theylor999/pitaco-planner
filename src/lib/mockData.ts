
import type { GameEvent } from './types';

// Mock data for game events displayed in the calendar
// This data can be replaced with a real API call in a production app
export const gameEvents: GameEvent[] = [
  {
    id: 'furia-blast-2025',
    teamName: 'FURIA',
    opponent: 'TBD', // To Be Determined
    date: '2025-06-07', 
    time: 'TBD',
    tournament: 'BLAST.tv Austin Major 2025 Stage 2',
    bettingLink: 'https://reidopitaco.bet.br/betting' // Link for placing bets
  },
  {
    id: 'america-rn-sousa-2025',
    teamName: 'América-RN',
    opponent: 'Sousa EC',
    date: '2025-06-01', 
    time: '16:30', // 4:30 PM
    tournament: 'Brasileirão Série D',
    bettingLink: 'https://reidopitaco.bet.br/betting'
  },
  {
    id: 'america-rn-csa-2025',
    teamName: 'América-RN',
    opponent: 'CSA',
    date: '2025-06-07', 
    time: '17:30', // 5:30 PM
    tournament: 'Copa do Nordeste',
    bettingLink: 'https://reidopitaco.bet.br/betting'
  },
];
