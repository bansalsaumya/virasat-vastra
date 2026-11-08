import React from 'react';
import {
  ArrowRight, ArrowUpRight, MessageCircle, ZoomIn, Sparkles, Quote
} from 'lucide-react';
import { COLLECTION_CATEGORIES, LOOKBOOK_GALLERY } from '../data';
import { BRAND_CONFIG } from '../brandConfig';
import { TiltCard } from '../motion';

function InstagramIcon({ size = 18, style }) {
  return (
    <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function HomepageEnhancements({
  onNavigate,
  onSelectCategory,
  onOpenLightbox,
  onEnquireWhatsApp
}) {
  const previewLookbook = LOOKBOOK_GALLERY.slice(0, 4);
  const instagramPosts = [
    { id: 'ig-1', image: '/assets/virasat_campaign_purple_green.jpg', label: 'Banarasi Sarees' },
    { id: 'ig-2', image: '/assets/kanjivaram_silk_campaign.jpg', label: 'Kanjivaram Silk Sarees' },
    { id: 'ig-3', image: '/assets/paithani_purple_campaign.jpg', label: 'Royal Purple Paithani Silk' },
    { id: 'ig-4', image: '/assets/patola_silk_campaign.jpg', label: 'Patola Silk' },
    { id: 'ig-5', image: '/assets/bandhani_red_yellow_campaign.jpg', label: 'Bandhani Saree' },
    { id: 'ig-6', image: '/assets/chiffon_saree_campaign.jpg', label: 'Chiffon & Organza Sarees' }
  ];

  return (
    <div className="vv-home-enhancements-wrap">
      {/* =================================================================
          A. FEATURED COLLECTIONS (7 Signature Categories)
          ================================================================= */}
      <section className="vv-home-collections-sec">
        <div className="catalog-header-split gsap-reveal-up">
          <div>
            <span className="section-mini-tag">SAREES WOVEN WITH CULTURE</span>
            <h3 className="catalog-heading">Featured Saree Collections</h3>
          </div>
          <button
            type="button"
            className="vv-link-btn"
            onClick={() => onNavigate('collections')}
          >
            View All 7 Collections →
          </button>
        </div>

        <div className="vv-home-cat-grid">
          {COLLECTION_CATEGORIES.map((cat) => (
            <TiltCard
              key={cat.id}
              max={8}
              className="vv-home-cat-card"
              onClick={() => onSelectCategory(cat.name)}
            >
              <div className="vv-home-cat-img">
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <div className="card-gold-sheen" />
                <span className="vv-home-cat-badge">{cat.tag}</span>
              </div>
              <div className="vv-home-cat-info">
                <div>
                  <h4>{cat.name}</h4>
                  <p>{cat.subtitle}</p>
                </div>
                <span className="vv-home-cat-arrow">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* =================================================================
          B. OUR CRAFTSMANSHIP & BRAND STORY ("A Legacy Woven in Every Thread.")
          ================================================================= */}
      <section className="vv-home-craft-story-sec">
        <div className="vv-home-craft-grid">
          <div className="vv-home-craft-visuals">
            <TiltCard max={6} className="vv-craft-main-frame">
              <img src="/assets/shahi_vivah_campaign.jpg" alt="Virasat Vastra — Sarees Woven With Culture" loading="lazy" />
              <div className="card-gold-sheen" />
            </TiltCard>
            <TiltCard max={8} className="vv-craft-detail-frame">
              <img src="/assets/kanjivaram_silk_campaign.jpg" alt="Kanjivaram & Banarasi Zari Artistry" loading="lazy" />
              <span>HERITAGE ZARI ARTISTRY</span>
            </TiltCard>
          </div>

          <div className="vv-home-craft-copy">
            <span className="vv-eyebrow-gold">OUR STORY &amp; CRAFTSMANSHIP</span>
            <h2>A Legacy Woven in Every Thread.</h2>
            <p className="vv-craft-lead">
              Every saree carries a story, a tradition and a timeless expression of Indian culture.
            </p>
            <p className="vv-craft-body">
              At <strong>Virasat Vastra</strong>, we celebrate the enduring artistry of Indian weavers — from richly brocaded Banarasi and lustrous silk sarees to contemporary festive and wedding drapes. Each piece is selected for its expressive pallu, intricate border work, and graceful silhouette.
            </p>

            <div className="vv-craft-highlights-row">
              <div className="vv-craft-stat">
                <strong>Rich Zari &amp; Resham</strong>
                <span>Intricate Borders &amp; Pallus</span>
              </div>
              <div className="vv-craft-stat">
                <strong>7 Curated Chapters</strong>
                <span>Bridal, Festive &amp; Traditional</span>
              </div>
              <div className="vv-craft-stat">
                <strong>Direct WhatsApp</strong>
                <span>1-on-1 Personal Consultation</span>
              </div>
            </div>

            <div className="vv-craft-actions">
              <button
                type="button"
                className="btn-hero-explore"
                onClick={() => onNavigate('our-story')}
              >
                <span>Read Our Full Story</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="vv-btn-outline-gold"
                onClick={() => onEnquireWhatsApp(null)}
              >
                <MessageCircle size={15} />
                <span>WhatsApp Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          C. LOOKBOOK / STYLE GALLERY PREVIEW
          ================================================================= */}
      <section className="vv-home-lookbook-preview">
        <div className="catalog-header-split gsap-reveal-up">
          <div>
            <span className="section-mini-tag">EDITORIAL STYLE GALLERY</span>
            <h3 className="catalog-heading">The Virasat Lookbook</h3>
          </div>
          <button
            type="button"
            className="vv-link-btn"
            onClick={() => onNavigate('lookbook')}
          >
            Open Fullscreen Lookbook →
          </button>
        </div>

        <div className="vv-home-lb-row">
          {previewLookbook.map((item, idx) => (
            <TiltCard
              key={item.id}
              max={8}
              className="vv-home-lb-card"
              onClick={() => onOpenLightbox(LOOKBOOK_GALLERY, idx)}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="card-gold-sheen" />
              <div className="vv-home-lb-shade">
                <span>{item.category}</span>
                <h4>{item.title}</h4>
                <button type="button" className="vv-lb-mini-zoom">
                  <ZoomIn size={13} /> Inspect Look
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* =================================================================
          D. GENUINE CLIENT STORIES (Only displays real testimonials when supplied)
          ================================================================= */}
      {BRAND_CONFIG.genuineTestimonials && BRAND_CONFIG.genuineTestimonials.length > 0 && (
        <section className="vv-home-testimonials-sec">
          <div className="catalog-header-split">
            <div>
              <span className="section-mini-tag">CLIENT STORIES</span>
              <h3 className="catalog-heading">Words From Our Patrons</h3>
            </div>
          </div>
          <div className="vv-testimonials-grid">
            {BRAND_CONFIG.genuineTestimonials.map((t, idx) => (
              <div key={idx} className="vv-testimonial-card">
                <Quote size={22} color="#c29b38" />
                <p>{t.quote}</p>
                <strong>{t.author}</strong>
                {t.occasion && <span>{t.occasion}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================
          E. INSTAGRAM GALLERY & DIRECT WHATSAPP ENQUIRY BANNER
          ================================================================= */}
      <section className="vv-home-ig-whatsapp-sec">
        <div className="catalog-header-split">
          <div>
            <span className="section-mini-tag">DRAPED IN HERITAGE • {BRAND_CONFIG.instagramHandle}</span>
            <h3 className="catalog-heading">Instagram Style Journal</h3>
          </div>
          <a
            href={BRAND_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-all-link"
          >
            <InstagramIcon size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Follow {BRAND_CONFIG.instagramHandle} →
          </a>
        </div>

        <div className="vv-ig-six-grid">
          {instagramPosts.map((post, idx) => (
            <div
              key={post.id}
              className="vv-ig-tile"
              onClick={() =>
                onOpenLightbox(
                  instagramPosts.map((p) => ({
                    image: p.image,
                    title: p.label,
                    category: BRAND_CONFIG.instagramHandle
                  })),
                  idx
                )
              }
            >
              <img src={post.image} alt={post.label} loading="lazy" />
              <div className="vv-ig-hover">
                <InstagramIcon size={20} />
                <span>{post.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="vv-whatsapp-royal-banner">
          <div className="vv-wa-banner-left">
            <span className="vv-eyebrow-gold">PERSONAL SAREE CONSULTATION • NO ONLINE CHECKOUT REQUIRED</span>
            <h3>Looking for a Specific Banarasi, Silk, or Bridal Saree?</h3>
            <p>
              Share any saree name or code with us on WhatsApp to enquire about availability, custom colour options, fabric close-ups, and pricing.
            </p>
          </div>
          <div className="vv-wa-banner-right">
            <button
              type="button"
              className="vv-btn-whatsapp-primary large"
              onClick={() => onEnquireWhatsApp(null)}
            >
              <MessageCircle size={20} />
              <span>Enquire on WhatsApp</span>
            </button>
            <button
              type="button"
              className="vv-btn-outline-gold"
              onClick={() => onNavigate('contact')}
            >
              <span>Visit Contact Page</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
