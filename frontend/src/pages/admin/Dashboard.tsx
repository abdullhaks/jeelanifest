import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Skeleton, List, Typography, Badge, Space } from 'antd';
import { TrophyOutlined, TeamOutlined, UserOutlined, FlagOutlined, EyeOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '../../services/apiClient';

const { Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const { kpis, groups, recentActivity, studentCategories } = stats || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Dashboard</h1>
          <p className="text-gray-500 font-body">Overview of Jeelani Fest 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <Statistic
            title="Total Competitions"
            value={kpis?.totalCompetitions || 0}
            prefix={<TrophyOutlined className="text-amber-500" />}
            valueStyle={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <Statistic
            title="Active Groups"
            value={kpis?.totalGroups || 0}
            prefix={<TeamOutlined className="text-teal-500" />}
            valueStyle={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <Statistic
            title="Total Students"
            value={kpis?.totalStudents || 0}
            prefix={<UserOutlined className="text-blue-500" />}
            valueStyle={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <Statistic
            title="Results Published"
            value={kpis?.resultsPublished || 0}
            suffix={`/ ${kpis?.totalCompetitions || 0}`}
            prefix={<FlagOutlined className="text-rose-500" />}
            valueStyle={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/40 border border-purple-100/50">
          <Statistic
            title="Total Visitors"
            value={kpis?.totalVisitors ?? 0}
            prefix={<EyeOutlined className="text-purple-600" />}
            valueStyle={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: '#6B21A8' }}
          />
        </Card>
      </div>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Points Overview</h3>
            <div style={{ width: '100%', height: 320 }}>
              {groups?.length === 0 ? (
                <div className="text-gray-400 text-center py-10">No groups found</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groups} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`${value} Points`, 'Score']}
                    />
                    <Bar dataKey="points" radius={[0, 6, 6, 0]} barSize={32} animationDuration={1500} label={{ position: 'right', fill: '#6b7280', fontWeight: 600, fontSize: 13 }}>
                      {groups?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : 'var(--color-primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-lg mb-4">Student Demographics</h3>
              <Row gutter={[16, 16]}>
                {studentCategories?.map((c: any, i: number) => (
                  <Col span={8} key={i}>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-500 text-sm mb-1">{c.type}</div>
                      <div className="text-2xl font-bold font-display">{c.value}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Recent Competitions Updated</h3>
            <div className="flex-1 overflow-y-auto">
              <List
                dataSource={recentActivity}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" className="text-xs">
                            {new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString()}
                          </Text>
                          <Badge 
                            status={item.status === 'published' ? 'success' : item.status === 'completed' ? 'processing' : 'default'} 
                            text={item.status} 
                          />
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No recent activity' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
