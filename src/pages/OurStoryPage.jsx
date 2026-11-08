import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck, HeartHandshake, Gem } from 'lucide-react';
import { OUR_STORY_CHAPTERS } from '../data';
import { BRAND_CONFIG } from '../brandConfig';
import { TiltCard } from '../motion';

export default function OurStoryPage({ onNavigate, onEnquireWhatsApp }) {
  return (
    <div className="vv-subpage-wrapper">
      {/* Editorial Hero */}
      <section className="vv-subpage-hero vv-story-hero">
        <div className="vv-subpage-hero-inner">
          <span className="vv-eyebrow-gold">{BRAND_CONFIG.brandName} • {BRAND_CONFIG.tagline.toUpperCase()}</span>
          <h1 className="vv-subpage-title">A Legacy Woven in Every Thread.</h1>
          <p className="vv-subpage-lead">
            Every saree carries a story, a tradition and a timeless expression of Indian culture.
          </p>
        </div>
      </section>

      {/* Alternating Editorial Chapters */}
      <section className="vv-story-chapters-sec">
        {OUR_STORY_CHAPTERS.map((ch, idx) => (
          <div
            key={ch.id}
            className={`vv-story-chapter-row ${idx % 2 === 1 ? 'reverse' : ''}`}
          >
            <TiltCard max={6} className="vv-story-photo-card">
              <img src={ch.image} alt={ch.title} loading="lazy" />
              <div className="card-gold-sheen" />
            </TiltCard>

            <div className="vv-story-text-col">
              <span className="section-mini-tag">{ch.eyebrow}</span>
              <h2>{ch.title}</h2>
              <p>{ch.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Commitment to Timeless Elegance Pillars */}
      <section className="vv-story-pillars-sec">
        <div className="vv-story-pillars-inner">
          <div className="vv-center-heading">
            <span className="vv-eyebrow-gold">OUR COMMITMENT TO TIMELESS ELEGANCE</span>
            <h2>The Virasat Vastra Philosophy</h2>
            <p>
              Preserving the soul of traditional Indian drapes while offering a personal, transparent, and consultative experience.
            </p>
          </div>

          <div className="vv-pillars-three-grid">
            <div className="vv-pillar-box">
              <Gem size={26} color="#f7df94" />
              <h3>Authentic Textile Character</h3>
              <p>
                Every curation celebrates rich zari borders, expressive pallus, and enduring Indian motifs chosen for their grace and drape.
              </p>
            </div>
            <div className="vv-pillar-box">
              <Sparkles size={26} color="#f7df94" />
              <h3>Ceremonial &amp; Festive Versatility</h3>
              <p>
                From sacred wedding muhurthams to intimate festive gatherings, our collections honour every milestone of Indian celebration.
              </p>
            </div>
            <div className="vv-pillar-box">
              <HeartHandshake size={26} color="#f7df94" />
              <h3>Personal WhatsApp Consultation</h3>
              <p>
                Browse at your leisure and connect directly with us on WhatsApp for fabric details, colour guidance, and availability.
              </p>
            </div>
          </div>

          <div className="vv-story-cta-bar">
            <button
              type="button"
              className="btn-hero-explore"
              onClick={() => onNavigate('collections')}
            >
              <span>Explore Collections</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="vv-btn-whatsapp-primary"
              onClick={() => onEnquireWhatsApp(null)}
            >
              <MessageCircle size={17} />
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

