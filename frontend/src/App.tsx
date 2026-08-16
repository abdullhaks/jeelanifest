import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { message } from 'antd';
import router from './router';
import apiClient from './services/apiClient';
import { RealtimeProvider } from './components/publiccomponents/RealtimeProvider';

function App() {
  useEffect(() => {
    // Record visitor hit on project initialization
    apiClient.post('/public/visitors/hit').catch((err) => {
      console.warn('Visitor counter log skipped/failed:', err?.message);
    });

    // Initial health check call
    apiClient
      .get('/health')
      .then((res) => {
        console.log('✅ Backend health check:', res.data);
        message.success('Assalamu Alaikum', 4);
      })
      .catch((err) => {
        console.error('❌ Backend unreachable:', err.message);
        toast.error('Backend server is unreachable. Some features may not work.', {
          duration: 5000,
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            borderRadius: '12px',
          },
        });
      });
  }, []);

  return (
    <RealtimeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-primary)',
          },
        }}
      />
      <RouterProvider router={router} />
    </RealtimeProvider>
  );
}

export default App;
