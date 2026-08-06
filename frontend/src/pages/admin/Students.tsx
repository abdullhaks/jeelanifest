import { useState, useEffect } from 'react';
import type { MenuProps } from 'antd';
import { 
  Table, Button, Input, Modal, Drawer, 
  Form, Space, message, Typography, Avatar, Tag, Select, Upload, Dropdown, Row, Col
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, ProfileOutlined, EyeOutlined
} from '@ant-design/icons';
import { z } from 'zod';
import apiClient from '../../services/apiClient';

const { confirm } = Modal;
const { Title, Text } = Typography;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  class: z.string().min(1, 'Class is required'),
  group: z.string().min(1, 'Group is required'),
  category: z.enum(['subJunior', 'junior', 'senior']),
  chestNo: z.string().optional(),
  profileImage: z.string().url().optional().nullable(),
});

const Students = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{group?: string, category?: string}>({});
  const [sort, setSort] = useState<{sortBy: string, sortOrder: string}>({ sortBy: 'points', sortOrder: 'desc' });

  // Drawers
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [programsDrawerVisible, setProgramsDrawerVisible] = useState(false);
  const [managingStudentId, setManagingStudentId] = useState<string | null>(null);
  const [validCompetitions, setValidCompetitions] = useState<any[]>([]);

  // Detail Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [form] = Form.useForm();
  const [programsForm] = Form.useForm();
  
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  // Fetch groups for filters and form
  useEffect(() => {
    apiClient.get('/groups?limit=100').then(res => {
      setGroups(res.data.data);
    }).catch(() => message.error('Failed to load groups'));
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit, filters, sort]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        ...(Object.keys(filters).length > 0 && { filter: JSON.stringify(filters) })
      });

      const response = await apiClient.get(`/students?${params}`);
      setData(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
    
    if (sorter.field) {
      setSort({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    }

    const newFilters: any = {};
    if (tableFilters.group?.[0]) newFilters.group = tableFilters.group[0];
    if (tableFilters.category?.[0]) newFilters.category = tableFilters.category[0];
    setFilters(newFilters);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this student?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`/students/${id}`);
          message.success('Student deleted');
          fetchStudents();
        } catch (error) {
          // Handled globally
        }
      },
    });
  };

  const openDrawer = (record?: any) => {
    setSelectedImageFile(null);
    setImagePreview(null);
    
    if (record) {
      setEditingId(record._id);
      setImagePreview(record.profileImage);
      form.setFieldsValue({
        name: record.name,
        class: record.class,
        group: record.group?._id || record.group,
        category: record.category,
        chestNo: record.chestNo,
        profileImage: record.profileImage,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const loadStudentDetails = async (id: string) => {
    try {
      const res = await apiClient.get(`/students/${id}`);
      return res.data;
    } catch (error) {
      return null;
    }
  };

  const openDetailModal = async (record: any) => {
    const student = await loadStudentDetails(record._id);
    if (student) {
      setSelectedStudent(student);
      setDetailModalVisible(true);
    }
  };

  const openProgramsDrawer = async (studentId: string) => {
    setManagingStudentId(studentId);
    programsForm.resetFields();
    try {
      // Load valid competitions
      const compsRes = await apiClient.get(`/students/${studentId}/valid-competitions`);
      setValidCompetitions(compsRes.data);
      
      // Load current student programs
      const studRes = await apiClient.get(`/students/${studentId}`);
      const compIds = studRes.data.programs?.map((p: any) => 
        typeof p.competition === 'object' ? p.competition._id : p.competition
      ) || [];
      programsForm.setFieldsValue({ competitionIds: compIds });
      setProgramsDrawerVisible(true);
    } catch (error) {
      // Handled globally
    }
  };

  const handleBeforeUpload = (file: File) => {
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    form.setFieldsValue({ profileImage: previewUrl });
    return false;
  };

  const uploadProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/students/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const onFormFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = values.profileImage;
      if (selectedImageFile) {
        finalImageUrl = await uploadProfileImage(selectedImageFile);
      }

      const payload = { ...values, profileImage: finalImageUrl };
      
      const result = formSchema.safeParse(payload);
      if (!result.success) {
        result.error.issues.forEach(err => message.error(err.message));
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await apiClient.put(`/students/${editingId}`, payload);
        message.success('Student updated');
      } else {
        await apiClient.post('/students', payload);
        message.success('Student created');
      }
      setDrawerVisible(false);
      fetchStudents();
    } catch (error: any) {
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const onProgramsFinish = async (values: any) => {
    if (!managingStudentId) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/students/${managingStudentId}/programs`, values);
      message.success('Programs assigned successfully');
      setProgramsDrawerVisible(false);
      fetchStudents();
    } catch (error) {
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStarRating = (rank: string | null) => {
    if (rank === '1st') return '⭐⭐⭐';
    if (rank === '2nd') return '⭐⭐';
    if (rank === '3rd') return '⭐';
    return '';
  };

  const groupFilterOptions = groups.map(g => ({ text: g.name, value: g._id }));

  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      sorter: true,
      render: (text: string, record: any) => (
        <Space>
          {record.profileImage ? (
            <Avatar src={record.profileImage} />
          ) : (
            <Avatar style={{ backgroundColor: '#1890ff' }}>
              {text.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <div>
            <div className="font-semibold">{text}</div>
            <div className="text-xs text-gray-500">Class: {record.class}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Chest No',
      dataIndex: 'chestNo',
      render: (chestNo: string) => chestNo ? <Tag color="cyan">{chestNo}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: 'Group',
      dataIndex: 'group',
      filters: groupFilterOptions,
      filterMultiple: false,
      render: (group: any) => <Tag color="blue">{group?.name || 'Unknown'}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      filters: [
        { text: 'Sub Junior', value: 'subJunior' },
        { text: 'Junior', value: 'junior' },
        { text: 'Senior', value: 'senior' },
      ],
      filterMultiple: false,
      render: (cat: string) => <Tag>{cat?.toUpperCase()}</Tag>
    },
    {
      title: 'Points',
      dataIndex: 'points',
      sorter: true,
      render: (pts: number) => <span className="font-bold text-emerald-600">{pts}</span>
    },
    {
      title: 'Programs',
      render: (_: any, record: any) => {
        const progs = record.programs || [];
        if (progs.length === 0) return <span className="text-gray-400 text-xs">No programs</span>;
        
        return (
          <Space direction="vertical" size={2}>
            {progs.map((p: any, idx: number) => {
              const compName = p.competition?.name || 'Unknown';
              const rankStr = p.rankAwarded ? ` - ${p.rankAwarded.toUpperCase()} ${getStarRating(p.rankAwarded)}` : '';
              return (
                <div key={idx} className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                  <span className="font-medium">{compName}</span>
                  {rankStr && <span className="text-yellow-600 font-bold">{rankStr}</span>}
                </div>
              );
            })}
          </Space>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: 'View Profile', icon: <EyeOutlined />, onClick: () => openDetailModal(record) },
          { key: 'edit', label: 'Edit Profile', icon: <EditOutlined />, onClick: () => openDrawer(record) },
          { key: 'programs', label: 'Manage Programs', icon: <ProfileOutlined />, onClick: () => openProgramsDrawer(record._id) },
          { type: 'divider' },
          { key: 'delete', label: 'Delete Student', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record._id) }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text">Manage</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!m-0 font-display">Students</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openDrawer()}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Add Student
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <Input
          placeholder="Search students by name or chest no..."
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
        title={editingId ? 'Edit Student Profile' : 'Create Student'}
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish}>
          <Form.Item name="name" label="Student Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="chestNo" label="Chest No (Optional)">
            <Input placeholder="e.g. 101" />
          </Form.Item>

          <Form.Item name="class" label="Class" rules={[{ required: true }]}>
            <Input placeholder="e.g. 10A" />
          </Form.Item>

          <Form.Item name="group" label="Group" rules={[{ required: true }]}>
            <Select placeholder="Select group">
              {groups.map(g => (
                <Select.Option key={g._id} value={g._id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="subJunior">Sub Junior</Select.Option>
              <Select.Option value="junior">Junior</Select.Option>
              <Select.Option value="senior">Senior</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Profile Image" name="profileImage">
            <div className="flex items-center gap-4">
              <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
              {imagePreview && (
                <Avatar src={imagePreview} size="large" />
              )}
            </div>
          </Form.Item>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-end">
            <Space>
              <Button onClick={() => setDrawerVisible(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
                {editingId ? 'Save' : 'Create'}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>

      <Drawer
        title="Manage Enrolled Programs"
        width={500}
        onClose={() => setProgramsDrawerVisible(false)}
        open={programsDrawerVisible}
      >
        <div className="mb-4 text-sm text-gray-500">
          This list only shows competitions valid for this student's category and group. 
          Ranks are preserved automatically during updates.
        </div>
        <Form form={programsForm} layout="vertical" onFinish={onProgramsFinish}>
          <Form.Item name="competitionIds" label="Select Competitions">
            <Select mode="multiple" placeholder="Select valid competitions">
              {validCompetitions.map(c => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name} {c.category ? `(${c.category})` : ''} - {c.type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmitting} block style={{ backgroundColor: 'var(--color-primary)' }}>
            Update Programs
          </Button>
        </Form>
      </Drawer>

      <Modal
        title="Student Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {selectedStudent.profileImage ? (
                <Avatar src={selectedStudent.profileImage} size={80} />
              ) : (
                <Avatar size={80} style={{ backgroundColor: '#1890ff', fontSize: 36 }}>
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <div>
                <Title level={4} className="!m-0">{selectedStudent.name}</Title>
                <div className="text-gray-500">
                  Class: {selectedStudent.class} 
                  {selectedStudent.chestNo && ` | Chest No: ${selectedStudent.chestNo}`}
                </div>
                <div className="mt-1">
                  <Tag color="blue">{selectedStudent.group?.name || 'No Group'}</Tag>
                  <Tag>{selectedStudent.category?.toUpperCase()}</Tag>
                </div>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Total Points</div>
                  <div className="text-2xl font-bold text-emerald-600">{selectedStudent.points}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">Programs</div>
                  <div className="text-2xl font-bold">{selectedStudent.programs?.length || 0}</div>
                </div>
              </Col>
            </Row>

            <div>
              <Text strong>Enrolled Programs & Results</Text>
              <div className="mt-2 space-y-2">
                {selectedStudent.programs?.map((p: any, idx: number) => {
                  const compName = p.competition?.name || 'Unknown';
                  const catStr = p.competition?.category ? `(${p.competition.category})` : '';
                  const rankStr = p.rankAwarded ? ` - ${p.rankAwarded.toUpperCase()} ${getStarRating(p.rankAwarded)}` : '';
                  return (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      <div>
                        <div className="font-medium">{compName} <span className="text-gray-500 text-xs">{catStr}</span></div>
                      </div>
                      {rankStr && <span className="text-yellow-600 font-bold">{rankStr}</span>}
                    </div>
                  );
                })}
                {(!selectedStudent.programs || selectedStudent.programs.length === 0) && (
                  <Text type="secondary">No programs enrolled</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;
