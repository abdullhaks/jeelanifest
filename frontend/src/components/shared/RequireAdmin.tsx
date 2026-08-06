import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/apiClient';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface RequireAdminProps {
  children: React.ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { isAuthenticated, accessToken, setAccessToken, setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // If we don't have a token in state, silently attempt a refresh (in case of page reload)
      if (!accessToken) {
        try {
          const { data } = await apiClient.post('/auth/refresh');
          setAccessToken(data.accessToken);
          if (data.admin) {
            setAuth(data.admin, data.accessToken);
          }
        } catch (error) {
          // Silent failure, clear auth to be safe
          clearAuth();
        }
      }
      setIsInitializing(false);
    };

    checkAuth();
  }, [accessToken, setAccessToken, setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: 'var(--color-primary)' }} spin />} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;
