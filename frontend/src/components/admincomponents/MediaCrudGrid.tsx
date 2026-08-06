import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Card, List, Drawer, Form, 
  Upload, message, Modal, Space, Image, Tooltip, Input
} from 'antd';
import { 
  PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, PictureOutlined 
} from '@ant-design/icons';
import apiClient from '../../services/apiClient';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Dragger } = Upload;

interface MediaCrudGridProps {
  title: string;
  subtitle: string;
  entityName: string;
  fetchUrl: string;
  uploadUrl: string;
  renderFormFields: () => React.ReactNode;
  renderCardMeta: (item: any) => React.ReactNode;
  mapItemToFormValues?: (item: any) => any;
}

const MediaCrudGrid: React.FC<MediaCrudGridProps> = ({
  title, subtitle, entityName, fetchUrl, uploadUrl,
  renderFormFields, renderCardMeta, mapItemToFormValues
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(currentPage);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, currentPage, fetchUrl]);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const res = await apiClient.get(`${fetchUrl}?${params}`);
      setItems(res.data.data);
      setTotal(res.data.meta.total);
      setCurrentPage(page);
    } catch (error) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (item?: any) => {
    setSelectedImageFile(null);
    if (item) {
      setEditingId(item._id);
      setImageUrl(item.image);
      const values = mapItemToFormValues ? mapItemToFormValues(item) : item;
      form.setFieldsValue({ ...values, image: item.image });
    } else {
      setEditingId(null);
      setImageUrl(null);
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
    setImageUrl(null);
    setSelectedImageFile(null);
  };

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('file', selectedImageFile);
        try {
          const res = await apiClient.post(uploadUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          finalImageUrl = res.data.url;
        } catch (err) {
          message.error('Image upload failed');
          setIsSubmitting(false);
          return;
        }
      }

      if (!finalImageUrl) {
        message.error(`Please upload an image for the ${entityName.toLowerCase()}`);
        setIsSubmitting(false);
        return;
      }
      
      const payload = { ...values, image: finalImageUrl };

      if (editingId) {
        await apiClient.put(`${fetchUrl}/${editingId}`, payload);
        message.success(`${entityName} updated successfully`);
      } else {
        await apiClient.post(fetchUrl, payload);
        message.success(`${entityName} added successfully`);
      }
      closeDrawer();
      fetchItems(currentPage);
    } catch (error) {
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: `Delete this ${entityName.toLowerCase()}?`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove this ${entityName.toLowerCase()}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await apiClient.delete(`${fetchUrl}/${id}`);
          message.success(`${entityName} deleted`);
          fetchItems(currentPage);
        } catch (error) {
          // Handled globally
        }
      },
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File) => {
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      form.setFieldValue('image', previewUrl);
      return false; // Prevent auto upload
    },
    showUploadList: false,
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} className="!m-0 font-display">{title}</Title>
          <Text type="secondary">{subtitle}</Text>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Input.Search
            placeholder={`Search ${entityName.toLowerCase()}s...`}
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()} style={{ backgroundColor: 'var(--color-primary)' }}>
            Add {entityName}
          </Button>
        </div>
      </div>

      <List
        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
        dataSource={items}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: 12,
          total,
          onChange: fetchItems,
        }}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={<Image src={item.image} alt="Media" className="object-cover h-64 w-full" />}
              actions={[
                <Tooltip title="Edit" key="edit"><EditOutlined onClick={() => openDrawer(item)} /></Tooltip>,
                <Tooltip title="Delete" key="delete"><DeleteOutlined className="text-red-500" onClick={() => handleDelete(item._id)} /></Tooltip>
              ]}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              bodyStyle={{ padding: '16px' }}
            >
              {renderCardMeta(item)}
            </Card>
          </List.Item>
        )}
      />

      <Drawer
        title={editingId ? `Edit ${entityName}` : `Add New ${entityName}`}
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={closeDrawer} disabled={isSubmitting}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()} loading={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
              {editingId ? 'Save Changes' : `Upload ${entityName}`}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="image" rules={[{ required: true, message: 'Image is required' }]}>
            <Dragger {...uploadProps} className="!bg-gray-50 border-dashed border-2 border-gray-300">
              {imageUrl ? (
                <div className="p-2">
                  <img src={imageUrl} alt="preview" className="w-full h-48 object-cover rounded" />
                  <div className="mt-2 text-blue-500 text-sm">Click or drag to replace image</div>
                </div>
              ) : (
                <div className="py-8">
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined className="text-gray-400" />
                  </p>
                  <p className="ant-upload-text">Click or drag {entityName.toLowerCase()} image here</p>
                  <p className="ant-upload-hint px-4 text-xs text-gray-500">
                    High quality JPG/PNG up to 10MB
                  </p>
                </div>
              )}
            </Dragger>
          </Form.Item>

          {renderFormFields()}

        </Form>
      </Drawer>
    </div>
  );
};

export default MediaCrudGrid;
