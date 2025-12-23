import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface WatchlistStore {
    watchlist: string[];
    addToWatchlist: (commodityId: string) => void;
    removeFromWatchlist: (commodityId: string) => void;
    toggleWatchlist: (commodityId: string) => void;
    isInWatchlist: (commodityId: string) => boolean;
    clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
    devtools(
        persist(
            (set, get) => ({
                watchlist: [],

                addToWatchlist: (commodityId) =>
                    set((state) => ({
                        watchlist: state.watchlist.includes(commodityId)
                            ? state.watchlist
                            : [...state.watchlist, commodityId],
                    })),

                removeFromWatchlist: (commodityId) =>
                    set((state) => ({
                        watchlist: state.watchlist.filter((id) => id !== commodityId),
                    })),

                toggleWatchlist: (commodityId) => {
                    const { watchlist } = get();
                    if (watchlist.includes(commodityId)) {
                        get().removeFromWatchlist(commodityId);
                    } else {
                        get().addToWatchlist(commodityId);
                    }
                },

                isInWatchlist: (commodityId) => {
                    return get().watchlist.includes(commodityId);
                },

                clearWatchlist: () => set({ watchlist: [] }),
            }),
            {
                name: 'commodity-watchlist',
            }
        )
    )
);
