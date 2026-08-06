import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { z } from 'zod';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, isAuthenticated } = useAuthStore();
  
  // If already authenticated, redirect to admin dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const from = location.state?.from?.pathname || '/admin';

  const onFinish = async (values: LoginFormData) => {
    // Client-side Zod validation check
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((err: z.ZodIssue) => message.error(err.message));
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', values);
      setAuth(response.data.admin, response.data.accessToken);
      message.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Invalid username or password');
      } else {
        message.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Jeelani Fest 2026</h1>
            <p className="text-gray-500 font-body">Admin Portal Login</p>
          </div>

          <Form
            name="admin_login"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            className="font-body"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Username" 
                className="rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="Password"
                className="rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-12 rounded-lg text-base font-semibold"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
