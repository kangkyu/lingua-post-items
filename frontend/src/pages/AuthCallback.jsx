import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    handleAuthCallback().then((result) => {
      navigate(result.success ? '/feed' : '/');
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
    </div>
  );
};

export default AuthCallback;
