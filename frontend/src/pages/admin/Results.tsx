import { useState, useEffect } from 'react';
import { 
  Typography, Select, Button, Space, Card, Modal, 
  message, Row, Col, Tag, InputNumber, Table, Input
} from 'antd';
import { TrophyOutlined, SaveOutlined, SendOutlined, ExclamationCircleOutlined, SearchOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { confirm } = Modal;

const Results = () => {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedCompName, setSelectedCompName] = useState<string>('');
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantType, setParticipantType] = useState<string>('Student');
  
  const [resultId, setResultId] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft'|'published' | null>(null);
  
  const [winners, setWinners] = useState<any[]>([]);

  // Final announcement state
  const [finalModalVisible, setFinalModalVisible] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [finalChamps, setFinalChamps] = useState<{first?: string, second?: string, third?: string}>({});

  useEffect(() => {
    // Load competitions
    apiClient.get('/competitions?limit=1000').then(res => {
      setCompetitions(res.data.data);
      setFilteredCompetitions(res.data.data);
    }).catch(() => message.error('Failed to load competitions'));

    // Load groups for final announcement
    apiClient.get('/groups?limit=100').then(res => {
      setGroups(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCompetitions(
        competitions.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      );
    } else {
      setFilteredCompetitions(competitions);
    }
  }, [search, competitions]);

  const loadCompetitionData = async (record: any) => {
    setSelectedCompId(record._id);
    setSelectedCompName(`${record.name} ${record.category ? `(${record.category.toUpperCase()})` : ''}`);
    try {
      // 1. Get valid participants
      const pRes = await apiClient.get(`/results/participants/${record._id}`);
      setParticipantType(pRes.data.type);
      setParticipants(pRes.data.data);

      // 2. Get existing result (draft or published)
      const rRes = await apiClient.get(`/results/competition/${record._id}`);
      if (rRes.data) {
        setResultId(rRes.data._id);
        setStatus(rRes.data.status);
        setWinners(rRes.data.winners.map((w: any) => ({
          rank: w.rank,
          participantType: w.participantType,
          participant: typeof w.participant === 'object' ? w.participant._id : w.participant,
          chestCode: w.chestCode,
          pointsAwarded: w.pointsAwarded
        })));
      } else {
        setResultId(null);
        setStatus(null);
        setWinners([]);
      }
    } catch (error) {
      message.error('Failed to load competition details');
    }
  };

  const handleAddWinner = (rank: '1st'|'2nd'|'3rd', compositeId: string) => {
    const [participantId, chestCode] = compositeId.split('::');
    
    if (winners.find(w => w.participant === participantId && w.rank === rank && (w.chestCode || '') === (chestCode || ''))) return; // already added

    // Provide default points based on rank
    const defaultPoints = rank === '1st' ? 10 : rank === '2nd' ? 5 : 3;
    
    setWinners(prev => [...prev, {
      rank,
      participantType: participantType,
      participant: participantId,
      chestCode: chestCode || undefined,
      pointsAwarded: defaultPoints
    }]);
  };

  const handleRemoveWinner = (participantId: string, rank: string, chestCode?: string) => {
    setWinners(prev => prev.filter(w => !(w.participant === participantId && w.rank === rank && (w.chestCode || '') === (chestCode || ''))));
  };

  const handleUpdatePoints = (participantId: string, rank: string, chestCode: string | undefined, points: number | null) => {
    setWinners(prev => prev.map(w => {
      if (w.participant === participantId && w.rank === rank && (w.chestCode || '') === (chestCode || '')) {
        return { ...w, pointsAwarded: points || 0 };
      }
      return w;
    }));
  };

  const saveDraft = async () => {
    if (!selectedCompId) return;
    try {
      await apiClient.post('/results', {
        competition: selectedCompId,
        winners
      });
      message.success('Draft saved');
      const compRecord = competitions.find(c => c._id === selectedCompId);
      if (compRecord) loadCompetitionData(compRecord);
    } catch (error) {
      message.error('Failed to save draft');
    }
  };

  const publishResult = () => {
    if (!resultId) {
      message.error('Please save as draft first before publishing');
      return;
    }
    confirm({
      title: 'Publish Results?',
      icon: <ExclamationCircleOutlined />,
      content: 'This will irreversibly award points to students and groups and announce it publicly.',
      okText: 'Yes, Publish Now',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.post(`/results/${resultId}/publish`);
          message.success('Results Published!');
          const compRecord = competitions.find(c => c._id === selectedCompId);
          if (compRecord) loadCompetitionData(compRecord);
        } catch (error) {
          message.error('Failed to publish results');
        }
      }
    });
  };

  const submitFinalAnnouncement = () => {
    if (!finalChamps.first || !finalChamps.second || !finalChamps.third) {
      message.error('Please select all three podium positions');
      return;
    }
    
    confirm({
      title: 'Announce Final Championship?',
      icon: <ExclamationCircleOutlined />,
      content: 'This triggers the massive full-screen celebration in the public UI. Are you sure?',
      okText: 'Yes, Announce!',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.post('/results/final-announcement', {
            firstPlaceGroup: finalChamps.first,
            secondPlaceGroup: finalChamps.second,
            thirdPlaceGroup: finalChamps.third
          });
          message.success('Final Announcement Live!');
          setFinalModalVisible(false);
        } catch (error) {
          message.error('Failed to announce');
        }
      }
    });
  };

  const renderRankColumn = (rank: '1st'|'2nd'|'3rd', color: string, title: string) => {
    const rankWinners = winners.filter(w => w.rank === rank);
    
    return (
      <Card title={title} bordered={false} style={{ background: color, minHeight: 300 }}>
        {status !== 'published' && (
          <Select 
            placeholder={`Add ${rank} Place`}
            style={{ width: '100%', marginBottom: 16 }}
            onChange={(val) => { if(val) handleAddWinner(rank, val); }}
            value={null}
            showSearch
            optionFilterProp="children"
          >
            {participants.map((p, idx) => (
              <Select.Option key={idx} value={`${p._id}::${p.chestCode || ''}`}>{p.name}</Select.Option>
            ))}
          </Select>
        )}

        <Space direction="vertical" style={{ width: '100%' }}>
          {rankWinners.map((w, idx) => {
            const pData = participants.find(p => p._id === w.participant && (p.chestCode || '') === (w.chestCode || ''));
            const pName = pData ? pData.name : 'Unknown';
            return (
              <Card key={idx} size="small" className="shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{pName}</span>
                  {status !== 'published' && (
                    <Button type="text" danger size="small" onClick={() => handleRemoveWinner(w.participant, rank, w.chestCode)}>
                      Remove
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="text-xs">Points:</Text>
                  <InputNumber 
                    min={0} 
                    value={w.pointsAwarded} 
                    onChange={(val) => handleUpdatePoints(w.participant, rank, w.chestCode, val)} 
                    disabled={status === 'published'}
                    size="small"
                  />
                </div>
              </Card>
            );
          })}
        </Space>
      </Card>
    );
  };

  const compColumns = [
    {
      title: 'Competition Name',
      dataIndex: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (cat: string) => cat ? <Tag color="blue">{cat.toUpperCase()}</Tag> : <Tag>GENERAL</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type: string) => <Tag color="purple">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => loadCompetitionData(record)}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Grade Results
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!m-0 font-display">Results Management</Title>
        <Button type="primary" danger icon={<TrophyOutlined />} onClick={() => setFinalModalVisible(true)}>
          Announce Final Result
        </Button>
      </div>

      {!selectedCompId ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="!m-0">Select Competition to Grade</Title>
            <Input
              placeholder="Search competitions..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
          <Table
            columns={compColumns}
            dataSource={filteredCompetitions}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      ) : (
        <div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => setSelectedCompId(null)}
            className="mb-4"
          >
            Back to Competitions
          </Button>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Title level={4} className="!m-0">Rank Assignment: {selectedCompName}</Title>
                {status === 'published' ? (
                  <Tag color="success" className="mt-2">PUBLISHED</Tag>
                ) : (
                  <Tag color="warning" className="mt-2">{status === 'draft' ? 'DRAFT SAVED' : 'UNSAVED'}</Tag>
                )}
              </div>
              
              {status !== 'published' && (
                <Space>
                  <Button icon={<SaveOutlined />} onClick={saveDraft}>Save Draft</Button>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={publishResult}
                    disabled={!resultId} // Must be a draft first to get an ID
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Publish Points
                  </Button>
                </Space>
              )}
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                {renderRankColumn('1st', '#fffbe6', '🥇 1st Place (⭐⭐⭐)')}
              </Col>
              <Col xs={24} md={8}>
                {renderRankColumn('2nd', '#f6ffed', '🥈 2nd Place (⭐⭐)')}
              </Col>
              <Col xs={24} md={8}>
                {renderRankColumn('3rd', '#fff1f0', '🥉 3rd Place (⭐)')}
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* Final Announcement Modal */}
      <Modal
        title={<span><TrophyOutlined className="text-yellow-500 mr-2" /> Announce Final Championship</span>}
        open={finalModalVisible}
        onCancel={() => setFinalModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setFinalModalVisible(false)}>Cancel</Button>,
          <Button key="submit" type="primary" danger onClick={submitFinalAnnouncement}>
            Launch Announcement
          </Button>
        ]}
      >
        <div className="py-4">
          <p className="mb-6 text-gray-500">Select the overall winning groups. This will trigger a massive realtime celebration across the public site.</p>
          
          <div className="space-y-4">
            <div>
              <Text strong className="block mb-1 text-yellow-600">🥇 Overall Champion</Text>
              <Select className="w-full" onChange={(v) => setFinalChamps({...finalChamps, first: v})}>
                {groups.map(g => <Select.Option key={g._id} value={g._id}>{g.name} ({g.totalPoints} pts)</Select.Option>)}
              </Select>
            </div>
            <div>
              <Text strong className="block mb-1 text-gray-400">🥈 First Runner-up</Text>
              <Select className="w-full" onChange={(v) => setFinalChamps({...finalChamps, second: v})}>
                {groups.map(g => <Select.Option key={g._id} value={g._id}>{g.name} ({g.totalPoints} pts)</Select.Option>)}
              </Select>
            </div>
            <div>
              <Text strong className="block mb-1 text-orange-400">🥉 Second Runner-up</Text>
              <Select className="w-full" onChange={(v) => setFinalChamps({...finalChamps, third: v})}>
                {groups.map(g => <Select.Option key={g._id} value={g._id}>{g.name} ({g.totalPoints} pts)</Select.Option>)}
              </Select>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Results;
