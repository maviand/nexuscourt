import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProfile, SeasonStats, CoachingStrategy, EntryMethod, Badge, Coach, PlayerStats } from './types';

export type AppStep = 'create' | 'era' | 'strategy' | 'season_loop' | 'career_end';

interface SimulationState {
    step: AppStep;
    player: PlayerProfile | null;
    currentYear: number;
    entryMethod: EntryMethod;
    startTeam: string;
    strategy: CoachingStrategy | null;
    injuriesEnabled: boolean;
    seasons: SeasonStats[];
    lastSeason: SeasonStats | null;
    isSimulating: boolean;
    error: string | null;
    currentAttributes: PlayerStats | null;
    currentBadges: Badge[];
    xp: number;

    // Actions
    setStep: (step: AppStep) => void;
    setPlayer: (player: PlayerProfile | null) => void;
    setCurrentYear: (year: number | ((prev: number) => number)) => void;
    setEntryMethod: (method: EntryMethod) => void;
    setStartTeam: (team: string) => void;
    setStrategy: (strategy: CoachingStrategy | null) => void;
    setInjuriesEnabled: (enabled: boolean) => void;
    setSeasons: (seasons: SeasonStats[] | ((prev: SeasonStats[]) => SeasonStats[])) => void;
    setLastSeason: (season: SeasonStats | null) => void;
    setIsSimulating: (isSim: boolean) => void;
    setError: (error: string | null) => void;
    setCurrentAttributes: (stats: PlayerStats | null) => void;
    setCurrentBadges: (badges: Badge[]) => void;
    setXp: (xp: number | ((prev: number) => number)) => void;
    reset: () => void;
}

export const useAppStore = create<SimulationState>()(
    persist(
        (set, get) => ({
            step: 'create',
            player: null,
            currentYear: 2003,
            entryMethod: 'Draft',
            startTeam: '',
            strategy: null,
            injuriesEnabled: true,
            seasons: [],
            lastSeason: null,
            isSimulating: false,
            error: null,
            currentAttributes: null,
            currentBadges: [],
            xp: 0,

            setStep: (step) => set({ step }),
            setPlayer: (player) => {
                if (player) {
                    set({ player, currentAttributes: player.stats, currentBadges: player.badges, xp: player.xp || 0 });
                } else {
                    set({ player: null, currentAttributes: null, currentBadges: [], xp: 0 });
                }
            },
            setCurrentYear: (currentYearInput) => set((state) => ({ currentYear: typeof currentYearInput === 'function' ? currentYearInput(state.currentYear) : currentYearInput })),
            setEntryMethod: (entryMethod) => set({ entryMethod }),
            setStartTeam: (startTeam) => set({ startTeam }),
            setStrategy: (strategy) => set({ strategy }),
            setInjuriesEnabled: (injuriesEnabled) => set({ injuriesEnabled }),
            setSeasons: (seasonsInput) => set((state) => ({ seasons: typeof seasonsInput === 'function' ? seasonsInput(state.seasons) : seasonsInput })),
            setLastSeason: (lastSeason) => set({ lastSeason }),
            setIsSimulating: (isSimulating) => set({ isSimulating }),
            setError: (error) => set({ error }),
            setCurrentAttributes: (currentAttributes) => set({ currentAttributes }),
            setCurrentBadges: (currentBadges) => set({ currentBadges }),
            setXp: (xpInput) => set((state) => ({ xp: typeof xpInput === 'function' ? xpInput(state.xp) : xpInput })),
            reset: () => set({
                step: 'create',
                player: null,
                seasons: [],
                lastSeason: null,
                currentAttributes: null,
                currentBadges: [],
                xp: 0,
                error: null,
                strategy: null
            }),
        }),
        {
            name: 'nexus-court-storage',
            partialize: (state) => ({
                step: state.step,
                player: state.player,
                currentYear: state.currentYear,
                entryMethod: state.entryMethod,
                startTeam: state.startTeam,
                strategy: state.strategy,
                injuriesEnabled: state.injuriesEnabled,
                seasons: state.seasons,
                lastSeason: state.lastSeason,
                currentAttributes: state.currentAttributes,
                currentBadges: state.currentBadges,
                xp: state.xp
            }),
        }
    )
);
