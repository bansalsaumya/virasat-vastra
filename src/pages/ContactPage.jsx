import React, { useState } from 'react';
import {
  MessageCircle, Phone, Mail, MapPin, Send, CheckCircle2, Sparkles
} from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppEnquiryData } from '../brandConfig';
import { COLLECTION_CATEGORIES } from '../data';

function InstagramIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ContactPage({ onEnquireWhatsApp }) {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    collection: 'Banarasi Sarees',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const forwardFormToWhatsApp = () => {
    const customNote = `Name: ${formState.name} | Phone: ${formState.phone} | Interested In: ${formState.collection} | Message: ${formState.message}`;
    const { url } = buildWhatsAppEnquiryData(null, { customNote });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="vv-subpage-wrapper">
      <section className="vv-subpage-hero">
        <div className="vv-subpage-hero-inner">
          <span className="vv-eyebrow-gold">{BRAND_CONFIG.brandName} • BOUTIQUE CONCIERGE</span>
          <h1 className="vv-subpage-title">Contact Us &amp; WhatsApp Enquiry</h1>
          <p className="vv-subpage-lead">
            Connect with Virasat Vastra for saree availability, fabric and colour consultations, bridal trousseau assistance, or showroom visits.
          </p>
        </div>
      </section>

      <section className="vv-contact-main-sec">
        <div className="vv-sample-notice-banner">
          <Sparkles size={15} />
          <span>
            <strong>Configurable Contact Placeholders:</strong> Update your official WhatsApp number, phone, email, boutique address, and Google Maps embed URL in <code>src/brandConfig.js</code>.
          </span>
        </div>

        <div className="vv-contact-two-col">
          {/* Left Column: Direct Contact Cards + Map Location */}
          <div className="vv-contact-cards-col">
            <div className="vv-contact-highlight-wa">
              <span className="vv-eyebrow-gold">DIRECT INSTANT RESPONSE</span>
              <h3>WhatsApp Saree Concierge</h3>
              <p>
                Enquire directly on WhatsApp about any saree code, colour options, fabric weave, or pricing.
              </p>
              <button
                type="button"
                className="vv-btn-whatsapp-primary large"
                onClick={() => onEnquireWhatsApp(null)}
              >
                <MessageCircle size={19} />
                <span>Start WhatsApp Enquiry</span>
              </button>
              <span className="vv-wa-number-tag">
                Configured Number: {BRAND_CONFIG.whatsappDisplayPlaceholder}
              </span>
            </div>

            <div className="vv-contact-info-grid">
              <div className="vv-contact-info-box">
                <Phone size={18} color="#790f1d" />
                <div>
                  <span>CONTACT NUMBER</span>
                  <strong>{BRAND_CONFIG.contactPhoneDisplay}</strong>
                </div>
              </div>

              <div className="vv-contact-info-box">
                <Mail size={18} color="#790f1d" />
                <div>
                  <span>EMAIL ADDRESS</span>
                  <strong>{BRAND_CONFIG.contactEmail}</strong>
                </div>
              </div>

              <div className="vv-contact-info-box">
                <MapPin size={18} color="#790f1d" />
                <div>
                  <span>BUSINESS ADDRESS</span>
                  <strong>{BRAND_CONFIG.businessAddress}</strong>
                </div>
              </div>

              <div className="vv-contact-info-box">
                <InstagramIcon size={18} color="#790f1d" />
                <div>
                  <span>INSTAGRAM PROFILE</span>
                  <a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">
                    {BRAND_CONFIG.instagramHandle} →
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Location */}
            <div className="vv-map-card">
              <div className="vv-map-card-head">
                <span><MapPin size={14} /> GOOGLE MAPS LOCATION</span>
                <span>{BRAND_CONFIG.brandName}</span>
              </div>
              {BRAND_CONFIG.googleMapsEmbedUrl ? (
                <iframe
                  title="Virasat Vastra Boutique Location"
                  src={BRAND_CONFIG.googleMapsEmbedUrl}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="vv-map-placeholder">
                  <MapPin size={28} color="#c29b38" />
                  <h4>Google Maps Location Placeholder</h4>
                  <p>
                    Paste your Google Maps Embed URL into <code>googleMapsEmbedUrl</code> inside <code>src/brandConfig.js</code> to display your interactive boutique map here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Simple Contact & Enquiry Form */}
          <div className="vv-contact-form-card">
            <span className="section-mini-tag">SEND US A MESSAGE</span>
            <h3>Boutique Enquiry Form</h3>
            <p className="vv-form-sub">
              Share your enquiry below and our team will assist you with saree details, draping previews, and availability.
            </p>

            {submitted ? (
              <div className="vv-form-success-box">
                <CheckCircle2 size={38} color="#176946" />
                <h4>Thank You for Reaching Out to Virasat Vastra</h4>
                <p>
                  Your enquiry for <strong>{formState.collection}</strong> has been prepared. You can also send it directly to our WhatsApp Concierge with one click below:
                </p>
                <div className="vv-form-success-actions">
                  <button
                    type="button"
                    className="vv-btn-whatsapp-primary"
                    onClick={forwardFormToWhatsApp}
                  >
                    <MessageCircle size={17} /> Send Enquiry via WhatsApp
                  </button>
                  <button
                    type="button"
                    className="vv-btn-reset-filters"
                    onClick={() => setSubmitted(false)}
                  >
                    Edit Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vv-enquiry-form">
                <div className="vv-form-field">
                  <label htmlFor="vv-name">Your Full Name *</label>
                  <input
                    id="vv-name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>

                <div className="vv-form-row-two">
                  <div className="vv-form-field">
                    <label htmlFor="vv-phone">Phone / WhatsApp Number *</label>
                    <input
                      id="vv-phone"
                      type="tel"
                      required
                      placeholder="Your phone number"
                      value={formState.phone}
                      onChange={(e) => setFormState((s) => ({ ...s, phone: e.target.value }))}
                    />
                  </div>
                  <div className="vv-form-field">
                    <label htmlFor="vv-email">Email Address (Optional)</label>
                    <input
                      id="vv-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="vv-form-field">
                  <label htmlFor="vv-collection">Collection of Interest</label>
                  <select
                    id="vv-collection"
                    value={formState.collection}
                    onChange={(e) => setFormState((s) => ({ ...s, collection: e.target.value }))}
                  >
                    {COLLECTION_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="General Saree Enquiry">General Saree Enquiry</option>
                  </select>
                </div>

                <div className="vv-form-field">
                  <label htmlFor="vv-msg">Your Enquiry (Saree Code, Colour, Fabric, or Occasion) *</label>
                  <textarea
                    id="vv-msg"
                    rows={4}
                    required
                    placeholder="Tell us which saree or collection you would like to enquire about..."
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                  />
                </div>

                <button type="submit" className="vv-btn-submit-form">
                  <Send size={16} />
                  <span>Prepare Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
