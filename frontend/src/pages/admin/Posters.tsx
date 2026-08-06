import { useState, useEffect } from 'react';
import { Form, Input, Select, Tag, Card } from 'antd';
import apiClient from '../../services/apiClient';
import MediaCrudGrid from '../../components/admincomponents/MediaCrudGrid';

const Posters = () => {
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/competitions?limit=1000').then(res => {
      setCompetitions(res.data.data);
    }).catch(() => {});
  }, []);

  return (
    <MediaCrudGrid
      title="Posters Gallery"
      subtitle="Manage creative assets for the public gallery"
      entityName="Poster"
      fetchUrl="/posters"
      uploadUrl="/posters/upload-image"
      mapItemToFormValues={(item) => ({
        title: item.title,
        description: item.description,
        competition: item.competition?._id,
      })}
      renderFormFields={() => (
        <>
          <Form.Item name="title" label="Title (Optional)">
            <Input placeholder="e.g. Grand Finale Arabic Speech" />
          </Form.Item>

          <Form.Item name="competition" label="Associated Competition (Optional)">
            <Select allowClear showSearch placeholder="Link to a specific program" optionFilterProp="children">
              {competitions.map(c => (
                <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea rows={3} placeholder="Add a short caption or context" />
          </Form.Item>
        </>
      )}
      renderCardMeta={(item) => (
        <Card.Meta
          title={item.title || 'Untitled Poster'}
          description={
            <div>
              {item.competition && <Tag color="blue" className="mb-2 truncate max-w-full">{item.competition.name}</Tag>}
              <div className="text-xs text-gray-500 line-clamp-2">{item.description || 'No description provided'}</div>
            </div>
          }
        />
      )}
    />
  );
};

export default Posters;
