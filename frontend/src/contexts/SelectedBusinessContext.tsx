import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBusinesses } from '../services/businesses';

interface Business { id: string; brand_name: string }

interface SelectedBusinessContextValue {
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  businesses: Business[];
  setBusinesses: (bs: Business[]) => void;
}

const SelectedBusinessContext = createContext<SelectedBusinessContextValue | undefined>(undefined);

export const SelectedBusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessIdState] = useState<string | null>(() => {
    try { return localStorage.getItem('selectedBusinessId'); } catch (e) { return null; }
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const bs = await getBusinesses();
        if (!mounted) return;
        setBusinesses(bs || []);
        try {
          const current = localStorage.getItem('selectedBusinessId');
          if (!current && bs && bs.length > 0) {
            localStorage.setItem('selectedBusinessId', bs[0].id);
            setSelectedBusinessIdState(bs[0].id);
          }
        } catch (err) {
        }
      } catch (err) {
      }
    };

    load();

    const onAuthLogin = () => {
      load();
    };

    window.addEventListener('auth:login', onAuthLogin);

    return () => { mounted = false; window.removeEventListener('auth:login', onAuthLogin); };
  }, []);

  function setSelectedBusinessId(id: string | null) {
    try {
      if (id) localStorage.setItem('selectedBusinessId', id);
      else localStorage.removeItem('selectedBusinessId');
    } catch (e) {}
    setSelectedBusinessIdState(id);
  }

  return (
    <SelectedBusinessContext.Provider value={{ selectedBusinessId, setSelectedBusinessId, businesses, setBusinesses }}>
      {children}
    </SelectedBusinessContext.Provider>
  );
};

export function useSelectedBusiness() {
  const ctx = useContext(SelectedBusinessContext);
  if (!ctx) throw new Error('useSelectedBusiness must be used within SelectedBusinessProvider');
  return ctx;
}
