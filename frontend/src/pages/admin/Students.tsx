import { useState, useEffect } from 'react';
import type { MenuProps } from 'antd';
import { 
  Table, Button, Input, Modal, Drawer, 
  Form, Space, message, Typography, Avatar, Tag, Select, Upload, Dropdown
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
        return (
          <Tag 
            color={progs.length > 0 ? "purple" : "default"}
            className="cursor-pointer font-bold"
            onClick={() => openDetailModal(record)}
          >
            {progs.length} {progs.length === 1 ? 'Program' : 'Programs'}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        const items: MenuProps['items'] = [
          { key: 'edit', label: 'Edit Profile', icon: <EditOutlined />, onClick: () => openDrawer(record) },
          { key: 'programs', label: 'Manage Programs', icon: <ProfileOutlined />, onClick: () => openProgramsDrawer(record._id) },
          { type: 'divider' },
          { key: 'delete', label: 'Delete Student', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record._id) }
        ];

        return (
          <Space size="small">
            <Button 
              icon={<EyeOutlined />} 
              type="text" 
              onClick={() => openDetailModal(record)} 
              title="View Student Profile"
            />
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button type="text">Manage</Button>
            </Dropdown>
          </Space>
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

      {/* Premium Student Profile Details Modal */}
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" className="bg-sky-600 font-semibold" onClick={() => setDetailModalVisible(false)}>
            Close Profile
          </Button>
        ]}
        width={600}
        title={null}
        closable={true}
        bodyStyle={{ padding: 0, borderRadius: '1rem', overflow: 'hidden' }}
      >
        {selectedStudent && (
          <div className="bg-white">
            {/* Header Ribbon */}
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white relative">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {selectedStudent.profileImage ? (
                    <Avatar src={selectedStudent.profileImage} size={76} className="border-4 border-white/20 shadow-xl" />
                  ) : (
                    <Avatar size={76} className="bg-gradient-to-tr from-sky-500 to-indigo-500 font-black text-3xl border-4 border-white/20 shadow-xl">
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  {selectedStudent.chestNo && (
                    <span className="absolute -bottom-2 font-mono left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 text-sky-400 text-[10px] font-black tracking-wider border border-sky-400/40 shadow-sm">
                      #{selectedStudent.chestNo}
                    </span>
                  )}
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono font-bold tracking-widest text-sky-300 uppercase mb-1">
                    Student Participant Profile
                  </div>
                  <h2 className="text-2xl font-black text-white font-display leading-tight">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold">
                      Class {selectedStudent.class}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold uppercase">
                      {selectedStudent.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold">
                      🏠 {selectedStudent.group?.name || 'No House Group'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-200/60 text-center shadow-2xs">
                  <div className="text-[11px] font-mono font-black text-emerald-700 uppercase tracking-widest">Total Points</div>
                  <div className="text-3xl font-black text-emerald-600 font-mono mt-1">{selectedStudent.points || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 via-sky-50 to-white border border-sky-200/60 text-center shadow-2xs">
                  <div className="text-[11px] font-mono font-black text-sky-700 uppercase tracking-widest">Enrolled Programs</div>
                  <div className="text-3xl font-black text-sky-600 font-mono mt-1">{selectedStudent.programs?.length || 0}</div>
                </div>
              </div>

              {/* Enrolled Programs & Performance */}
              <div>
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Enrolled Competitions & Results ({selectedStudent.programs?.length || 0})
                </div>

                {selectedStudent.programs && selectedStudent.programs.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedStudent.programs.map((p: any, idx: number) => {
                      const compName = p.competition?.name || 'Unknown Competition';
                      const catStr = p.competition?.category ? `(${p.competition.category.toUpperCase()})` : '';
                      const dateStr = p.competition?.date;
                      const timeStr = p.competition?.time;
                      const stageStr = p.competition?.stage ? (p.competition.stage === 'stage1' ? 'Stage 1' : p.competition.stage === 'stage2' ? 'Stage 2' : 'Off Stage') : null;
                      const rank = p.rankAwarded;
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                          <div>
                            <div className="font-bold text-xs text-slate-900 font-display">
                              {compName} <span className="text-slate-400 font-normal text-[11px] ml-1">{catStr}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                              <span className="font-medium text-slate-600">
                                {p.competition?.type ? `Type: ${p.competition.type}` : 'Individual Event'}
                              </span>
                              {(dateStr || timeStr) && (
                                <span className="inline-flex items-center gap-1 font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                                  📅 {dateStr || 'Date TBD'} {timeStr ? `⏰ ${timeStr}` : ''}
                                </span>
                              )}
                              {stageStr && (
                                <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                  📍 {stageStr}
                                </span>
                              )}
                            </div>
                          </div>
                          {rank ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-2xs ${
                              rank === '1st' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              rank === '2nd' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                              'bg-orange-100 text-orange-800 border border-orange-300'
                            }`}>
                              {rank === '1st' ? '🥇 1st Place' : rank === '2nd' ? '🥈 2nd Place' : '🥉 3rd Place'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-slate-100">
                              Enrolled
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No programs enrolled for this student.
                  </div>
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
