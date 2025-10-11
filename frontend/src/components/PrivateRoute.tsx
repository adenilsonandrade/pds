import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

interface Props {
  children: React.ReactElement;
}

export default function PrivateRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getCurrentUser();
        if (!mounted) return;
        setAuthorized(true);
      } catch (e) {
        if (!mounted) return;
        setAuthorized(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}
