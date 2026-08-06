import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  GraduationCap,
  Medal,
  Image as ImageIcon,
  GalleryVerticalEnd
} from 'lucide-react';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

const Sidebar = ({ collapsed, onCollapse, isMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/admin/competitions', icon: <Trophy size={18} />, label: 'Competitions' },
    { key: '/admin/groups', icon: <Users size={18} />, label: 'Groups' },
    { key: '/admin/students', icon: <GraduationCap size={18} />, label: 'Students' },
    { key: '/admin/results', icon: <Medal size={18} />, label: 'Results' },
    { key: '/admin/posters', icon: <ImageIcon size={18} />, label: 'Posters' },
    { key: '/admin/gallery', icon: <GalleryVerticalEnd size={18} />, label: 'Fest Gallery' },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      onBreakpoint={(broken) => {
        if (broken && !isMobile) {
          onCollapse(true);
        }
      }}
      className="h-screen sticky top-0 left-0 z-50 bg-white border-r border-gray-100 shadow-sm"
      theme="light"
      width={250}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        {collapsed ? (
          <span className="text-xl font-bold font-display" style={{ color: 'var(--color-primary)' }}>JF</span>
        ) : (
          <span className="text-xl font-bold font-display truncate px-4" style={{ color: 'var(--color-primary)' }}>
            Jeelani Fest 26
          </span>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
        className="border-none font-body mt-4 font-medium"
      />
    </Sider>
  );
};

export default Sidebar;
