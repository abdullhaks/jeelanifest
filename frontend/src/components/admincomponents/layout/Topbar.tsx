import { useState } from 'react';
import { Layout, Button, Dropdown, Input, Modal, Form, message } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, LogoutOutlined, KeyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { confirm } = Modal;

interface TopbarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

const Topbar = ({ collapsed, onCollapse, isMobile }: TopbarProps) => {
  const { admin, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
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
      icon: <KeyOutlined />,
      label: 'Change Password',
      onClick: () => setIsPasswordModalVisible(true),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log Out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Header className="bg-white px-4 h-16 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="flex items-center flex-1">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)}
            className="text-lg w-10 h-10 mr-4"
          />
          {!isMobile && (
            <Input
              placeholder="Search everywhere..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-64 md:w-96 rounded-full border-gray-200 bg-gray-50 focus:bg-white hover:bg-white transition-colors"
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 py-1 px-3 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#0f766e] flex items-center justify-center text-white font-semibold">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {!isMobile && (
                <span className="font-medium text-gray-700">{admin?.username}</span>
              )}
            </div>
          </Dropdown>
        </div>
      </Header>

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
