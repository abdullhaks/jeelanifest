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
      className="h-screen sticky top-0 left-0 z-50 bg-white border-r border-slate-100 shadow-sm"
      theme="light"
      width={250}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-white">
        {collapsed ? (
          <div className="w-full flex items-center justify-center">
            <span className="text-xl font-black font-display tracking-tight text-sky-600">JF</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
                <img src="/logo1.png" alt="" className='w-full h-full object-cover rounded-xl' />
              </div>
              <span className="text-base font-extrabold font-display tracking-tight text-slate-900 truncate">
                Jeelani Fest <span className="text-amber-600 font-mono text-sm font-bold">26</span>
              </span>
            </div>
            {isMobile && (
              <button
                onClick={() => onCollapse(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) {
            onCollapse(true);
          }
        }}
        items={menuItems}
        className="border-none font-body mt-4 font-medium"
      />
    </Sider>
  );
};

export default Sidebar;
