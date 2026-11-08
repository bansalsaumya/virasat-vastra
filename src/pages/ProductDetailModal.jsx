import React, { useState, useEffect } from 'react';
import {
  X, MessageCircle, Heart, ZoomIn, Sparkles, ShieldCheck, Layers, Palette, Tag
} from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';
import { CATALOGUE_PRODUCTS } from '../data';

export default function ProductDetailModal({
  product,
  onClose,
  onEnquireWhatsApp,
  onOpenLightbox,
  onSelectRelated,
  wishlist = [],
  onToggleWishlist
}) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setActiveImgIdx(0);
    setHoverZoom(false);
  }, [product]);

  if (!product) return null;

  const prodName = product.name || product.title;
  const prodCode = product.code || product.sku || `VV-${String(product.id || '100').toUpperCase()}`;
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || product.modelImage, '/assets/paisley_brocade.jpg'].filter(Boolean);

  const relatedSarees = CATALOGUE_PRODUCTS.filter(
    (item) => item.code !== prodCode && (item.category === product.category || item.color === product.color)
  ).slice(0, 3);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x, y });
  };

  // Structured data for active saree
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prodName,
    sku: prodCode,
    brand: { '@type': 'Brand', name: BRAND_CONFIG.brandName },
    category: product.category || 'Indian Sarees',
    material: product.fabric || 'Silk',
    color: product.color || 'Multicolour',
    description:
      product.description ||
      `${prodName} — premium Indian saree by Virasat Vastra (${BRAND_CONFIG.tagline}).`,
    image: gallery
  };

  return (
    <div className="vv-modal-backdrop vv-pdp-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={prodName}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="vv-pdp-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="vv-pdp-topbar">
          <div className="vv-pdp-breadcrumb">
            <span>VIRASAT VASTRA</span>
            <span>/</span>
            <span>{product.category || 'Signature Collection'}</span>
            <span>/</span>
            <strong>{prodCode}</strong>
          </div>
          <button type="button" className="vv-icon-close" onClick={onClose} aria-label="Close saree details">
            <X size={20} />
          </button>
        </div>

        <div className="vv-pdp-main-grid">
          {/* Left Column: Multi-Image Gallery + Magnifier Zoom */}
          <div className="vv-pdp-gallery-col">
            <div className="vv-pdp-thumbs-rail">
              {gallery.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`vv-pdp-thumb ${activeImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImgIdx(idx)}
                >
                  <img src={imgSrc} alt={`${prodName} view ${idx + 1}`} />
                </button>
              ))}
            </div>

            <div
              className="vv-pdp-main-photo"
              onMouseEnter={() => setHoverZoom(true)}
              onMouseLeave={() => setHoverZoom(false)}
              onMouseMove={handleMouseMove}
              onClick={() =>
                onOpenLightbox(
                  gallery.map((src, i) => ({
                    image: src,
                    title: `${prodName} (${prodCode}) — View ${i + 1}`,
                    category: product.category || 'Saree Detail',
                    subtitle: product.work || product.fabric
                  })),
                  activeImgIdx
                )
              }
            >
              <img
                src={gallery[activeImgIdx]}
                alt={prodName}
                style={
                  hoverZoom
                    ? {
                        transform: 'scale(1.85)',
                        transformOrigin: `${lensPos.x}% ${lensPos.y}%`
                      }
                    : undefined
                }
              />
              <button
                type="button"
                className="vv-pdp-fullscreen-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(
                    gallery.map((src, i) => ({
                      image: src,
                      title: `${prodName} (${prodCode}) — View ${i + 1}`,
                      category: product.category || 'Saree Detail',
                      subtitle: product.work || product.fabric
                    })),
                    activeImgIdx
                  );
                }}
              >
                <ZoomIn size={14} /> Fullscreen Weave Zoom
              </button>
            </div>
          </div>

          {/* Right Column: Saree Specifications & Direct WhatsApp Enquiry */}
          <div className="vv-pdp-info-col">
            <div className="vv-pdp-badges-row">
              <span className="vv-sku-pill">SKU: {prodCode}</span>
              {product.isSample !== false && (
                <span className="vv-sample-pill">Sample Showcase Entry</span>
              )}
            </div>

            <h2 className="vv-pdp-title">{prodName}</h2>
            <p className="vv-pdp-subtitle">{product.sareeType || product.category || 'Traditional & Designer Indian Saree'}</p>

            {BRAND_CONFIG.showPrices && product.price ? (
              <div className="vv-pdp-price-block">
                <span className="vv-pdp-price">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="vv-pdp-price-note">Indicative sample showcase price • Enquire on WhatsApp for availability</span>
              </div>
            ) : (
              <div className="vv-pdp-price-block">
                <span className="vv-pdp-price-poa">Price on Request</span>
              </div>
            )}

            <p className="vv-pdp-desc">
              {product.description ||
                'Crafted with timeless Indian textile artistry, rich borders, and graceful drape for weddings, festivities, and heirloom wardrobes.'}
            </p>

            <div className="vv-pdp-specs-grid">
              <div className="vv-spec-cell">
                <span className="vv-spec-label"><Layers size={13} /> Fabric Details</span>
                <strong>{product.fabric || 'Pure Handloom Silk'}</strong>
              </div>
              <div className="vv-spec-cell">
                <span className="vv-spec-label"><Sparkles size={13} /> Saree Type</span>
                <strong>{product.sareeType || product.category || 'Heritage Silk Saree'}</strong>
              </div>
              <div className="vv-spec-cell">
                <span className="vv-spec-label"><Palette size={13} /> Colour</span>
                <strong>{product.color || 'Signature Royal Shade'}</strong>
              </div>
              <div className="vv-spec-cell">
                <span className="vv-spec-label"><Tag size={13} /> Work &amp; Embroidery</span>
                <strong>{product.work || 'Woven Zari Border & Ceremonial Pallu'}</strong>
              </div>
            </div>

            <div className="vv-pdp-cta-row">
              <button
                type="button"
                className="vv-btn-whatsapp-primary large"
                onClick={() => onEnquireWhatsApp({ ...product, code: prodCode, name: prodName })}
              >
                <MessageCircle size={19} />
                <span>Enquire on WhatsApp</span>
              </button>

              {onToggleWishlist && (
                <button
                  type="button"
                  className="vv-btn-shortlist"
                  onClick={() => onToggleWishlist(prodName)}
                  title="Save to Shortlist"
                >
                  <Heart
                    size={18}
                    fill={wishlist.includes(prodName) ? '#790f1d' : 'none'}
                    color="#790f1d"
                  />
                  <span>{wishlist.includes(prodName) ? 'Shortlisted' : 'Shortlist'}</span>
                </button>
              )}
            </div>

            <div className="vv-pdp-assurance-strip">
              <span><ShieldCheck size={14} /> Direct Boutique Assistance</span>
              <span>•</span>
              <span>Includes Saree Code ({prodCode}) Automatically</span>
            </div>

            {relatedSarees.length > 0 && (
              <div className="vv-pdp-related">
                <h5>More From Virasat Vastra</h5>
                <div className="vv-pdp-related-row">
                  {relatedSarees.map((rel) => (
                    <div
                      key={rel.id}
                      className="vv-pdp-related-card"
                      onClick={() => onSelectRelated(rel)}
                    >
                      <img src={rel.image} alt={rel.name} loading="lazy" />
                      <div>
                        <span>{rel.code}</span>
                        <strong>{rel.name}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

