import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Currency = 'USD' | 'KRW';

// 환율은 실제 서비스에서는 API로 받아야 하지만,
// 현재 MVP 단계에서는 고정값 사용 (2026년 2월 기준)
export const USD_TO_KRW_RATE = 1450;

interface CurrencyStore {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    toggleCurrency: () => void;
    convertPrice: (usdPrice: number) => number;
    formatCurrencySymbol: () => string;
}

export const useCurrencyStore = create<CurrencyStore>()(
    devtools(
        persist(
            (set, get) => ({
                currency: 'USD',

                setCurrency: (currency) => set({ currency }),

                toggleCurrency: () =>
                    set((state) => ({
                        currency: state.currency === 'USD' ? 'KRW' : 'USD',
                    })),

                convertPrice: (usdPrice: number) => {
                    const { currency } = get();
                    return currency === 'KRW' ? usdPrice * USD_TO_KRW_RATE : usdPrice;
                },

                formatCurrencySymbol: () => {
                    const { currency } = get();
                    return currency === 'KRW' ? '₩' : '$';
                },
            }),
            {
                name: 'commodity-currency',
            }
        )
    )
);
