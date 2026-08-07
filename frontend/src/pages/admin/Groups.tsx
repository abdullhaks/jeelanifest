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
const { Title } = Typography;

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
    try {
      const response = await apiClient.get(`/groups/${record._id}/breakdown`);
      setSelectedGroup(response.data);
      setDetailModalVisible(true);
    } catch (err) {
      const fullGroup = await loadGroupDetails(record._id);
      if (fullGroup) {
        setSelectedGroup({
          group: fullGroup,
          totalPoints: fullGroup.totalPoints || 0,
          members: fullGroup.members || [],
          topScorers: (fullGroup.members || []).filter((m: any) => (m.points || 0) > 0),
          pointBreakdown: []
        });
        setDetailModalVisible(true);
      }
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
      render: (_: any, record: any) => {
        const count = record.membersCount ?? record.studentCount ?? record.members?.length ?? 0;
        return (
          <Tag color="geekblue" className="font-bold px-2.5 py-0.5 rounded-full text-xs">
            👥 {count} {count === 1 ? 'Member' : 'Members'}
          </Tag>
        );
      }
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      sorter: true,
      render: (points: number) => <span className="font-black text-lg text-emerald-600 font-mono">{points || 0} pts</span>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => openDetailModal(record)} type="text" title="View Group Details" />
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
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ruby House" />
          </Form.Item>

          <Form.Item label="Group Logo" name="logoUrl">
            <div className="flex items-center gap-4">
              <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Select Logo</Button>
              </Upload>
              {logoPreview && (
                <Avatar src={logoPreview} size="large" />
              )}
            </div>
          </Form.Item>

          {editingId && (
            <>
              <div className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-1 mt-4">
                Assign Leaders (Max 3)
              </div>
              <Form.Item name="mainLeader" label="Main Leader">
                <Select allowClear placeholder="Select Main Leader">
                  {leaderOptions.map(m => (
                    <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="assistant1" label="Assistant Leader 1">
                <Select allowClear placeholder="Select Assistant Leader 1">
                  {leaderOptions.map(m => (
                    <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="assistant2" label="Assistant Leader 2">
                <Select allowClear placeholder="Select Assistant Leader 2">
                  {leaderOptions.map(m => (
                    <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

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

      {/* Premium Group Details Modal */}
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" className="bg-sky-600 font-semibold" onClick={() => setDetailModalVisible(false)}>
            Done
          </Button>
        ]}
        width={720}
        title={null}
        closable={true}
        style={{ top: '10vh' }}
        bodyStyle={{ padding: 0, borderRadius: '1rem', overflow: 'hidden', height: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {selectedGroup && (() => {
          const grp = selectedGroup.group || selectedGroup;
          const totalPts = selectedGroup.totalPoints ?? grp.totalPoints ?? 0;
          const topScorers = selectedGroup.topScorers || [];
          const membersList = selectedGroup.members || grp.members || [];
          const pointBreakdown = selectedGroup.pointBreakdown || [];

          return (
            <div className="bg-white flex flex-col h-full overflow-hidden">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white relative shrink-0">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {grp.logoUrl ? (
                      <Avatar src={grp.logoUrl} size={72} className="border-4 border-white/20 shadow-xl" />
                    ) : (
                      <Avatar size={72} className="bg-gradient-to-tr from-sky-500 to-teal-400 font-black text-3xl border-4 border-white/20 shadow-xl">
                        {grp.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
                      ✨
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono font-bold tracking-widest text-sky-300 uppercase mb-1">
                      House Group Profile
                    </div>
                    <h2 className="text-2xl font-black text-white font-display leading-tight">{grp.name}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-extrabold">
                        🏆 {totalPts} Total Points
                      </span>
                      <span className="text-slate-400 text-xs font-medium">
                        👥 {membersList.length} Members Enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Leaders Section */}
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Group Leadership Team
                  </div>
                  {grp.leaders && grp.leaders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {grp.leaders.map((leader: any, index: number) => {
                        const isMain = index === 0;
                        return (
                          <div key={leader._id || index} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                            <Avatar size={32} className={isMain ? "bg-amber-500 text-white font-bold" : "bg-sky-500 text-white font-bold"}>
                              {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                            </Avatar>
                            <div className="overflow-hidden">
                              <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${isMain ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>
                                {isMain ? 'Main Leader' : `Assistant ${index}`}
                              </span>
                              <div className="font-bold text-xs text-slate-800 truncate mt-0.5">
                                {leader.name || 'Assigned Leader'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No leadership roles assigned yet.
                    </div>
                  )}
                </div>

                {/* Point Breakdown Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      📊 Itemized Point Breakdown ({pointBreakdown.length})
                    </div>
                  </div>

                  {pointBreakdown.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {pointBreakdown.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                            <Avatar src={item.participantPhoto} size={36} className="border border-slate-200 shrink-0">
                              {item.participantName?.charAt(0) || 'G'}
                            </Avatar>
                            <div>
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                                <span>{item.competitionName}</span>
                                {item.category && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                Winner: <span className="font-semibold text-slate-800">{item.participantName}</span> {item.chestCode && `(${item.chestCode})`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                              item.rank === '1st' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              item.rank === '2nd' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                              'bg-orange-100 text-orange-800 border border-orange-300'
                            }`}>
                              {item.rank === '1st' ? '🥇 1st' : item.rank === '2nd' ? '🥈 2nd' : '🥉 3rd'}
                            </span>
                            <span className="font-mono font-black text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                              +{item.pointsAwarded} marks
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No published competition points recorded yet.
                    </div>
                  )}
                </div>

                {/* Top Scorers Section */}
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                    🌟 Top Scoring Members ({topScorers.length})
                  </div>

                  {topScorers.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {topScorers.map((st: any, idx: number) => (
                        <div key={st._id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <Avatar src={st.profileImage} size={32} className="border border-slate-200 shrink-0">
                              {st.name?.charAt(0)}
                            </Avatar>
                            <div className="overflow-hidden">
                              <div className="font-bold text-xs text-slate-900 truncate">{st.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                Chest: {st.chestNo || 'N/A'} • Class {st.class}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 shrink-0">
                            {st.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No student scores recorded yet.
                    </div>
                  )}
                </div>

                {/* Members Roster Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      👥 Enrolled House Members ({membersList.length})
                    </div>
                  </div>

                  {membersList.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {membersList.map((member: any) => (
                        <div key={member._id} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {member.profileImage ? (
                              <Avatar src={member.profileImage} size={32} />
                            ) : (
                              <Avatar size={32} className="bg-sky-600 text-white font-bold text-xs">
                                {member.name ? member.name.charAt(0).toUpperCase() : 'S'}
                              </Avatar>
                            )}
                            <div className="overflow-hidden">
                              <div className="font-bold text-xs text-slate-900 truncate">{member.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Class {member.class} {member.category && `• ${member.category}`}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                            {member.points || 0} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No members enrolled in this house group yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Groups;
