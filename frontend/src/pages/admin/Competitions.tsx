import { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Select, Space, Modal, Drawer, 
  Form, Checkbox, Radio, Dropdown, message, Tag, Typography, Row, Col, Spin, Avatar
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, UserOutlined
} from '@ant-design/icons';
import { z } from 'zod';
import apiClient from '../../services/apiClient';

const { confirm } = Modal;
const { Title, Text } = Typography;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['group', 'individual']),
  categories: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  date: z.string().optional(),
  time: z.string().optional(),
  stage: z.enum(['stage1', 'stage2', 'offStage']).nullable().optional(),
  groupEntries: z.array(z.object({
    group: z.string().min(1),
    chestCodes: z.array(z.string())
  })).optional(),
});

const Competitions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{type?: string, status?: string, stage?: string}>({});
  const [sort, setSort] = useState<{sortBy: string, sortOrder: string}>({ sortBy: 'createdAt', sortOrder: 'desc' });

  // Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsData, setParticipantsData] = useState<any[]>([]);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [groups, setGroups] = useState<any[]>([]);
  
  const compType = Form.useWatch('type', form);

  useEffect(() => {
    apiClient.get('/groups?limit=100').then(res => setGroups(res.data.data)).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCompetitions();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit, filters, sort]);

  const fetchCompetitions = async () => {
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

      const response = await apiClient.get(`/competitions?${params}`);
      setData(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      message.error('Failed to fetch competitions');
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
    if (tableFilters.type?.[0]) newFilters.type = tableFilters.type[0];
    if (tableFilters.status?.[0]) newFilters.status = tableFilters.status[0];
    if (tableFilters.stage?.[0]) newFilters.stage = tableFilters.stage[0];
    setFilters(newFilters);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this competition?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. Any published results regarding this competition will be deleted and awarded points will be automatically reverted from students and groups.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`/competitions/${id}`);
          message.success('Competition deleted successfully');
          fetchCompetitions();
        } catch (error) {
          message.error('Failed to delete competition');
        }
      },
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    confirm({
      title: `Change status to ${newStatus}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await apiClient.patch(`/competitions/${id}/status`, { status: newStatus });
          message.success('Status updated');
          fetchCompetitions();
        } catch (error) {
          message.error('Failed to update status');
        }
      }
    });
  };

  const openDrawer = (record?: any) => {
    setDrawerVisible(true);
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue({
        name: record.name,
        type: record.type,
        date: record.date,
        time: record.time,
        stage: record.stage,
        category: record.category,
        groupEntries: record.groupEntries || [],
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ type: 'individual', categories: ['subJunior', 'junior', 'senior'] }); // default
    }
  };

  const onFormFinish = async (values: any) => {
    // Validate with Zod
    const result = formSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach(err => message.error(err.message));
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/competitions/${editingId}`, values);
        message.success('Competition updated');
      } else {
        await apiClient.post('/competitions', values);
        message.success('Competition created');
      }
      setDrawerVisible(false);
      fetchCompetitions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Action failed');
    }
  };

  const formatTime12h = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutesStr || '00'} ${ampm}`;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      render: (text: string) => <span className="font-semibold">{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: [
        { text: 'Group', value: 'group' },
        { text: 'Individual', value: 'individual' },
      ],
      filterMultiple: false,
      render: (type: string) => (
        <Tag color={type === 'group' ? 'geekblue' : 'purple'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      filters: [
        { text: 'Sub Junior', value: 'subJunior' },
        { text: 'Junior', value: 'junior' },
        { text: 'Senior', value: 'senior' },
        { text: 'Group', value: 'group' },
      ],
      filterMultiple: false,
      render: (cat: string, record: any) => {
        if (record.type === 'group') {
          return <Tag color="geekblue">GROUP</Tag>;
        }
        return cat ? <Tag color="cyan">{cat.toUpperCase()}</Tag> : <Tag>N/A</Tag>;
      }
    },
    {
      title: 'Entries',
      render: (_: any, record: any) => {
        const count = record.entriesCount ?? (record.type === 'group' ? (record.groupEntries?.length || 0) : 0);
        return (
          <Tag 
            color={count > 0 ? "blue" : "default"} 
            className="cursor-pointer font-bold"
            onClick={() => openDetailModal(record)}
          >
            {count} {count === 1 ? 'Entry' : 'Entries'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: [
        { text: 'Upcoming', value: 'upcoming' },
        { text: 'Started', value: 'started' },
        { text: 'Ended', value: 'ended' },
      ],
      filterMultiple: false,
      render: (status: string, record: any) => {
        const colors: Record<string, string> = { upcoming: 'default', started: 'processing', ended: 'success' };
        return (
          <Dropdown menu={{
            items: ['upcoming', 'started', 'ended'].map(s => ({
              key: s,
              label: `Mark as ${s}`,
              disabled: status === s,
              onClick: () => handleStatusChange(record._id, s)
            }))
          }}>
            <Tag color={colors[status]} className="cursor-pointer">
              {status.toUpperCase()}
            </Tag>
          </Dropdown>
        );
      }
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      filters: [
        { text: 'Stage 1', value: 'stage1' },
        { text: 'Stage 2', value: 'stage2' },
        { text: 'Off Stage', value: 'offStage' },
      ],
      filterMultiple: false,
      render: (stage: string) => stage ? <Tag>{stage}</Tag> : <Tag color="warning">Unassigned</Tag>
    },
    {
      title: 'Date & Time',
      render: (_: any, record: any) => {
        const t12 = formatTime12h(record.time);
        return [record.date, t12].filter(Boolean).join(' ') || 'N/A';
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => openDetailModal(record)} type="text" title="View Competition Details" />
          <Button icon={<EditOutlined />} onClick={() => openDrawer(record)} type="text" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} type="text" danger />
        </Space>
      ),
    },
  ];

  const openDetailModal = async (record: any) => {
    setSelectedComp(record);
    setDetailModalVisible(true);
    setParticipantsLoading(true);
    setParticipantsData([]);
    try {
      const res = await apiClient.get(`/results/participants/${record._id}`);
      setParticipantsData(res.data.data || []);
    } catch (e) {
      console.error(e);
      setParticipantsData([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!m-0 font-display">Competitions</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openDrawer()}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Add Competition
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <Input
          placeholder="Search competitions..."
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
        title={editingId ? 'Edit Competition' : 'Create Competition'}
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
            label="Competition Name"
            rules={[{ required: true, message: 'Please enter competition name' }]}
          >
            <Input placeholder="e.g. Essay Writing" />
          </Form.Item>

          <Row gutter={16} style={{ display: 'flex' }}>
             <Col span={12} style={{ flex: 1, paddingRight: '8px' }}>
                <Form.Item name="date" label="Date (Optional)">
                  <Input type="date" />
                </Form.Item>
             </Col>
             <Col span={12} style={{ flex: 1, paddingLeft: '8px' }}>
                <Form.Item name="time" label="Time (Optional)">
                  <Input type="time" />
                </Form.Item>
             </Col>
          </Row>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true }]}
          >
            <Radio.Group buttonStyle="solid" className="w-full flex">
              <Radio.Button value="individual" className="flex-1 text-center">Individual</Radio.Button>
              <Radio.Button value="group" className="flex-1 text-center">Group</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {compType === 'individual' && !editingId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
              <div className="font-semibold mb-3">Categories (Creates a separate program for each)</div>
              <Form.Item name="categories">
                <Checkbox.Group>
                  <Space direction="vertical">
                    <Checkbox value="subJunior">Sub-Junior</Checkbox>
                    <Checkbox value="junior">Junior</Checkbox>
                    <Checkbox value="senior">Senior</Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </div>
          )}

          {compType === 'individual' && editingId && (
            <Form.Item name="category" label="Category">
              <Select disabled>
                <Select.Option value="subJunior">Sub-Junior</Select.Option>
                <Select.Option value="junior">Junior</Select.Option>
                <Select.Option value="senior">Senior</Select.Option>
              </Select>
            </Form.Item>
          )}

          {editingId && (
            <Form.Item name="stage" label="Stage Assignment (Optional)">
              <Select allowClear placeholder="Assign to a stage">
                <Select.Option value="stage1">Stage 1</Select.Option>
                <Select.Option value="stage2">Stage 2</Select.Option>
                <Select.Option value="offStage">Off Stage</Select.Option>
              </Select>
            </Form.Item>
          )}

          {compType === 'group' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
              <div className="font-semibold mb-3">Group Entries & Chest Codes (Optional)</div>
              <Form.List name="groupEntries">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16} style={{ display: 'flex', marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'group']}
                            rules={[{ required: true, message: 'Missing group' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select placeholder="Select Group">
                              {groups.map(g => (
                                <Select.Option key={g._id} value={g._id}>{g.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'chestCodes']}
                            style={{ marginBottom: 0 }}
                          >
                            <Select mode="tags" placeholder="Enter chest codes (e.g. Q1)" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Group Entry
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-end">
            <Space>
              <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: 'var(--color-primary)' }}>
                {editingId ? 'Save Changes' : 'Create'}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>

      {/* Competition Detail Modal */}
      <Modal
        title={selectedComp ? `Competition Details: ${selectedComp.name}` : 'Competition Details'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={650}
      >
        {selectedComp && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Type</Text>
                <Tag color={selectedComp.type === 'group' ? 'geekblue' : 'purple'} className="mt-1">
                  {selectedComp.type?.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Category</Text>
                <Tag color={selectedComp.type === 'group' ? 'geekblue' : 'cyan'} className="mt-1">
                  {selectedComp.type === 'group' ? 'GROUP' : selectedComp.category ? selectedComp.category.toUpperCase() : 'N/A'}
                </Tag>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Stage</Text>
                <Tag className="mt-1">{selectedComp.stage || 'Unassigned'}</Tag>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Status</Text>
                <Tag color={selectedComp.status === 'ended' ? 'success' : selectedComp.status === 'started' ? 'processing' : 'default'} className="mt-1">
                  {selectedComp.status?.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Date & Time</Text>
                <Text className="font-semibold text-sm font-mono">
                  {[selectedComp.date, formatTime12h(selectedComp.time)].filter(Boolean).join(' ') || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase font-bold block">Total Entries</Text>
                <Text className="font-bold text-sm">
                  {selectedComp.type === 'group'
                    ? `${selectedComp.entriesCount ?? (selectedComp.groupEntries?.length || 0)} Registered Groups`
                    : `${selectedComp.entriesCount ?? participantsData.length} Registered Students`}
                </Text>
              </div>
            </div>

            {selectedComp.type === 'group' ? (
              <div>
                <Title level={5} className="!mt-4 !mb-2">Registered Group & Chest Code Entries</Title>
                {selectedComp.groupEntries && selectedComp.groupEntries.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedComp.groupEntries.map((entry: any, i: number) => {
                      const groupId = typeof entry.group === 'object' ? entry.group._id : entry.group;
                      const groupObj = groups.find(g => g._id === groupId);
                      const groupName = groupObj ? groupObj.name : (typeof entry.group === 'object' ? entry.group.name : 'Unknown Group');
                      return (
                        <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{groupName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Chest Codes: {entry.chestCodes?.length ? entry.chestCodes.join(', ') : 'None'}
                            </div>
                          </div>
                          <Tag color="blue">{entry.chestCodes?.length || 0} Codes</Tag>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 bg-gray-50 rounded-lg">
                    No group entries registered for this competition.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Title level={5} className="!mt-4 !mb-2">Registered Student Participants</Title>
                {participantsLoading ? (
                  <div className="py-6 text-center">
                    <Spin size="small" />
                  </div>
                ) : participantsData && participantsData.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {participantsData.map((student: any, i: number) => (
                      <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={student.profileImage} icon={<UserOutlined />}>
                            {student.name?.[0]}
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-800">{student.name}</div>
                            <div className="text-xs text-gray-500">
                              Class: {student.class} | Category: {student.category}
                            </div>
                          </div>
                        </div>
                        {student.group && (
                          <Tag color="geekblue">{typeof student.group === 'object' ? student.group.name : 'Group'}</Tag>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400 bg-gray-50 rounded-lg">
                    No students registered for this competition yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Competitions;
