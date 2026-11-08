import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, MessageCircle, Eye, ZoomIn, Heart, RotateCcw, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { COLLECTION_CATEGORIES, CATALOGUE_PRODUCTS } from '../data';
import { BRAND_CONFIG } from '../brandConfig';
import { TiltCard } from '../motion';

const ALL_COLORS = [
  'All',
  'Sindoor Crimson',
  'Emerald Green',
  'Champagne Gold',
  'Royal Plum',
  'Sapphire Blue',
  'Chandni Ivory',
  'Gulabi Rose'
];

const ALL_FABRICS = [
  'All',
  'Pure Katan Silk',
  'Mulberry Silk',
  'Silk Tissue',
  'Organza & Silk Net',
  'Handloom Organza'
];

const ALL_OCCASIONS = [
  'All',
  'Wedding & Bridal',
  'Festive & Puja',
  'Royal Reception',
  'Heritage Collector'
];

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under20', label: 'Under ₹20,000' },
  { id: '20to30', label: '₹20,000 – ₹30,000' },
  { id: 'above30', label: 'Above ₹30,000' }
];

export default function CollectionsPage({
  initialCategory = 'All',
  initialSearch = '',
  isNewArrivalsView = false,
  onSelectProduct,
  onEnquireWhatsApp,
  onOpenLightbox,
  wishlist = [],
  onToggleWishlist
}) {
  const [selectedCategory, setSelectedCategory] = useState(
    isNewArrivalsView ? 'New Arrivals' : initialCategory || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  useEffect(() => {
    if (isNewArrivalsView) {
      setSelectedCategory('New Arrivals');
    } else if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory, isNewArrivalsView]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const filteredProducts = useMemo(() => {
    return CATALOGUE_PRODUCTS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const inCat =
          item.category === selectedCategory ||
          (Array.isArray(item.categories) && item.categories.includes(selectedCategory));
        if (!inCat) return false;
      }

      // Color filter
      if (selectedColor !== 'All' && item.color !== selectedColor) {
        return false;
      }

      // Fabric filter
      if (selectedFabric !== 'All' && item.fabric !== selectedFabric) {
        return false;
      }

      // Occasion filter
      if (selectedOccasion !== 'All' && item.occasion !== selectedOccasion) {
        return false;
      }

      // Price filter (only if prices are displayed)
      if (BRAND_CONFIG.showPrices && selectedPriceRange !== 'all') {
        const p = item.price || 0;
        if (selectedPriceRange === 'under20' && p >= 20000) return false;
        if (selectedPriceRange === '20to30' && (p < 20000 || p > 30000)) return false;
        if (selectedPriceRange === 'above30' && p <= 30000) return false;
      }

      // Search query filter (matches name, category, fabric, color, work, or SKU code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = [
          item.name,
          item.code,
          item.sku,
          item.category,
          ...(item.categories || []),
          item.fabric,
          item.sareeType,
          item.work,
          item.color,
          item.occasion
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    selectedCategory,
    selectedColor,
    selectedFabric,
    selectedOccasion,
    selectedPriceRange,
    searchQuery
  ]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor('All');
    setSelectedFabric('All');
    setSelectedOccasion('All');
    setSelectedPriceRange('all');
    setSearchQuery('');
  };

  return (
    <div className="vv-subpage-wrapper">
      {/* Royal Header Banner */}
      <section className="vv-subpage-hero">
        <div className="vv-subpage-hero-inner">
          <span className="vv-eyebrow-gold">
            {isNewArrivalsView ? 'VIRASAT VASTRA • SEASONAL CURATION' : 'VIRASAT VASTRA • ROYAL ARCHIVE'}
          </span>
          <h1 className="vv-subpage-title">
            {isNewArrivalsView ? 'New Arrivals' : 'Signature Saree Collections'}
          </h1>
          <p className="vv-subpage-lead">
            {isNewArrivalsView
              ? 'Discover newly curated Banarasi, Silk, Organza, and Festive drapes — Sarees Woven With Culture.'
              : 'Explore seven signature chapters of Indian handloom and couture sarees. Select any collection or filter by weave, colour, fabric, and occasion.'}
          </p>
        </div>
      </section>

      {/* 7 Signature Category Cards Grid */}
      <section className="vv-collections-categories-sec">
        <div className="vv-sec-head-row">
          <div>
            <span className="section-mini-tag">BROWSE BY CHAPTER</span>
            <h2 className="catalog-heading">Seven Heritage Categories</h2>
          </div>
          {selectedCategory !== 'All' && (
            <button type="button" className="vv-btn-text-gold" onClick={() => setSelectedCategory('All')}>
              View All Categories ({CATALOGUE_PRODUCTS.length})
            </button>
          )}
        </div>

        <div className="vv-category-cards-grid">
          {COLLECTION_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <TiltCard
                key={cat.id}
                max={8}
                className={`vv-cat-showcase-card ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  const gridEl = document.getElementById('vv-catalogue-grid-anchor');
                  if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="vv-cat-card-media">
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                  <div className="card-gold-sheen" />
                  <span className="vv-cat-tag">{cat.tag}</span>
                </div>
                <div className="vv-cat-card-body">
                  <h3>{cat.name}</h3>
                  <p>{cat.subtitle}</p>
                  <span className="vv-cat-cta">
                    {isActive ? '✓ Currently Viewing' : 'Explore Collection →'}
                  </span>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Product Filtering & Search Bar + Catalogue Grid */}
      <section id="vv-catalogue-grid-anchor" className="vv-catalogue-filter-sec">
        <div className="vv-sample-notice-banner">
          <Sparkles size={15} />
          <span>
            <strong>Sample Catalogue Showcase:</strong> Individual sarees, SKU codes, and prices below are structured sample entries ready to be replaced with your live inventory in <code>src/data.js</code>.
          </span>
        </div>

        <div className="vv-filter-toolbar">
          <div className="vv-search-input-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search sarees by name, category, fabric, colour, or code (e.g. VV-BNR-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search saree catalogue"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="vv-clear-search">
                ×
              </button>
            )}
          </div>

          <div className="vv-filter-selects-row">
            <div className="vv-filter-group">
              <label><SlidersHorizontal size={12} /> Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {COLLECTION_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="vv-filter-group">
              <label>Colour</label>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                {ALL_COLORS.map((col) => (
                  <option key={col} value={col}>{col === 'All' ? 'All Colours' : col}</option>
                ))}
              </select>
            </div>

            <div className="vv-filter-group">
              <label>Fabric</label>
              <select value={selectedFabric} onChange={(e) => setSelectedFabric(e.target.value)}>
                {ALL_FABRICS.map((fab) => (
                  <option key={fab} value={fab}>{fab === 'All' ? 'All Fabrics' : fab}</option>
                ))}
              </select>
            </div>

            <div className="vv-filter-group">
              <label>Occasion</label>
              <select value={selectedOccasion} onChange={(e) => setSelectedOccasion(e.target.value)}>
                {ALL_OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>{occ === 'All' ? 'All Occasions' : occ}</option>
                ))}
              </select>
            </div>

            {BRAND_CONFIG.showPrices && (
              <div className="vv-filter-group">
                <label>Price Range</label>
                <select value={selectedPriceRange} onChange={(e) => setSelectedPriceRange(e.target.value)}>
                  {PRICE_RANGES.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="button" className="vv-btn-reset-filters" onClick={resetFilters}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        <div className="vv-results-summary-bar">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of {CATALOGUE_PRODUCTS.length} sarees
            {selectedCategory !== 'All' ? ` in "${selectedCategory}"` : ''}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="vv-empty-catalogue-state">
            <h3>No sarees match your current filter selection</h3>
            <p>Try clearing one or more filters or enquire with our team directly on WhatsApp for custom requirements.</p>
            <div className="vv-empty-actions">
              <button type="button" className="btn-hero-explore" onClick={resetFilters}>
                Reset All Filters
              </button>
              <button
                type="button"
                className="vv-btn-whatsapp-primary"
                onClick={() => onEnquireWhatsApp(null)}
              >
                <MessageCircle size={16} /> Enquire on WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="vv-catalogue-products-grid">
            {filteredProducts.map((item) => (
              <TiltCard key={item.id} max={7} className="vv-catalogue-card">
                <div className="vv-catalogue-card-media" onClick={() => onSelectProduct(item)}>
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div className="card-gold-sheen" />
                  <span className="vv-card-sku-badge">{item.code}</span>
                  <span className="vv-card-cat-badge">{item.category}</span>

                  <div className="vv-card-quick-icons" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Save to Shortlist"
                      onClick={() => onToggleWishlist && onToggleWishlist(item.name)}
                    >
                      <Heart
                        size={15}
                        fill={wishlist.includes(item.name) ? '#790f1d' : 'none'}
                        color={wishlist.includes(item.name) ? '#790f1d' : '#222'}
                      />
                    </button>
                    <button
                      type="button"
                      title="Zoom Saree Weave"
                      onClick={() =>
                        onOpenLightbox(
                          (item.images || [item.image]).map((src, i) => ({
                            image: src,
                            title: `${item.name} (${item.code}) — View ${i + 1}`,
                            category: item.category,
                            subtitle: item.work
                          })),
                          0
                        )
                      }
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>
                </div>

                <div className="vv-catalogue-card-body">
                  <div className="vv-card-meta-line">
                    <span>{item.fabric}</span>
                    <span>•</span>
                    <span>{item.color}</span>
                  </div>
                  <h3 onClick={() => onSelectProduct(item)}>{item.name}</h3>
                  <p className="vv-card-work-line">{item.work}</p>

                  <div className="vv-card-price-row">
                    {BRAND_CONFIG.showPrices && item.price ? (
                      <strong className="vv-card-price">₹{item.price.toLocaleString('en-IN')}</strong>
                    ) : (
                      <strong className="vv-card-price">Price on Enquiry</strong>
                    )}
                    <button
                      type="button"
                      className="vv-btn-inspect"
                      onClick={() => onSelectProduct(item)}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </div>

                  <button
                    type="button"
                    className="vv-btn-card-whatsapp"
                    onClick={() => onEnquireWhatsApp(item)}
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Enquiry ({item.code})</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

