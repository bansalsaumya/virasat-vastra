import React, { useState } from 'react';
import {
  X, MessageCircle, Copy, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppEnquiryData } from '../brandConfig';

const ENQUIRY_TOPICS = [
  'Availability',
  'Color Options',
  'Fabric & Zari Details',
  'Pricing',
  'Video Call Drape Preview'
];

export function WhatsAppEnquiryModal({ isOpen, onClose, product, defaultSize = '' }) {
  const [selectedTopics, setSelectedTopics] = useState([
    'Availability',
    'Color Options',
    'Fabric & Zari Details',
    'Pricing'
  ]);
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.length > 1
          ? prev.filter((t) => t !== topic)
          : prev
        : [...prev, topic]
    );
  };

  const enquiry = buildWhatsAppEnquiryData(product, {
    selectedSize: defaultSize,
    topics: selectedTopics,
    customNote
  });

  const handleCopy = () => {
    navigator.clipboard?.writeText(enquiry.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const prodName = product ? product.name || product.title : null;
  const prodCode = product ? product.code || product.sku || `VV-${String(product.id || '01').toUpperCase()}` : null;
  const prodImg = product ? product.image || product.modelImage || (product.images && product.images[0]) : null;

  return (
    <div className="vv-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="WhatsApp Saree Enquiry">
      <div className="vv-wa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="vv-wa-modal-header">
          <div>
            <span className="vv-eyebrow-gold">VIRASAT VASTRA • WHATSAPP CONCIERGE</span>
            <h3>{product ? 'Enquire About This Saree' : 'Direct Boutique Enquiry'}</h3>
          </div>
          <button type="button" className="vv-icon-close" onClick={onClose} aria-label="Close enquiry dialog">
            <X size={20} />
          </button>
        </div>

        <div className="vv-wa-modal-body">
          {product && (
            <div className="vv-wa-product-summary">
              {prodImg && <img src={prodImg} alt={prodName} />}
              <div>
                <span className="vv-sku-pill">CODE: {prodCode}</span>
                <h4>{prodName}</h4>
                <p>{product.fabric || 'Handloom Silk'} {product.color ? `• ${product.color}` : ''}</p>
              </div>
            </div>
          )}

          <div className="vv-wa-field-group">
            <label>WHAT WOULD YOU LIKE TO ENQUIRE ABOUT?</label>
            <div className="vv-wa-topic-chips">
              {ENQUIRY_TOPICS.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    className={`vv-topic-chip ${active ? 'active' : ''}`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {active && <Check size={12} />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vv-wa-field-group">
            <label>OPTIONAL MESSAGE (OCCASION / PREFERRED SHADE / CITY)</label>
            <input
              type="text"
              className="vv-wa-input"
              placeholder="e.g., Looking for a bridal Banarasi in crimson or emerald..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <div className="vv-wa-preview-box">
            <div className="vv-wa-preview-head">
              <span>AUTO-INCLUDED WHATSAPP MESSAGE</span>
              <button type="button" onClick={handleCopy} className="vv-copy-btn">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Text</>}
              </button>
            </div>
            <pre>{enquiry.messageText}</pre>
          </div>

          {enquiry.isPlaceholderNumber && (
            <p className="vv-config-hint">
              Note: Business WhatsApp number is set to placeholder (<code>src/brandConfig.js</code>). Clicking below opens WhatsApp with your pre-filled saree details ready to send.
            </p>
          )}

          <div className="vv-wa-actions-row">
            <a
              href={enquiry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="vv-btn-whatsapp-primary"
            >
              <MessageCircle size={18} />
              <span>Continue to WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LightboxViewer({ items = [], activeIndex = -1, onClose, onNavigate, onEnquire }) {
  const [zoomed, setZoomed] = useState(false);
  const [panPos, setPanPos] = useState({ x: 50, y: 50 });

  if (activeIndex < 0 || !items.length) return null;
  const current = items[activeIndex] || items[0];

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPanPos({ x, y });
  };

  return (
    <div className="vv-lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Full screen saree detail viewer">
      <div className="vv-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="vv-lightbox-meta">
          <span className="vv-eyebrow-gold">{current.category || 'VIRASAT VASTRA ARCHIVE'}</span>
          <strong>{current.title || current.name}</strong>
        </div>
        <div className="vv-lightbox-controls">
          <button
            type="button"
            className="vv-lightbox-btn"
            onClick={() => setZoomed((z) => !z)}
          >
            {zoomed ? <><ZoomOut size={16} /> Reset Zoom</> : <><ZoomIn size={16} /> Inspect Weave (2.2x)</>}
          </button>
          {onEnquire && (
            <button
              type="button"
              className="vv-lightbox-btn gold"
              onClick={() => onEnquire(current)}
            >
              <MessageCircle size={15} /> Enquire on WhatsApp
            </button>
          )}
          <button type="button" className="vv-icon-close light" onClick={onClose} aria-label="Close full screen view">
            <X size={22} />
          </button>
        </div>
      </div>

      <div
        className={`vv-lightbox-stage ${zoomed ? 'is-zoomed' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setZoomed((z) => !z);
        }}
        onMouseMove={handleMouseMove}
      >
        {items.length > 1 && (
          <button
            type="button"
            className="vv-lightbox-arrow left"
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(false);
              onNavigate((activeIndex - 1 + items.length) % items.length);
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={current.image || current.src}
          alt={current.title || current.name || 'Virasat Vastra Saree Detail'}
          style={
            zoomed
              ? {
                  transform: 'scale(2.15)',
                  transformOrigin: `${panPos.x}% ${panPos.y}%`
                }
              : undefined
          }
        />

        {items.length > 1 && (
          <button
            type="button"
            className="vv-lightbox-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(false);
              onNavigate((activeIndex + 1) % items.length);
            }}
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {current.subtitle && (
        <div className="vv-lightbox-caption" onClick={(e) => e.stopPropagation()}>
          <p>{current.subtitle}</p>
          <span>{activeIndex + 1} / {items.length} • Click image to toggle close-up weave zoom</span>
        </div>
      )}
    </div>
  );
}

export function PolicyModal({ policyType, onClose }) {
  if (!policyType) return null;

  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    shipping: 'Dispatch, Care & Exchange Policy'
  };

  return (
    <div className="vv-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="vv-wa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="vv-wa-modal-header">
          <div>
            <span className="vv-eyebrow-gold">{BRAND_CONFIG.brandName} • CLIENT INFORMATION</span>
            <h3>{titles[policyType] || 'Boutique Policy'}</h3>
          </div>
          <button type="button" className="vv-icon-close" onClick={onClose} aria-label="Close policy modal">
            <X size={20} />
          </button>
        </div>
        <div className="vv-wa-modal-body vv-policy-copy">
          {policyType === 'privacy' && (
            <>
              <p>
                <strong>Virasat Vastra</strong> respects your privacy. This website operates as a luxury saree showcase and direct WhatsApp / boutique enquiry catalogue. We do not collect online payment details or card information on this website.
              </p>
              <p>
                Any name, contact number, or enquiry message you share through WhatsApp or our contact form is used solely to respond to your saree availability, fabric, styling, or appointment requests.
              </p>
              <p className="vv-config-hint">
                Placeholder Notice: Update official legal entity and contact email in <code>src/brandConfig.js</code> prior to public launch.
              </p>
            </>
          )}
          {policyType === 'terms' && (
            <>
              <p>
                All sarees featured on <strong>Virasat Vastra</strong> are presented for catalogue discovery and personalised boutique assistance. Handwoven and embroidered textiles exhibit subtle natural variations in weave and zari sheen that reflect authentic craftsmanship.
              </p>
              <p>
                Availability, custom blouse tailoring options, and final pricing are confirmed directly with our team via WhatsApp or boutique consultation before confirmation.
              </p>
            </>
          )}
          {policyType === 'shipping' && (
            <>
              <p>
                <strong>Silk Care:</strong> Dry clean only. Store folded in soft muslin away from direct moisture and perfume contact to preserve pure silk and zari lustre.
              </p>
              <p>
                <strong>Dispatch &amp; Exchange Details:</strong> Confirmed directly during your WhatsApp enquiry based on your delivery city and custom finishing preferences.
              </p>
              <p className="vv-config-hint">
                Placeholder Notice: Replace with your exact dispatch timelines and exchange policy in <code>src/pages/WhatsAppEnquiryModal.jsx</code> / <code>src/brandConfig.js</code>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

