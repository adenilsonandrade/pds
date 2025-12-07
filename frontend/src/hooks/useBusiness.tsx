import { useEffect, useState } from 'react';
import { useSelectedBusiness } from '../contexts/SelectedBusinessContext';
import { getBusinesses } from '../services/businesses';

export default function useBusiness() {
  const { businesses, selectedBusinessId, setBusinesses } = useSelectedBusiness();
  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (selectedBusinessId) {
          const found = (businesses || []).find(b => b.id === selectedBusinessId);
          if (found) {
            if (!mounted) return;
            setBusiness(found);
            setLoading(false);
            return;
          }
          try {
            const list = await getBusinesses();
            if (!mounted) return;
            setBusinesses(list || []);
            const f = (list || []).find((b: any) => b.id === selectedBusinessId);
            if (f) setBusiness(f);
            setLoading(false);
            return;
          } catch (e) {
            // ignore
          }
        }

        try {
          const res = await fetch('/api/businesses/info', { method: 'GET', cache: 'no-store' });
          if (res.ok) {
            const info = await res.json();
            if (!mounted) return;
            setBusiness(info || null);
          } else {
            setBusiness(null);
          }
        } catch (e) {
          setBusiness(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [selectedBusinessId, JSON.stringify(businesses || [])]);

  return { business, businessId: business ? business.id : selectedBusinessId, loading };
}
