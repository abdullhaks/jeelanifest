import { Form, Input, Card } from 'antd';
import MediaCrudGrid from '../../components/admincomponents/MediaCrudGrid';

const Gallery = () => {
  return (
    <MediaCrudGrid
      title="Fest Gallery"
      subtitle="Manage general fest photography and memories"
      entityName="Image"
      fetchUrl="/gallery"
      uploadUrl="/gallery/upload-image"
      renderFormFields={() => (
        <Form.Item name="description" label="Description (Optional)">
          <Input.TextArea rows={3} placeholder="Add a short caption or context for this photo" />
        </Form.Item>
      )}
      renderCardMeta={(item) => (
        <Card.Meta
          description={
            <div className="text-sm text-gray-700 line-clamp-3">
              {item.description || 'No description provided'}
            </div>
          }
        />
      )}
    />
  );
};

export default Gallery;
