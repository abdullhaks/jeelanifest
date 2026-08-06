import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import { LatticeBackground, GlassCard, SectionHeading } from '../../components/publiccomponents/DesignSystem';
import { MasonryGallery } from '../../components/publiccomponents/MasonryGallery';

const FestGallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/public/gallery?limit=50');
      setImages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 relative bg-[#F8F9FA] text-slate-900">
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <SectionHeading
            title="Fest Gallery"
            titleAr="معرض المهرجان"
            subtitle="Step into the visual journey of art, passion, and camaraderie. A curated glimpse of memorable highlights."
            centered={true}
          />
        </motion.div>

        {/* Content Masonry Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <MasonryGallery items={images} />

            {images.length === 0 && (
              <GlassCard className="text-center py-24 bg-white border border-slate-200" hover={false}>
                <p className="text-slate-400 font-medium">No gallery photos uploaded yet.</p>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FestGallery;
