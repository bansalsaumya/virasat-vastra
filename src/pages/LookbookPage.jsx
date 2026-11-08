import React, { useState, useMemo } from 'react';
import { ZoomIn, MessageCircle, Eye } from 'lucide-react';
import { LOOKBOOK_GALLERY, CATALOGUE_PRODUCTS } from '../data';
import { TiltCard } from '../motion';

const LOOKBOOK_TABS = [
  'All Editorial Looks',
  'Models Wearing Sarees',
  'Traditional Indian Fashion',
  'Bridal & Festive Looks',
  'Saree Draping Details',
  'Close-Up Embroidery & Zari'
];

export default function LookbookPage({
  onOpenLightbox,
  onSelectProduct,
  onEnquireWhatsApp
}) {
  const [activeTab, setActiveTab] = useState('All Editorial Looks');

  const filteredItems = useMemo(() => {
    if (activeTab === 'All Editorial Looks') return LOOKBOOK_GALLERY;
    return LOOKBOOK_GALLERY.filter((item) => item.category === activeTab);
  }, [activeTab]);

  const findProductByCode = (code) =>
    CATALOGUE_PRODUCTS.find((p) => p.code === code) || {
      name: 'Virasat Vastra Editorial Saree',
      code: code || 'VV-LB-01',
      category: 'Lookbook Editorial',
      fabric: 'Pure Handloom Silk'
    };

  return (
    <div className="vv-subpage-wrapper">
      <section className="vv-subpage-hero">
        <div className="vv-subpage-hero-inner">
          <span className="vv-eyebrow-gold">VIRASAT VASTRA • EDITORIAL ARCHIVE</span>
          <h1 className="vv-subpage-title">The Royal Lookbook &amp; Style Gallery</h1>
          <p className="vv-subpage-lead">
            An intimate study of Indian saree draping, bridal silhouettes, traditional craftsmanship, and macro zari embroidery. Click any frame for full-screen inspection.
          </p>
        </div>
      </section>

      <section className="vv-lookbook-gallery-sec">
        <div className="vv-lookbook-tabs">
          {LOOKBOOK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`vv-lb-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="vv-lookbook-grid">
          {filteredItems.map((item, idx) => {
            const linkedProduct = findProductByCode(item.productCode);
            return (
              <TiltCard
                key={item.id}
                max={6}
                className={`vv-lookbook-card span-${item.span || 'normal'}`}
              >
                <div
                  className="vv-lookbook-media"
                  onClick={() => onOpenLightbox(filteredItems, idx)}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="card-gold-sheen" />
                  <span className="vv-lb-category-pill">{item.category}</span>

                  <div className="vv-lb-overlay">
                    <div className="vv-lb-overlay-text">
                      <h3>{item.title}</h3>
                      <p>{item.subtitle}</p>
                    </div>
                    <div className="vv-lb-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="vv-lb-btn"
                        onClick={() => onOpenLightbox(filteredItems, idx)}
                      >
                        <ZoomIn size={14} /> Fullscreen
                      </button>
                      <button
                        type="button"
                        className="vv-lb-btn"
                        onClick={() => onSelectProduct(linkedProduct)}
                      >
                        <Eye size={14} /> Saree ({item.productCode})
                      </button>
                      <button
                        type="button"
                        className="vv-lb-btn gold"
                        onClick={() => onEnquireWhatsApp(linkedProduct)}
                      >
                        <MessageCircle size={14} /> Enquire
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

