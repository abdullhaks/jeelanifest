import { useState } from 'react';
import { Button, Dropdown, Input, Modal, Form, message } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  LogoutOutlined, 
  KeyOutlined, 
  ExclamationCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const { confirm } = Modal;

interface TopbarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

const Topbar = ({ collapsed, onCollapse, isMobile: _isMobile }: TopbarProps) => {
  const { admin, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined className="text-rose-500" />,
      content: 'You will need to sign in again to access the admin portal.',
      okText: 'Yes, Log Out',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (e) {
          // Ignore errors on logout
        } finally {
          clearAuth();
          navigate('/admin/login', { replace: true });
        }
      },
    });
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully');
      setIsPasswordModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <KeyOutlined className="text-sky-600 text-sm" />,
      label: <span className="font-semibold text-slate-700 text-xs">Change Password</span>,
      onClick: () => setIsPasswordModalVisible(true),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-rose-600 text-sm" />,
      label: <span className="font-semibold text-rose-600 text-xs">Log Out</span>,
      onClick: handleLogout,
    },
  ];

  const username = admin?.username || 'jeelanifestadmin';

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 h-16 flex items-center justify-between shadow-2xs sticky top-0 z-40">
        {/* Left Side: Collapse Toggle & Portal Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onCollapse(!collapsed)}
            className="w-9 h-9 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle navigation menu"
          >
            {collapsed ? <MenuUnfoldOutlined className="text-base" /> : <MenuFoldOutlined className="text-base" />}
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-widest bg-sky-50 text-sky-700 border border-sky-200/80 uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Right Side: Admin User Dropdown Pill */}
        <div className="flex items-center space-x-4">
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            dropdownRender={(menu) => (
              <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[220px]">
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-slate-950 font-black text-base shadow-md border-2 border-white/20">
                        <img src="/logo1.png" alt="" className='w-full h-full object-cover rounded-full' />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-sm text-white truncate font-display">
                        {username}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider">
                        Super Administrator
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  {menu}
                </div>
              </div>
            )}
          >
            <div className="flex items-center my-5 space-x-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/90 py-1.5 px-3 rounded-full border border-slate-200/80 transition-all shadow-2xs group">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                  <img src="/logo1.png" alt="" className='w-full h-full object-cover rounded-full' />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <span className="font-bold text-xs text-slate-800 font-display group-hover:text-sky-600 transition-colors">
                {username}
              </span>
              <DownOutlined className="text-[10px] text-slate-400 group-hover:text-slate-600 group-hover:translate-y-0.5 transition-all" />
            </div>
          </Dropdown>
        </div>
      </header>

      <Modal
        title="Change Password"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          className="mt-4"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setIsPasswordModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Topbar;
