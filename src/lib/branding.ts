import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandingState {
  companyName: string;
  logoUrl: string;
  updateBranding: (name: string, logo: string) => void;
}

export const useBranding = create<BrandingState>()(
  persist(
    (set) => ({
      companyName: 'VideoAsk',
      logoUrl: '',
      updateBranding: (name: string, logo: string) => set({ 
        companyName: name, 
        logoUrl: logo 
      }),
    }),
    {
      name: 'branding-storage',
    }
  )
);