import { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Modal, Drawer, 
  Form, Space, message, Typography, Avatar, Tag, Select, Upload
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, EyeOutlined
} from '@ant-design/icons';
import { z } from 'zod';
import apiClient from '../../services/apiClient';

const { confirm } = Modal;
const { Title, Text } = Typography;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().url().optional().nullable(),
  leaders: z.array(z.string()).max(3, 'Cannot have more than 3 leaders').default([]),
});

const Groups = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{sortBy: string, sortOrder: string}>({ sortBy: 'totalPoints', sortOrder: 'desc' });

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  // Image upload state
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Current group members for leader selection
  const [currentMembers, setCurrentMembers] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGroups();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit, sort]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      });

      const response = await apiClient.get(`/groups?${params}`);
      setData(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any, _: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    if (sorter.field) {
      setSort({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this group?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will archive the group (soft delete).',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`/groups/${id}`);
          message.success('Group deleted successfully');
          fetchGroups();
        } catch (error) {
          // Handled globally
        }
      },
    });
  };

  const loadGroupDetails = async (id: string) => {
    try {
      const response = await apiClient.get(`/groups/${id}`);
      return response.data;
    } catch (err) {
      return null;
    }
  }

  const openDrawer = async (record?: any) => {
    setSelectedLogoFile(null);
    setLogoPreview(null);
    
    if (record) {
      // Need full group details to get populated members for leader selection
      const fullGroup = await loadGroupDetails(record._id);
      if (!fullGroup) return;

      setEditingId(fullGroup._id);
      setCurrentMembers(fullGroup.members || []);
      setLogoPreview(fullGroup.logoUrl);
      
      form.setFieldsValue({
        name: fullGroup.name,
        logoUrl: fullGroup.logoUrl,
        mainLeader: fullGroup.leaders[0] ? (typeof fullGroup.leaders[0] === 'string' ? fullGroup.leaders[0] : fullGroup.leaders[0]._id) : undefined,
        assistant1: fullGroup.leaders[1] ? (typeof fullGroup.leaders[1] === 'string' ? fullGroup.leaders[1] : fullGroup.leaders[1]._id) : undefined,
        assistant2: fullGroup.leaders[2] ? (typeof fullGroup.leaders[2] === 'string' ? fullGroup.leaders[2] : fullGroup.leaders[2]._id) : undefined,
      });
    } else {
      setEditingId(null);
      setCurrentMembers([]);
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const openDetailModal = async (record: any) => {
    const fullGroup = await loadGroupDetails(record._id);
    if (fullGroup) {
      setSelectedGroup(fullGroup);
      setDetailModalVisible(true);
    }
  };

  const handleBeforeUpload = (file: File) => {
    setSelectedLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    form.setFieldsValue({ logoUrl: previewUrl }); // bypass required check temporarily if needed
    return false; // Prevent auto upload
  };

  const uploadLogoFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/groups/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const onFormFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      let finalLogoUrl = values.logoUrl;

      if (selectedLogoFile) {
        finalLogoUrl = await uploadLogoFile(selectedLogoFile);
      }

      const leaders = [values.mainLeader, values.assistant1, values.assistant2].filter(Boolean);
      
      const payload = {
        name: values.name,
        logoUrl: finalLogoUrl,
        leaders: leaders,
      };

      const result = formSchema.safeParse(payload);
      if (!result.success) {
        result.error.issues.forEach(err => message.error(err.message));
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await apiClient.put(`/groups/${editingId}`, payload);
        message.success('Group updated');
      } else {
        await apiClient.post('/groups', payload);
        message.success('Group created');
      }
      setDrawerVisible(false);
      fetchGroups();
    } catch (error: any) {
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Group',
      dataIndex: 'name',
      sorter: true,
      render: (text: string, record: any) => (
        <Space>
          {record.logoUrl ? (
            <Avatar src={record.logoUrl} />
          ) : (
            <Avatar style={{ backgroundColor: 'var(--color-primary)' }}>
              {text.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <span className="font-semibold">{text}</span>
        </Space>
      )
    },
    {
      title: 'Members',
      render: (_: any, record: any) => <Tag color="blue">{record.members?.length || 0} Members</Tag>
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      sorter: true,
      render: (points: number) => <span className="font-bold text-lg text-emerald-600">{points}</span>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => openDetailModal(record)} type="text" />
          <Button icon={<EditOutlined />} onClick={() => openDrawer(record)} type="text" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} type="text" danger />
        </Space>
      ),
    },
  ];

  const leaderOptions = currentMembers.map(m => ({ label: m.name || m, value: m._id || m }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!m-0 font-display">Groups</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openDrawer()}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Add Group
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <Input
          placeholder="Search groups..."
          prefix={<SearchOutlined className="text-gray-400" />}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
          size="large"
          allowClear
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </div>

      <Drawer
        title={editingId ? 'Edit Group' : 'Create Group'}
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFormFinish}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="e.g. Red House" />
          </Form.Item>

          <Form.Item label="Group Logo" name="logoUrl">
            <div className="flex items-center gap-4">
              <Upload
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  Select Image
                </Button>
              </Upload>
              {logoPreview && (
                <Avatar src={logoPreview} size="large" />
              )}
            </div>
          </Form.Item>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <div className="font-semibold mb-3">Leader Assignment</div>
            <div className="text-xs text-gray-500 mb-4">Select leaders from the group's members. Add members via the Students page.</div>
            
            <Form.Item name="mainLeader" label="Main Leader">
              <Select placeholder="Select main leader" options={leaderOptions} allowClear />
            </Form.Item>
            <Form.Item name="assistant1" label="Assistant Leader 1">
              <Select placeholder="Select assistant leader" options={leaderOptions} allowClear />
            </Form.Item>
            <Form.Item name="assistant2" label="Assistant Leader 2">
              <Select placeholder="Select assistant leader" options={leaderOptions} allowClear />
            </Form.Item>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-end">
            <Space>
              <Button onClick={() => setDrawerVisible(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
                {editingId ? 'Save Changes' : 'Create'}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>

      <Modal
        title="Group Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {selectedGroup.logoUrl ? (
                <Avatar src={selectedGroup.logoUrl} size={64} />
              ) : (
                <Avatar size={64} style={{ backgroundColor: 'var(--color-primary)', fontSize: 32 }}>
                  {selectedGroup.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <div>
                <Title level={4} className="!m-0">{selectedGroup.name}</Title>
                <Text type="secondary" className="text-emerald-600 font-bold">{selectedGroup.totalPoints} Points</Text>
              </div>
            </div>

            <div>
              <Text strong>Leaders</Text>
              <ul className="mt-2 space-y-1">
                {selectedGroup.leaders?.map((leader: any, index: number) => (
                  <li key={leader._id || index}>
                    {index === 0 ? <Tag color="gold">Main</Tag> : <Tag color="cyan">Assistant</Tag>}
                    {leader.name || 'Unknown'}
                  </li>
                ))}
                {(!selectedGroup.leaders || selectedGroup.leaders.length === 0) && (
                  <Text type="secondary">No leaders assigned</Text>
                )}
              </ul>
            </div>

            <div>
              <Text strong>Members ({selectedGroup.members?.length || 0})</Text>
              <div className="mt-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                <ul className="list-disc pl-5">
                  {selectedGroup.members?.map((member: any) => (
                    <li key={member._id}>{member.name || 'Unknown'}</li>
                  ))}
                  {(!selectedGroup.members || selectedGroup.members.length === 0) && (
                    <Text type="secondary">No members found</Text>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
