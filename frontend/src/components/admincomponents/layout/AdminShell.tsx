import { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RequireAdmin from '../../shared/RequireAdmin';

const { Content } = Layout;

const AdminShell = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <RequireAdmin>
      <Layout className="h-screen overflow-hidden bg-gray-50">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar collapsed={collapsed} onCollapse={setCollapsed} isMobile={isMobile} />
        )}

        {/* Mobile Sidebar (Drawer) */}
        {isMobile && (
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setCollapsed(true)}
            open={!collapsed}
            bodyStyle={{ padding: 0 }}
            width={250}
          >
            <Sidebar collapsed={false} onCollapse={() => setCollapsed(true)} isMobile={isMobile} />
          </Drawer>
        )}

        <Layout className="flex-1 overflow-hidden transition-all duration-300">
          <Topbar collapsed={collapsed} onCollapse={setCollapsed} isMobile={isMobile} />
          
          <Content className="p-6 md:p-8 lg:p-10 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </RequireAdmin>
  );
};

export default AdminShell;
