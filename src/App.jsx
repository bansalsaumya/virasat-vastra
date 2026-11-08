import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  Search, Heart, Sparkles, MessageCircle, Menu,
  RotateCcw, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight,
  Star, X, Check, Play, Share2, ShieldCheck, Scissors, Truck, Box
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SIX_MOODS, PRODUCTS_CURVED, NEW_ARRIVALS, BEST_SELLERS,
  BRIDAL_COLLECTION, TREND_OF_THE_DAY, SEASONAL_SPECIAL,
  AUTUMN_WINTER_ARCHES, LOOK_SWITCHER_DATA, EDITORIAL_EDITS,
  WORTH_ATTENTION_OFFERS, STORIES_REELS, LATEST_TRENDS_SPREADS,
  EXPLORE_RANGE_LINKS, FOOTER_COURTYARD_MODELS, COLLECTION_CATEGORIES, CATALOGUE_PRODUCTS
} from './data';
import { BRAND_CONFIG } from './brandConfig';
import Showroom3D from './three/Showroom3D';
import { TiltCard } from './motion';
import HomepageEnhancements from './pages/HomepageEnhancements';
import { WhatsAppEnquiryModal, LightboxViewer, PolicyModal } from './pages/WhatsAppEnquiryModal';

const FabricViewer = lazy(() => import('./three/FabricViewer'));
const CylinderGallery = lazy(() => import('./three/CylinderGallery'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const OurStoryPage = lazy(() => import('./pages/OurStoryPage'));
const LookbookPage = lazy(() => import('./pages/LookbookPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProductDetailModal = lazy(() => import('./pages/ProductDetailModal'));

gsap.registerPlugin(ScrollTrigger);

function getPageFromPathname(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  if (clean === '/collections') return 'collections';
  if (clean === '/new-arrivals') return 'new-arrivals';
  if (clean === '/our-story') return 'our-story';
  if (clean === '/lookbook') return 'lookbook';
  if (clean === '/contact') return 'contact';
  return 'home';
}

export default function App() {
  // 0. Clean URL-Synced Multi-Page Navigation State
  const [activePage, setActivePage] = useState(() => getPageFromPathname(window.location.pathname));
  const [selectedCollectionCat, setSelectedCollectionCat] = useState('All');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [navSearchInput, setNavSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals: Product Detail, WhatsApp Enquiry, Fullscreen Lightbox, Policies
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [waEnquiryProduct, setWaEnquiryProduct] = useState(undefined); // undefined = closed, null = general, object = saree
  const [lightboxState, setLightboxState] = useState({ items: [], index: -1 });
  const [activePolicy, setActivePolicy] = useState(null);

  // 0b. Paisley Vector SVG Royal Intro Overlay (0:00 - 0:02)
  const [introDismissed, setIntroDismissed] = useState(false);
  const introRef = useRef(null);

  // 1. Navbar scroll state (transparent over hero -> ivory glass on scroll or subpages)
  const [navScrolled, setNavScrolled] = useState(false);

  // 2. Shortlist (Wishlist) & Toast (No shopping cart / no online payment)
  const [shortlistedItems, setShortlistedItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 3. Hero Pinned 3D Showroom Walkthrough (0:02 - 0:07: Stage 0, 1, 2)
  const heroSectionRef = useRef(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [heroStage, setHeroStage] = useState(0);

  // 3b. Active Arch Card in "ROYAL SILHOUETTES" (6 Arches)
  const [activeArchIdx, setActiveArchIdx] = useState(2);

  // 4. 3D Concave Curved Carousel ("Drapes of the Royal Darbar", 0:09 - 0:12)
  const curvedSectionRef = useRef(null);
  const [curvedOffset, setCurvedOffset] = useState(0);
  const [useWebGLCylinder, setUseWebGLCylinder] = useState(false);
  const isDraggingRef = useRef(false);
  const isCarouselHoveredRef = useRef(false);
  const dragStartXRef = useRef(0);
  const startOffsetRef = useRef(0);

  // 5. Trend / Seasonal size selection state
  const [selectedSizes, setSelectedSizes] = useState({});

  // 6. Interactive "Change Look" Studio (0:25 - 0:30)
  const [currentLookIdx, setCurrentLookIdx] = useState(0);
  const [selectedBlouseSize, setSelectedBlouseSize] = useState('M');
  const [lookQty, setLookQty] = useState(1);
  const [show3DDrape, setShow3DDrape] = useState(false);
  const lookModelRef = useRef(null);
  const lookSpecsRef = useRef(null);
  const currentLook = LOOK_SWITCHER_DATA[currentLookIdx];

  // 7. "Worth your attention" Expandable SALE Accordion (0:33 - 0:34)
  const [activeOfferIdx, setActiveOfferIdx] = useState(3); // Index 3 is the wide SALE banner by default

  // 8. "Woven silks, in motion" Video Stories (0:34 - 0:37)
  const storiesSectionRef = useRef(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [storiesProgress, setStoriesProgress] = useState(0);

  // 9. "LATEST TRENDS" 3D Magazine Spread Flipper (0:38 - 0:41)
  const [spreadIdx, setSpreadIdx] = useState(0);
  const bookCardRef = useRef(null);

  const mainRootRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Enrich any product object with a deterministic Virasat Vastra SKU code & multi-image array
  const normalizeProduct = (product) => {
    if (!product) return null;
    const matchInCatalogue = CATALOGUE_PRODUCTS.find(
      (c) =>
        c.code === product.code ||
        c.name === (product.name || product.title) ||
        c.image === (product.image || product.modelImage)
    );
    const code =
      product.code ||
      product.sku ||
      (matchInCatalogue && matchInCatalogue.code) ||
      `VV-${String(product.id || '101').toUpperCase()}`;

    return {
      ...(matchInCatalogue || {}),
      ...product,
      name: product.name || product.title || (matchInCatalogue && matchInCatalogue.name) || 'Virasat Vastra Saree',
      code,
      sku: code,
      selectedSize: selectedBlouseSize
    };
  };

  // Open WhatsApp Enquiry Modal (No online payment, no shopping cart, no checkout)
  const openWhatsAppEnquiry = (product = null) => {
    setWaEnquiryProduct(product ? normalizeProduct(product) : null);
  };

  // Open Saree Product Detail View
  const openProductDetail = (product) => {
    if (!product) return;
    setSelectedProduct(normalizeProduct(product));
  };

  // Legacy card handler now triggers the WhatsApp Enquiry flow + adds to shortlist
  const handleAddToCart = (product) => {
    const normalized = normalizeProduct(product);
    if (normalized) {
      setShortlistedItems((prev) =>
        prev.some((i) => (i.name || i.title) === normalized.name) ? prev : [...prev, normalized]
      );
    }
    openWhatsAppEnquiry(normalized);
  };

  const toggleWishlist = (title, productObj = null) => {
    const exists = wishlist.includes(title);
    setWishlist((prev) => (exists ? prev.filter((item) => item !== title) : [...prev, title]));
    if (!exists && productObj) {
      const normalized = normalizeProduct(productObj);
      setShortlistedItems((prev) =>
        prev.some((i) => (i.name || i.title) === normalized.name) ? prev : [...prev, normalized]
      );
    }
    showToast(exists ? `Removed "${title}" from Shortlist` : `Saved "${title}" to Saree Shortlist`);
  };

  // Clean URL-Synced Navigation
  const navigateToPage = (page, options = {}) => {
    const { category = 'All', search = '' } = options;
    setMobileMenuOpen(false);
    setSelectedProduct(null);

    if (category) setSelectedCollectionCat(category);
    if (search !== undefined) setGlobalSearchQuery(search);

    const pathMap = {
      home: '/',
      collections: '/collections',
      'new-arrivals': '/new-arrivals',
      'our-story': '/our-story',
      lookbook: '/lookbook',
      contact: '/contact'
    };
    const nextPath = pathMap[page] || '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page }, '', nextPath);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setActivePage(getPageFromPathname(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // SEO Dynamic Page Titles
  useEffect(() => {
    const titleMap = {
      home: 'Virasat Vastra | Sarees Woven With Culture — Luxury Indian Handwoven & Designer Sarees',
      collections: 'Saree Collections | Virasat Vastra — Banarasi, Silk, Wedding & Festive Sarees',
      'new-arrivals': 'New Arrivals | Virasat Vastra — Latest Handloom & Designer Sarees',
      'our-story': 'Our Story — A Legacy Woven in Every Thread | Virasat Vastra',
      lookbook: 'Lookbook & Style Gallery | Virasat Vastra — Sarees Woven With Culture',
      contact: 'Contact Us & WhatsApp Saree Enquiry | Virasat Vastra'
    };
    document.title = titleMap[activePage] || titleMap.home;
  }, [activePage]);

  // Trigger Paisley Vector Intro GSAP Reveal
  const playPaisleyIntro = () => {
    setIntroDismissed(false);
    setTimeout(() => {
      if (introRef.current) {
        gsap.killTweensOf(introRef.current);
        gsap.fromTo(
          introRef.current,
          { scale: 1, opacity: 1 },
          {
            scale: 2.35,
            opacity: 0,
            duration: 0.82,
            delay: 0.25,
            ease: 'power3.inOut',
            onComplete: () => setIntroDismissed(true)
          }
        );
      }
    }, 10);
  };

  useEffect(() => {
    playPaisleyIntro();
  }, []);

  // Navbar scroll listener
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(activePage !== 'home' || window.scrollY > window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activePage]);

  // Continuous gentle auto-glide for the 3D Concave Curved Carousel
  useEffect(() => {
    let rafId;
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!isDraggingRef.current && !isCarouselHoveredRef.current) {
        setCurvedOffset((prev) => prev + dt * 0.28);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // GSAP + ScrollTrigger Master Setup (runs cleanly whenever Home is active)
  useEffect(() => {
    if (activePage !== 'home') return undefined;

    const ctx = gsap.context(() => {
      // 1. Pinned Hero Showroom Video Scroll-Scrub Walkthrough (00:00 -> 00:08)
      if (heroSectionRef.current) {
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: 'top top',
          end: '+=320%',
          pin: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setHeroProgress(p);
            if (p < 0.20) setHeroStage(0);
            else if (p < 0.62) setHeroStage(1);
            else if (p < 0.79) setHeroStage(2);
            else setHeroStage(3);
          }
        });
      }

      // 2. Concave 3D Carousel Scroll Velocity Boost
      if (curvedSectionRef.current) {
        ScrollTrigger.create({
          trigger: curvedSectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          onUpdate: (self) => {
            if (!isDraggingRef.current) {
              setCurvedOffset((prev) => prev + self.getVelocity() * 0.00018);
            }
          }
        });
      }

      // 3. Section Heading Reveals across the page
      gsap.utils.toArray('.gsap-reveal-up').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0, rotateX: 12 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 87%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // 4. Rich 3D Card Stagger Flip-Up + Inner Image Ken Burns Zoom Reveal
      gsap.utils.toArray('.gsap-stagger-grid').forEach((grid) => {
        const cards = grid.querySelectorAll('.gsap-stagger-card');
        if (cards.length) {
          gsap.fromTo(
            cards,
            {
              y: 68,
              opacity: 0,
              scale: 0.9,
              rotateX: 20,
              rotateY: -10,
              transformPerspective: 1100
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotateX: 0,
              rotateY: 0,
              duration: 0.9,
              stagger: 0.09,
              ease: 'back.out(1.25)',
              scrollTrigger: {
                trigger: grid,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );

          const imgs = grid.querySelectorAll('.gsap-stagger-card img');
          if (imgs.length) {
            gsap.fromTo(
              imgs,
              { scale: 1.24 },
              {
                scale: 1,
                duration: 1.25,
                stagger: 0.09,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: grid,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            );
          }
        }
      });

      // 5. Stories in Motion Scroll-Triggered Video Walkthrough & Chapter Switcher
      if (storiesSectionRef.current) {
        ScrollTrigger.create({
          trigger: storiesSectionRef.current,
          start: 'top top',
          end: '+=280%',
          pin: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            setStoriesProgress(p);
            const idx = Math.min(
              STORIES_REELS.length - 1,
              Math.floor(p * STORIES_REELS.length)
            );
            setActiveStoryIdx(idx);
          }
        });
      }
    }, mainRootRef);

    let resizeTimer;
    const handleViewportResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    };
    window.addEventListener('resize', handleViewportResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleViewportResize);
      ctx.revert();
    };
  }, [activePage]);

  // GSAP Transition when switching Look in "Change Look" Studio
  const handleSelectLook = (idx) => {
    const nextIdx = (idx + LOOK_SWITCHER_DATA.length) % LOOK_SWITCHER_DATA.length;
    if (nextIdx === currentLookIdx) return;

    if (lookModelRef.current && lookSpecsRef.current) {
      gsap.to(lookModelRef.current, {
        x: -35,
        opacity: 0,
        scale: 0.94,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentLookIdx(nextIdx);
          gsap.fromTo(
            lookModelRef.current,
            { x: 45, opacity: 0, scale: 0.95 },
            { x: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }
          );
        }
      });
      gsap.fromTo(
        lookSpecsRef.current,
        { y: 16, opacity: 0.25 },
        { y: 0, opacity: 1, duration: 0.45, delay: 0.18, ease: 'power3.out' }
      );
    } else {
      setCurrentLookIdx(nextIdx);
    }
  };

  // GSAP Flip when changing Latest Trends Magazine Spread
  const handleSpreadChange = (dir) => {
    const next = (spreadIdx + dir + LATEST_TRENDS_SPREADS.length) % LATEST_TRENDS_SPREADS.length;
    if (bookCardRef.current) {
      gsap.to(bookCardRef.current, {
        rotateY: dir > 0 ? -18 : 18,
        scale: 0.96,
        opacity: 0.4,
        duration: 0.2,
        onComplete: () => {
          setSpreadIdx(next);
          gsap.fromTo(
            bookCardRef.current,
            { rotateY: dir > 0 ? 18 : -18, scale: 0.96, opacity: 0.4 },
            { rotateY: -6, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }
          );
        }
      });
    } else {
      setSpreadIdx(next);
    }
  };

  // 3D Concave Arc Drag / Swipe Handlers
  const onDragStart = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startOffsetRef.current = curvedOffset;
  };

  const onDragMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const diff = clientX - dragStartXRef.current;
    setCurvedOffset(startOffsetRef.current - diff * 0.0065);
  };

  const onDragEnd = () => {
    isDraggingRef.current = false;
  };

  const currentSpread = LATEST_TRENDS_SPREADS[spreadIdx];
  const activeStory = STORIES_REELS[activeStoryIdx];

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    navigateToPage('collections', { category: 'All', search: navSearchInput });
  };

  return (
    <div
      ref={mainRootRef}
      className="drift-app-root"
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
    >
      {/* =========================================
          0. ROYAL PAISLEY & ZARI BROCADE INTRO REVEAL (0:00 to 0:02)
          100% Original High-Res Woven Brocade Texture (Pure Edge-to-Edge Curtain)
          ========================================= */}
      {!introDismissed && activePage === 'home' && (
        <div
          ref={introRef}
          className="paisley-intro-screen"
          onClick={() => setIntroDismissed(true)}
          title="Click to enter Virasat Vastra"
        >
          <div className="paisley-brocade-backdrop">
            <img src="/assets/paisley_brocade.jpg" alt="Royal Banarasi Paisley Brocade" />
          </div>
          <div className="paisley-gold-shimmer" />
          <div className="paisley-intro-logo-crest">
            <img
              src="/assets/virasat_logo_gold.png"
              alt="Virasat Vastra — Sarees Woven With Culture"
            />
          </div>
        </div>
      )}

      {/* =========================================
          1. TOP ANNOUNCEMENT TICKER + TRANSPARENT/GLASS NAVBAR
          ========================================= */}
      <div className={`drift-header-wrapper ${navScrolled || activePage !== 'home' ? 'is-scrolled' : 'over-hero'}`}>
        <div className="drift-top-announcement">
          <div className="announcement-track">
            <span className="pill-sparkle">★ VIRASAT VASTRA</span>
            <span className="ticker-highlight">SAREES WOVEN WITH CULTURE</span>
            <span>•</span>
            <span>BANARASI • SILK • WEDDING • FESTIVE &amp; DESIGNER COLLECTIONS</span>
            <span>•</span>
            <span>DIRECT WHATSAPP SAREE ENQUIRY &amp; STYLING ASSISTANCE</span>
          </div>
          <div className="top-right-links">
            {activePage === 'home' && (
              <button className="btn-replay-intro" onClick={playPaisleyIntro}>
                ✦ REPLAY CURTAIN
              </button>
            )}
            <button
              type="button"
              className="btn-replay-intro"
              onClick={() => openWhatsAppEnquiry(null)}
            >
              💬 WHATSAPP ENQUIRY
            </button>
          </div>
        </div>

        <header className="drift-navbar">
          <div className="nav-col-left">
            <a
              href="/"
              className="drift-brand-logo"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('home');
              }}
            >
              <img
                src={
                  navScrolled || activePage !== 'home'
                    ? '/assets/virasat_logo_burgundy.png'
                    : '/assets/virasat_logo_gold.png'
                }
                alt="Virasat Vastra — Sarees Woven With Culture"
                className="vv-navbar-logo-img"
              />
            </a>
          </div>

          <nav className="nav-col-center" aria-label="Main Navigation">
            <ul className="nav-menu">
              <li>
                <a
                  href="/"
                  className={activePage === 'home' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('home');
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/collections"
                  className={activePage === 'collections' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('collections', { category: 'All', search: '' });
                  }}
                >
                  Collections
                </a>
              </li>
              <li>
                <a
                  href="/new-arrivals"
                  className={activePage === 'new-arrivals' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('new-arrivals', { category: 'New Arrivals', search: '' });
                  }}
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="/our-story"
                  className={activePage === 'our-story' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('our-story');
                  }}
                >
                  Our Story
                </a>
              </li>
              <li>
                <a
                  href="/lookbook"
                  className={activePage === 'lookbook' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('lookbook');
                  }}
                >
                  Lookbook
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={activePage === 'contact' ? 'is-current-nav' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPage('contact');
                  }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-col-right">
            <form className="nav-search-bar" onSubmit={handleHeaderSearchSubmit}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search Banarasi, Silk, SKU code..."
                value={navSearchInput}
                onChange={(e) => setNavSearchInput(e.target.value)}
                aria-label="Search sarees"
              />
            </form>
            <button
              className="nav-icon-link"
              title="Shortlisted Sarees"
              onClick={() => setIsShortlistOpen(true)}
              aria-label="Shortlisted Sarees"
            >
              <Heart size={18} />
              {(wishlist.length > 0 || shortlistedItems.length > 0) && (
                <span className="cart-num-badge">
                  {Math.max(wishlist.length, shortlistedItems.length)}
                </span>
              )}
            </button>
            <button
              className="nav-icon-link"
              title="Direct WhatsApp Saree Enquiry"
              onClick={() => openWhatsAppEnquiry(null)}
              aria-label="WhatsApp Enquiry"
            >
              <MessageCircle size={18} />
            </button>
            <button
              className="nav-icon-link vv-mobile-menu-trigger"
              title="Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile & Tablet Responsive Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="vv-mobile-nav-drawer">
            <form className="vv-mobile-search" onSubmit={handleHeaderSearchSubmit}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search sarees by name, fabric, or code..."
                value={navSearchInput}
                onChange={(e) => setNavSearchInput(e.target.value)}
              />
            </form>
            <ul className="vv-mobile-nav-links">
              <li><button type="button" onClick={() => navigateToPage('home')}>Home</button></li>
              <li><button type="button" onClick={() => navigateToPage('collections', { category: 'All' })}>Collections</button></li>
              <li><button type="button" onClick={() => navigateToPage('new-arrivals', { category: 'New Arrivals' })}>New Arrivals</button></li>
              <li><button type="button" onClick={() => navigateToPage('our-story')}>Our Story</button></li>
              <li><button type="button" onClick={() => navigateToPage('lookbook')}>Lookbook</button></li>
              <li><button type="button" onClick={() => navigateToPage('contact')}>Contact Us</button></li>
            </ul>
          </div>
        )}
      </div>

      {activePage === 'home' ? (
        <>

      {/* =========================================
          3. PINNED GSAP 3D SHOWROOM WALKTHROUGH HERO (0:02 - 0:08)
          Continuous First-Person Walk Forward Down the Showroom Aisle
          ========================================= */}
      <section id="hero" ref={heroSectionRef} className="hero-boutique-section">
        <div className="hero-media-stage">
          <Suspense fallback={<div className="hero-3d-fallback" />}>
            <Showroom3D
              scrollProgress={heroProgress}
              framesDir="/assets/hero_women_frames"
              totalFrames={301}
              topOffsetPx={29}
              cacheVersion="3"
            />
          </Suspense>
          <div className="boutique-lighting-vignette" />
        </div>

        {/* STAGE 0 OVERLAY: Entrance View Copy + Bottom Trust Bar (fades & rises on scroll) */}
        <div
          className={`hero-stage-overlay stage-0-content ${heroStage === 0 ? 'is-active' : 'is-hidden'}`}
          style={{
            opacity: Math.max(0, 1 - heroProgress * 4.6),
            transform: `translate3d(0, ${-heroProgress * 140}px, 0)`
          }}
        >
          <div className="hero-content-wrapper">
            <div className="hero-tag-tradition">SHAHI KARIGARI • SINCE 1984</div>
            <h1 className="hero-main-title">
              Woven in<br />Royal Legacy
            </h1>
            <div className="hero-story-tag">HEIRLOOMS OF BHARAT</div>
            <p className="hero-story-desc">
              Born on ancestral pit looms of Kashi and Kanchipuram —<br />
              where pure mulberry silk meets real gold and silver zari.
            </p>

            <div className="hero-cta-group">
              <a href="#curved-3d" className="btn-hero-explore">
                <span>EXPLORE ROYAL VAULT</span>
                <ArrowRight size={15} />
              </a>
              <button
                className="btn-hero-watch"
                onClick={() => {
                  const el = document.getElementById('stories-motion');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="play-triangle">
                  <Play size={11} fill="#fff" color="#fff" />
                </div>
                <span>INSIDE THE ATELIER</span>
              </button>
            </div>
          </div>

          {/* 3 Floating Boutique Trust Badges at bottom-left */}
          <div className="hero-bottom-floating-bar">
            <div className="floating-badge-item">
              <Sparkles size={16} color="#f7df94" />
              <div>
                <strong>24K Tested Zari</strong>
                <span>Pure Mulberry Handloom</span>
              </div>
            </div>
            <div className="floating-badge-item">
              <Truck size={16} color="#f7df94" />
              <div>
                <strong>Royal Insured Courier</strong>
                <span>Free Across India &amp; Global</span>
              </div>
            </div>
            <div className="floating-badge-item">
              <RotateCcw size={16} color="#f7df94" />
              <div>
                <strong>Bespoke Finishing</strong>
                <span>Custom Tassels &amp; Blouse</span>
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 1 OVERLAY: Clean Floating Bottom-Left Poetic Quote while walking down the aisle */}
        <div
          className={`hero-stage-overlay stage-1-quote ${heroStage === 1 ? 'is-active' : 'is-hidden'}`}
        >
          <div className="showroom-poetic-caption bottom-left">
            <p>
              <em>
                Three shuttles, two master weavers, and<br />
                forty-five days of devotion in every pallu.
              </em>
            </p>
          </div>
        </div>

        {/* STAGE 3 OVERLAY: Clean Floating Top-Right Poetic Quote at the Seated & Standing Bridal Showcase */}
        <div
          className={`hero-stage-overlay stage-2-quote ${heroStage === 3 ? 'is-active' : 'is-hidden'}`}
        >
          <div className="showroom-poetic-caption top-right">
            <p>
              <em>
                Draped today, treasured for generations —<br />
                crafted for your grandest royal moments.
              </em>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          4. INFINITE BURGUNDY TRUST MARQUEE (0:07)
          ========================================= */}
      <div className="burgundy-trust-ribbon">
        <div className="trust-marquee-track">
          {[...Array(2)].map((_, loopIdx) => (
            <div key={loopIdx} className="trust-ribbon-content">
              <span>VIRASAT VASTRA CERTIFIED HANDLOOMS</span>
              <span className="dot-sep">✦</span>
              <span>KASHI KADWA BANARASI</span>
              <span className="dot-sep">✦</span>
              <span>DAKSHIN 3-SHUTTLE KORVAI</span>
              <span className="dot-sep">✦</span>
              <span>BESPOKE ZARDOZI BLOUSE ATELIER</span>
              <span className="dot-sep">✦</span>
              <span>HEIRLOOM WOODEN BOX PACKAGING</span>
              <span className="dot-sep">✦</span>
              <span>WORLDWIDE EXPRESS ROYAL DISPATCH</span>
              <span className="dot-sep">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
          5. "ROYAL SILHOUETTES." 6 ARCH JHAROKHA SECTION (0:07 - 0:08)
          Elevated Active Arch + 3D Tilt + Golden Foil Shimmer + Slide-Up Glass Drawer
          ========================================= */}
      <section id="six-moods" className="six-moods-area">
        <div className="moods-header-row gsap-reveal-up">
          <div className="moods-title-group">
            <h2 className="moods-big-title">ROYAL SILHOUETTES.</h2>
            <span className="moods-cursive-tag">Six Heritage Chapters</span>
          </div>
          <p className="moods-right-blurb">
            From sacred morning pheras to twilight palace receptions, explore six signature handloom traditions of Virasat Vastra.
          </p>
        </div>

        <div className="six-moods-arch-grid gsap-stagger-grid">
          {SIX_MOODS.map((mood, idx) => {
            const isElevated = activeArchIdx === idx;
            return (
              <div
                key={mood.id}
                className={`arch-jharokha-wrapper gsap-stagger-card ${isElevated ? 'is-elevated' : ''} arch-wave-${idx % 2}`}
                onMouseEnter={() => setActiveArchIdx(idx)}
              >
                <TiltCard
                  max={12}
                  className="arch-jharokha-card"
                  onClick={() => showToast(`Exploring ${mood.title} — ${mood.subtitle}`)}
                >
                  <div className="arch-top-frame">
                    <img src={mood.image} alt={mood.title} loading="lazy" />
                    <div className="card-gold-sheen" />
                    <span className="arch-floating-tag">{mood.tag}</span>
                    <div className="arch-hover-drawer">
                      <p>{mood.subtitle}</p>
                      <span className="arch-explore-pill">
                        Explore Chapter <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                  <div className="arch-card-footer">
                    <span>{mood.title}</span>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================
          6. PANORAMIC 3D CONCAVE CURVED GALLERY (0:09 - 0:12)
          "Drapes of the Royal Darbar" - Continuous Auto-Glide + Scroll & Drag
          ========================================= */}
      <section id="curved-3d" ref={curvedSectionRef} className="curved-ribbon-section">
        <div className="curved-section-header gsap-reveal-up">
          <div>
            <span className="signature-tag">VIRASAT VASTRA ARCHIVE</span>
            <h2 className="curved-title-row">
              Drapes of the <span className="cursive-remembered">Royal Darbar</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button
              type="button"
              className="btn-toggle-webgl"
              onClick={() => setUseWebGLCylinder((v) => !v)}
            >
              {useWebGLCylinder ? '✦ Panoramic Arc View' : '✦ 360° WebGL Cylinder'}
            </button>
            <a href="#catalog" className="explore-edit-link">
              VIEW FULL VAULT →
            </a>
          </div>
        </div>

        {useWebGLCylinder ? (
          <div style={{ height: '460px', width: '100%' }}>
            <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading 3D Cylinder...</div>}>
              <CylinderGallery
                items={PRODUCTS_CURVED}
                onSelect={(item) => handleAddToCart(item)}
              />
            </Suspense>
          </div>
        ) : (
          <div
            className="concave-panorama-viewport"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            onMouseEnter={() => { isCarouselHoveredRef.current = true; }}
            onMouseLeave={() => { isCarouselHoveredRef.current = false; }}
          >
            {/* Top concave SVG curve mask */}
            <div className="concave-curve-mask top-mask">
              <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
                <path d="M0,0 L1440,0 L1440,12 Q720,78 0,12 Z" fill="#f4ecdf" />
              </svg>
            </div>

            <div className="concave-3d-arc-stage">
              {PRODUCTS_CURVED.map((item, idx) => {
                const total = PRODUCTS_CURVED.length;
                let rel = (idx - curvedOffset) % total;
                if (rel > total / 2) rel -= total;
                if (rel < -total / 2) rel += total;

                const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
                const angleDeg = rel * 14.5;
                const rad = (angleDeg * Math.PI) / 180;
                const radiusX = isMobile ? 840 : 1120;
                const translateX = Math.sin(rad) * radiusX;
                const translateZ = (1 - Math.cos(rad)) * (isMobile ? 220 : 340);
                const rotateY = -angleDeg * 1.15;
                const opacity = Math.abs(rel) > (isMobile ? 2.4 : 3.3) ? 0 : 1;

                return (
                  <div
                    key={item.id}
                    className="concave-arc-card"
                    style={{
                      transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg)`,
                      opacity,
                      zIndex: Math.round(100 - Math.abs(rel) * 10)
                    }}
                    onClick={() => openProductDetail(item)}
                  >
                    <img src={item.image} alt={item.name} draggable={false} />
                    <div className="card-gold-sheen" />
                    <div className="concave-card-gradient" />
                    <div className="concave-card-overlay">
                      <h4>{item.name}</h4>
                      <p>{item.fabric}</p>
                      <div className="concave-card-bottom">
                        <span>₹{item.price.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          className="btn-concave-bag"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                          Enquire
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom concave SVG curve mask */}
            <div className="concave-curve-mask bottom-mask">
              <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
                <path d="M0,58 Q720,-8 1440,58 L1440,70 L0,70 Z" fill="#f4ecdf" />
              </svg>
            </div>
          </div>
        )}

        <div className="curved-controls-row">
          <button
            className="btn-circle-nav"
            onClick={() => setCurvedOffset((v) => v - 1)}
            title="Previous Weave"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="drag-hint-text">AUTO-GLIDING 3D LOOM ARC • DRAG OR SCROLL TO SPIN</span>
          <button
            className="btn-circle-nav"
            onClick={() => setCurvedOffset((v) => v + 1)}
            title="Next Weave"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* =========================================
          7. FRESH FROM THE LOOMS & COLLECTOR FAVOURITES (0:13 - 0:16)
          Every Card Has 3D Tilt + Gold Sheen Sweep + Slide-Up Quick Action Bar
          ========================================= */}
      <section id="catalog" className="catalog-products-section">
        <div className="catalog-header-split gsap-reveal-up">
          <div>
            <span className="section-mini-tag">NEW SEASON WEAVES</span>
            <h3 className="catalog-heading">Fresh From The Looms</h3>
          </div>
          <a
            href="/new-arrivals"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('new-arrivals', { category: 'New Arrivals' });
            }}
          >
            Explore all new weaves →
          </a>
        </div>

        <div className="catalog-marquee-viewport">
          <div className="catalog-marquee-track marquee-rtl">
            {[...NEW_ARRIVALS, ...NEW_ARRIVALS].map((prod, idx) => (
              <TiltCard key={`${prod.id}-${idx}`} max={9} className="drift-catalog-card">
                <div className="card-photo-box" onClick={() => openProductDetail(prod)}>
                  <img src={prod.image} alt={prod.title} loading="lazy" />
                  <div className="card-gold-sheen" />
                  <span className="badge-tag-top">{prod.badge}</span>
                  <button
                    className="btn-quick-heart"
                    title="Save to Shortlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.title, prod);
                    }}
                  >
                    <Heart
                      size={14}
                      fill={wishlist.includes(prod.title) ? '#790f1d' : 'none'}
                      color={wishlist.includes(prod.title) ? '#790f1d' : '#333'}
                    />
                  </button>
                  <div className="card-quick-slide-bar" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => handleAddToCart(prod)}>
                      <Sparkles size={12} /> WhatsApp Enquiry
                    </button>
                  </div>
                </div>
                <div className="card-info-box">
                  <h4 className="card-name" onClick={() => openProductDetail(prod)} style={{ cursor: 'pointer' }}>
                    {prod.title}
                  </h4>
                  <p className="card-sub">{prod.fabric}</p>
                  <div className="card-price-add">
                    <span className="price-tag">₹{prod.price.toLocaleString('en-IN')}</span>
                    <button className="btn-card-buy" onClick={() => handleAddToCart(prod)}>
                      Enquire
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Collector Favourites */}
        <div className="catalog-header-split gsap-reveal-up" style={{ marginTop: '4.5rem' }}>
          <div>
            <span className="section-mini-tag">MOST COVETED HEIRLOOMS</span>
            <h3 className="catalog-heading">Collector Favourites</h3>
          </div>
          <a
            href="/collections"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('collections', { category: 'All' });
            }}
          >
            Explore all collector pieces →
          </a>
        </div>

        <div className="catalog-marquee-viewport">
          <div className="catalog-marquee-track marquee-ltr">
            {[...BEST_SELLERS, ...BEST_SELLERS].map((prod, idx) => (
              <TiltCard key={`${prod.id}-${idx}`} max={9} className="drift-catalog-card">
                <div className="card-photo-box" onClick={() => openProductDetail(prod)}>
                  <img src={prod.image} alt={prod.title} loading="lazy" />
                  <div className="card-gold-sheen" />
                  <span className="badge-tag-top gold">{prod.badge}</span>
                  <button
                    className="btn-quick-heart"
                    title="Save to Shortlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.title, prod);
                    }}
                  >
                    <Heart
                      size={14}
                      fill={wishlist.includes(prod.title) ? '#790f1d' : 'none'}
                      color={wishlist.includes(prod.title) ? '#790f1d' : '#333'}
                    />
                  </button>
                  <div className="card-quick-slide-bar" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => handleAddToCart(prod)}>
                      <Sparkles size={12} /> WhatsApp Enquiry
                    </button>
                  </div>
                </div>
                <div className="card-info-box">
                  <h4 className="card-name" onClick={() => openProductDetail(prod)} style={{ cursor: 'pointer' }}>
                    {prod.title}
                  </h4>
                  <p className="card-sub">{prod.fabric}</p>
                  <div className="card-price-add">
                    <span className="price-tag">₹{prod.price.toLocaleString('en-IN')}</span>
                    <button className="btn-card-buy" onClick={() => handleAddToCart(prod)}>
                      Enquire
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          8. THE SHAHI VIVAH TROUSSEAU (0:17 - 0:20)
          Symmetric Top & Bottom Scalloped Royal Arch Borders + 3D Tilt Polaroid Cards
          ========================================= */}
      <section id="bridal" className="bridal-luxury-section">
        <div className="bridal-scallop-border top-scallop">
          <svg viewBox="0 0 1440 74" preserveAspectRatio="none">
            <path
              d="M0,0 L1440,0 L1440,36 C1320,8 1160,8 1020,46 C880,12 560,12 420,46 C280,8 120,8 0,36 Z"
              fill="#fbf8f3"
            />
            <path
              d="M0,36 C120,8 280,8 420,46 C560,12 880,12 1020,46 C1160,8 1320,8 1440,36"
              fill="none"
              stroke="#c29b38"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        <div className="bridal-inner-content">
          <div className="bridal-grid-layout">
            <div className="bridal-poster-column gsap-reveal-up">
              <TiltCard max={7} className="bridal-poster-frame">
                <img
                  src="/assets/shahi_vivah_campaign.jpg"
                  alt="Virasat Vastra Shahi Vivah Campaign Poster"
                  className="bride-portrait-img"
                />
                <div className="card-gold-sheen" />
              </TiltCard>
            </div>

            <div className="bridal-slider-column">
              <div className="bridal-heading-area gsap-reveal-up">
                <span className="bridal-eyebrow-gold">ROYAL MUHURTHAM DRAPES</span>
                <h3 className="bridal-title">The Shahi Vivah Trousseau</h3>
              </div>

              <div className="bridal-polaroid-row gsap-stagger-grid">
                {BRIDAL_COLLECTION.map((b) => (
                  <TiltCard key={b.id} max={9} className="bridal-polaroid-card gsap-stagger-card">
                    <div className="bridal-polaroid-img" onClick={() => openProductDetail(b)} style={{ cursor: 'pointer' }}>
                      <img src={b.image} alt={b.title} loading="lazy" />
                      <div className="card-gold-sheen" />
                    </div>
                    <div className="bridal-polaroid-body">
                      <h5 onClick={() => openProductDetail(b)} style={{ cursor: 'pointer' }}>{b.title}</h5>
                      <p>{b.fabric}</p>
                      <strong className="bridal-polaroid-price">
                        ₹{b.price.toLocaleString('en-IN')}
                      </strong>
                      <button
                        className="btn-bridal-mustard-cart"
                        onClick={() => handleAddToCart(b)}
                      >
                        WHATSAPP ENQUIRY
                      </button>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bridal-scallop-border bottom-scallop">
          <svg viewBox="0 0 1440 74" preserveAspectRatio="none">
            <path
              d="M0,38 C120,68 280,68 420,28 C560,64 880,64 1020,28 C1160,68 1320,68 1440,38 L1440,74 L0,74 Z"
              fill="#fbf8f3"
            />
            <path
              d="M0,38 C120,68 280,68 420,28 C560,64 880,64 1020,28 C1160,68 1320,68 1440,38"
              fill="none"
              stroke="#c29b38"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </section>

      {/* =========================================
          9. KARIGAR SPOTLIGHT & FESTIVE UTSAV EDIT (0:21 - 0:23)
          3D Tilt Horizontal Mini-Cards with Shimmer & Pulse Arrow
          ========================================= */}
      <section className="trends-seasonal-section">
        <div className="trends-section-container">
          <div className="trend-row-block">
            <h4 className="trend-row-title gsap-reveal-up">
              <span className="title-bar">|</span> Karigar Spotlight
            </h4>
            <div className="trend-cards-grid gsap-stagger-grid">
              {TREND_OF_THE_DAY.map((t) => {
                const activeSz = selectedSizes[t.id] || 'M';
                return (
                  <TiltCard key={t.id} max={7} className="trend-mini-card gsap-stagger-card">
                    <div className="trend-mini-thumb-wrap">
                      <img src={t.image} alt={t.title} loading="lazy" />
                      <div className="card-gold-sheen" />
                    </div>
                    <div className="trend-mini-body">
                      <h6>{t.title}</h6>
                      <div className="size-selector-pills">
                        {t.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={activeSz === s ? 'size-pill active' : 'size-pill'}
                            onClick={() => setSelectedSizes((p) => ({ ...p, [t.id]: s }))}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="trend-price-line">
                        <span>₹{t.price.toLocaleString('en-IN')}</span>
                        <button
                          className="btn-yellow-round-add"
                          onClick={() => handleAddToCart(t)}
                          title="Add to Trousseau"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>

          <div className="trend-row-block" style={{ marginTop: '3.2rem' }}>
            <h4 className="trend-row-title gsap-reveal-up">
              <span className="title-bar">|</span> Festive Utsav Edit
            </h4>
            <div className="trend-cards-grid gsap-stagger-grid">
              {SEASONAL_SPECIAL.map((s) => {
                const activeSz = selectedSizes[s.id] || 'S';
                return (
                  <TiltCard key={s.id} max={7} className="trend-mini-card gsap-stagger-card">
                    <div className="trend-mini-thumb-wrap">
                      <img src={s.image} alt={s.title} loading="lazy" />
                      <div className="card-gold-sheen" />
                    </div>
                    <div className="trend-mini-body">
                      <h6>{s.title}</h6>
                      <div className="size-selector-pills">
                        {s.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            className={activeSz === sz ? 'size-pill active' : 'size-pill'}
                            onClick={() => setSelectedSizes((p) => ({ ...p, [s.id]: sz }))}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      <div className="trend-price-line">
                        <span>₹{s.price.toLocaleString('en-IN')}</span>
                        <button
                          className="btn-yellow-round-add"
                          onClick={() => handleAddToCart(s)}
                          title="Add to Trousseau"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          10. SHAHI WINTER 2026 (3 ARCHES) +
              INTERACTIVE "STYLE YOUR DRAPE" STUDIO (0:24 - 0:30)
          ========================================= */}
      <section id="change-look" className="interactive-look-section">
        <div className="aw-forecast-container">
          <div className="aw-header-grid gsap-reveal-up">
            <div className="aw-meta-left">
              <span>ATELIER</span>
              <span>CHRONICLES</span>
            </div>
            <div className="aw-title-center">
              <h2>
                Shahi<br />
                Winter <span className="aw-year-gold">2026</span>
              </h2>
            </div>
            <div className="aw-blurb-right">
              <p>
                A royal anthology of hand-spun mulberry organzas, liquid zari tissues, and temple-border Kanjivarams.
              </p>
              <a href="#LookStudio" className="aw-explore-link">ENTER THE ATELIER →</a>
            </div>
          </div>

          <div className="aw-three-arches gsap-stagger-grid">
            {AUTUMN_WINTER_ARCHES.map((arch) => (
              <TiltCard
                key={arch.id}
                max={9}
                className="aw-arch-card gsap-stagger-card"
                onClick={() => showToast(`Viewing ${arch.title}`)}
              >
                <img src={arch.image} alt={arch.title} loading="lazy" />
                <div className="card-gold-sheen" />
                <div className="aw-arch-caption">
                  <span>{arch.tag}</span>
                  <strong>{arch.title}</strong>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Interactive "Style Your Drape" Customizer with 4K Portraits + Live 3D Silk Drape */}
        <div id="LookStudio" className="look-customizer-box">
          <div className="look-thumbs-column">
            <div className="change-look-handwritten">
              <span className="script-change-label">Style your drape</span>
              <svg className="hand-arrow-svg" width="38" height="28" viewBox="0 0 38 28" fill="none">
                <path
                  d="M4 2 C14 10, 22 14, 30 24 M30 24 L22 22 M30 24 L29 16"
                  stroke="#726861"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="thumbs-vertical-stack">
              {LOOK_SWITCHER_DATA.map((look, idx) => (
                <div
                  key={look.id}
                  className={`thumb-hanging-card ${currentLookIdx === idx ? 'selected' : ''}`}
                  onClick={() => handleSelectLook(idx)}
                >
                  <img src={look.modelImage} alt={look.name} />
                </div>
              ))}
            </div>

            <div className="new-drop-handwritten">
              <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
                <path
                  d="M14 28 C16 14, 24 8, 36 4 M36 4 L28 3 M36 4 L32 11"
                  stroke="#726861"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <span>Shahi Edition 2026</span>
            </div>
          </div>

          <div className="look-center-model-stage">
            <div className="look-giant-watermark" aria-hidden="true">
              {currentLook.watermark}
            </div>

            <button
              className="look-stage-arrow left"
              onClick={() => handleSelectLook(currentLookIdx - 1)}
              aria-label="Previous look"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="look-stage-arrow right"
              onClick={() => handleSelectLook(currentLookIdx + 1)}
              aria-label="Next look"
            >
              <ChevronRight size={16} />
            </button>

            <div ref={lookModelRef} className="look-model-figure-wrap">
              {show3DDrape ? (
                <div className="look-three-drape-box">
                  <Suspense fallback={<div className="drape-loading">Loading 3D Silk...</div>}>
                    <FabricViewer color={currentLook.threeColor} />
                  </Suspense>
                </div>
              ) : (
                <div className="look-editorial-portrait-card">
                  <img
                    src={currentLook.modelImage}
                    alt={currentLook.name}
                    className="look-standing-model-img"
                  />
                  <div
                    className="look-silk-aura-ring"
                    style={{ borderColor: currentLook.colorHex }}
                  />
                </div>
              )}
            </div>

            <div className="look-bottom-pill-bar">
              <button
                type="button"
                className="pill-watch-btn"
                onClick={() => setShow3DDrape((v) => !v)}
              >
                <span className="pill-play-dot">
                  <Play size={9} fill="#fff" color="#fff" />
                </span>
                <span>{show3DDrape ? '4K Editorial Look' : 'Interactive 3D Silk'}</span>
              </button>
              <div className="pill-mini-thumbs">
                {LOOK_SWITCHER_DATA.map((lk, idx) => (
                  <button
                    key={lk.id}
                    type="button"
                    className={`pill-mini-avatar ${currentLookIdx === idx ? 'active' : ''}`}
                    onClick={() => handleSelectLook(idx)}
                  >
                    <img src={lk.modelImage} alt={lk.colorName} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={lookSpecsRef} className="look-specs-column">
            <div className="specs-top-meta">
              <a href="#catalog" className="shop-all-sarees-link">Shop all sarees →</a>
            </div>

            <div className="specs-rating-row">
              <div className="stars-group">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="#c29b38" color="#c29b38" />
                ))}
              </div>
              <span>{currentLook.rating} ({currentLook.reviews} Reviews)</span>
            </div>

            <h2 className="specs-product-title">{currentLook.name}</h2>
            <div className="specs-price-tag">₹{currentLook.price.toLocaleString('en-IN')}</div>
            <p className="specs-product-story">{currentLook.description}</p>

            <div className="specs-micro-features">
              <div className="micro-feat">
                <Sparkles size={14} />
                <span>Pure Handloom<br />Silk</span>
              </div>
              <div className="micro-feat">
                <Scissors size={14} />
                <span>Custom Blouse<br />Stitching</span>
              </div>
              <div className="micro-feat">
                <ShieldCheck size={14} />
                <span>Silk Mark<br />Certified</span>
              </div>
              <div className="micro-feat">
                <Box size={14} />
                <span>Heirloom Box<br />Packaging</span>
              </div>
            </div>

            <div className="selector-group">
              <div className="selector-label-row">
                <label>SELECT BLOUSE SIZE</label>
                <button
                  type="button"
                  className="size-guide-btn"
                  onClick={() => showToast('Blouse Size Guide: XS (32) • S (34) • M (36) • L (38) • XL (40)')}
                >
                  📏 Size Guide
                </button>
              </div>
              <div className="blouse-size-buttons">
                {['S', 'M', 'L', 'XL', '2XL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`btn-blouse-size ${selectedBlouseSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedBlouseSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="swatches-and-tilted-cta">
              <div>
                <div className="selector-group" style={{ marginBottom: '0.9rem' }}>
                  <label>
                    SELECT COLOUR : <strong>{currentLook.colorName}</strong>
                  </label>
                  <div className="look-swatches-row">
                    {LOOK_SWITCHER_DATA.map((look, idx) => (
                      <button
                        key={look.id}
                        type="button"
                        className={`btn-color-swatch ${currentLookIdx === idx ? 'active' : ''}`}
                        style={{ backgroundColor: look.colorHex }}
                        onClick={() => handleSelectLook(idx)}
                        title={look.name}
                      >
                        {currentLookIdx === idx && (
                          <Check size={14} color={look.colorName === 'IVORY' ? '#111' : '#fff'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="look-qty-stepper">
                  <button type="button" onClick={() => setLookQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{lookQty}</span>
                  <button type="button" onClick={() => setLookQty((q) => q + 1)}>+</button>
                </div>
              </div>

              <div className="tilted-cta-cluster">
                <button
                  type="button"
                  className="btn-diagonal-add-cart"
                  onClick={() => handleAddToCart(currentLook, lookQty)}
                >
                  <span>WHATSAPP ENQUIRY</span>
                  <span className="diagonal-arrow-circle">
                    <ArrowRight size={15} />
                  </span>
                </button>

                <div className="tilted-sub-icons">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(currentLook.name, currentLook)}
                    title="Shortlist"
                  >
                    <Heart size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Link copied to clipboard')}
                    title="Share Look"
                  >
                    <Share2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow3DDrape((v) => !v)}
                    title="Toggle 3D Silk View"
                  >
                    <Sparkles size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          11. CURATED FOR GRAND CELEBRATIONS + "THE ROYAL ARCHIVE VAULT" ACCORDION (0:31 - 0:34)
          ========================================= */}
      <section className="edits-occasion-section">
        <div className="edits-header-area gsap-reveal-up">
          <h2 className="edits-stencil-title">
            CURATED FOR <span className="stencil-script">grand celebrations</span>
          </h2>
        </div>

        <div className="edits-four-grid gsap-stagger-grid">
          {EDITORIAL_EDITS.map((edit) => (
            <TiltCard
              key={edit.id}
              max={9}
              className="edit-magazine-card gsap-stagger-card"
              onClick={() => navigateToPage('collections', { category: 'All' })}
            >
              <img src={edit.image} alt={edit.title} loading="lazy" />
              <div className="card-gold-sheen" />
              <div className="edit-card-shade">
                <h4>{edit.title}</h4>
                <p>{edit.subtitle}</p>
                <span className="card-explore-btn">ENTER CURATION →</span>
              </div>
            </TiltCard>
          ))}
        </div>

        <div className="worth-attention-wrapper">
          <div className="worth-header-row gsap-reveal-up">
            <div>
              <span className="section-mini-tag">PRIVATE ATELIER PRIVILEGES</span>
              <h3 className="worth-title">The Royal Archive Vault</h3>
            </div>
            <span className="worth-hint">Hover or click any archive strip to expand</span>
          </div>

          <div className="worth-accordion-strip">
            {WORTH_ATTENTION_OFFERS.map((offer, idx) => {
              const isExpanded = activeOfferIdx === idx;
              return (
                <div
                  key={offer.id}
                  className={`worth-strip-panel ${isExpanded ? 'expanded' : 'collapsed'}`}
                  onMouseEnter={() => setActiveOfferIdx(idx)}
                  onClick={() => setActiveOfferIdx(idx)}
                >
                  <img src={offer.image} alt={offer.title} loading="lazy" />

                  <div className="worth-giant-sale-text" aria-hidden="true">
                    VAULT
                  </div>

                  <div className="worth-collapsed-overlay">
                    <span className="worth-code">{offer.code}</span>
                    <span className="worth-vertical-label">{offer.label}</span>
                  </div>

                  <div className="worth-expanded-content">
                    <span className="worth-discount-pill">{offer.discount}</span>
                    <h4>{offer.title}</h4>
                    <p>{offer.subtitle}</p>
                    <button
                      type="button"
                      className="btn-worth-shop"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsAppEnquiry({
                          name: offer.title,
                          code: `VV-VAULT-${offer.code}`,
                          category: offer.label,
                          fabric: offer.subtitle,
                          image: offer.image
                        });
                      }}
                    >
                      ENQUIRE ON WHATSAPP →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          12. "LIVING LOOMS, IN MOTION" — FULLSCREEN STORIES + 3D SILK (0:34 - 0:37)
          ========================================= */}
      <section id="stories-motion" ref={storiesSectionRef} className="cinematic-stories-section">
        <div className="stories-top-header">
          <div>
            <span className="stories-mini-eyebrow">VIRASAT FILMS</span>
            <h4>Living looms, in motion</h4>
          </div>
          <span className="stories-scroll-indicator">
            CHAPTER 0{activeStoryIdx + 1} / 0{STORIES_REELS.length}
          </span>
        </div>

        <div className="stories-stage-body">
          <div className="cinematic-backdrop-preview">
            <Suspense fallback={null}>
              <Showroom3D
                scrollProgress={storiesProgress}
                videoSrc="/assets/showroom_walkthrough.mp4"
                framesDir="/assets/showroom_frames"
                totalFrames={241}
                topOffsetPx={0}
              />
            </Suspense>
            <div className="cinematic-vignette-dark stories-video-vignette" />
          </div>

          <div className="cinematic-front-layout">
            <div className="cinematic-left-story">
              <span className="cinematic-brand-tag">VIRASAT VASTRA</span>
              <h3 key={activeStory.id} className="cinematic-story-name">
                {activeStory.title.split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    {word}
                    <br />
                  </React.Fragment>
                ))}
              </h3>
              <span className="cinematic-story-tag">{activeStory.tag}</span>
              <p className="cinematic-story-sub">{activeStory.subtitle}</p>
            </div>

            <div className="cinematic-right-strip-wrap">
              <div className="cinematic-strip-top-bar">
                <span>FEATURED HEIRLOOM • ₹{activeStory.price.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  className="btn-story-add-bag"
                  onClick={() =>
                    handleAddToCart({
                      name: `${activeStory.title} Edition Silk`,
                      code: `VV-STORY-0${activeStory.index}`,
                      fabric: activeStory.tag,
                      price: activeStory.price,
                      image: activeStory.thumb
                    })
                  }
                >
                  WHATSAPP ENQUIRY
                </button>
              </div>

              <div className="cinematic-reels-strip">
                {STORIES_REELS.map((reel, idx) => (
                  <div
                    key={reel.id}
                    className={`reel-thumbnail-box ${activeStoryIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStoryIdx(idx);
                      setStoriesProgress(
                        STORIES_REELS.length > 1 ? idx / (STORIES_REELS.length - 1) : 0
                      );
                    }}
                  >
                    <img src={reel.thumb} alt={reel.title} />
                    <div className="reel-thumb-shade">
                      <span className="reel-title-caption">{reel.title}</span>
                      <span className="reel-play-badge">▶</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          12B. SEAMLESS HOMEPAGE ENHANCEMENTS
          Featured Collections, Craftsmanship & Brand Story, Lookbook Preview,
          Instagram Gallery & Direct WhatsApp Concierge CTA
          ========================================= */}
      <HomepageEnhancements
        onNavigate={(page) => navigateToPage(page)}
        onSelectCategory={(catName) => navigateToPage('collections', { category: catName })}
        onOpenLightbox={(items, idx) => setLightboxState({ items, index: idx })}
        onEnquireWhatsApp={(prod) => openWhatsAppEnquiry(prod)}
      />

      {/* =========================================
          13. VIRASAT JOURNAL 3D BOOK SPREAD (0:38 - 0:42)
          ========================================= */}
      <section className="latest-trends-footer-section">
        <div className="trends-feature-split">
          <div className="trends-left-text gsap-reveal-up">
            <span className="tag-pill-white">Royal Chronicle</span>
            <h2 className="title-latest-trends">
              VIRASAT<br />JOURNAL
            </h2>
            <button
              className="btn-discover-now"
              onClick={() => handleSpreadChange(1)}
            >
              Turn Page →
            </button>
            <div className="trends-story-blurb">
              <h5>Legacy of the Pit Loom</h5>
              <p>
                Every Virasat Vastra saree is a living manuscript of pure silk and tested zari — hand-interlocked by master karigars.
              </p>
            </div>
          </div>

          <div className="trends-center-photo-wrap gsap-reveal-up">
            <div
              ref={bookCardRef}
              className="magazine-book-spread"
              onClick={() => handleSpreadChange(1)}
            >
              <div className="book-spine-crease" />
              <img src={currentSpread.image} alt={currentSpread.title} />
              <div className="card-gold-sheen" />
              <div className="book-spread-caption">
                <span>{currentSpread.caption}</span>
                <strong>{currentSpread.title}</strong>
              </div>
            </div>

            <div className="book-pagination-row">
              <button type="button" onClick={() => handleSpreadChange(-1)} aria-label="Previous spread">
                ‹
              </button>
              <span>{currentSpread.page}</span>
              <button type="button" onClick={() => handleSpreadChange(1)} aria-label="Next spread">
                ›
              </button>
            </div>
          </div>

          <div className="trends-right-links gsap-reveal-up">
            <h4>The Heritage Directory</h4>
            <ul className="range-list-table">
              {EXPLORE_RANGE_LINKS.map((item) => (
                <li
                  key={item.name}
                  onClick={() =>
                    handleAddToCart({
                      name: `${item.name} Signature Drape`,
                      fabric: 'Pure Certified Handloom',
                      price: item.price,
                      image: currentSpread.image
                    })
                  }
                >
                  <span className="range-name">{item.name}</span>
                  <span className="range-count">{item.count} →</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
        </>
      ) : activePage === 'collections' || activePage === 'new-arrivals' ? (
        <Suspense fallback={null}>
          <CollectionsPage
            initialCategory={activePage === 'new-arrivals' ? 'New Arrivals' : selectedCollectionCat}
            initialSearch={globalSearchQuery}
            isNewArrivalsView={activePage === 'new-arrivals'}
            onSelectProduct={(prod) => openProductDetail(prod)}
            onEnquireWhatsApp={(prod) => openWhatsAppEnquiry(prod)}
            onOpenLightbox={(items, idx) => setLightboxState({ items, index: idx })}
            wishlist={wishlist}
            onToggleWishlist={(title, prod) => toggleWishlist(title, prod)}
          />
        </Suspense>
      ) : activePage === 'our-story' ? (
        <Suspense fallback={null}>
          <OurStoryPage
            onNavigate={(page) => navigateToPage(page)}
            onEnquireWhatsApp={(prod) => openWhatsAppEnquiry(prod)}
          />
        </Suspense>
      ) : activePage === 'lookbook' ? (
        <Suspense fallback={null}>
          <LookbookPage
            onOpenLightbox={(items, idx) => setLightboxState({ items, index: idx })}
            onSelectProduct={(prod) => openProductDetail(prod)}
            onEnquireWhatsApp={(prod) => openWhatsAppEnquiry(prod)}
          />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <ContactPage
            onEnquireWhatsApp={(prod) => openWhatsAppEnquiry(prod)}
          />
        </Suspense>
      )}

      {/* =========================================
          SHARED VIRASAT VASTRA ROYAL COURTYARD FOOTER
          ========================================= */}
      <footer id="footer" className="drift-courtyard-footer">
        <div className="footer-cols-wrap">
          <div className="footer-brand-column">
            <img
              src="/assets/virasat_logo_burgundy.png"
              alt="Virasat Vastra — Sarees Woven With Culture"
              className="vv-footer-logo-img"
            />
            <p className="footer-italic-tag">
              Sarees Woven With Culture —<br />
              premium Indian traditional &amp; designer sarees.
            </p>
            <div className="vv-footer-contact-meta">
              <span>WhatsApp: {BRAND_CONFIG.whatsappDisplayPlaceholder}</span>
              <span>Email: {BRAND_CONFIG.contactEmail}</span>
              <span>Address: {BRAND_CONFIG.businessAddress}</span>
            </div>
          </div>

          <div className="footer-nav-col">
            <h5>Navigation</h5>
            <ul>
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigateToPage('home'); }}>Home</a></li>
              <li><a href="/collections" onClick={(e) => { e.preventDefault(); navigateToPage('collections', { category: 'All' }); }}>Collections</a></li>
              <li><a href="/new-arrivals" onClick={(e) => { e.preventDefault(); navigateToPage('new-arrivals', { category: 'New Arrivals' }); }}>New Arrivals</a></li>
              <li><a href="/our-story" onClick={(e) => { e.preventDefault(); navigateToPage('our-story'); }}>Our Story</a></li>
              <li><a href="/lookbook" onClick={(e) => { e.preventDefault(); navigateToPage('lookbook'); }}>Lookbook</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigateToPage('contact'); }}>Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5>Collections</h5>
            <ul>
              {COLLECTION_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <a
                    href="/collections"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPage('collections', { category: cat.name });
                    }}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5>Client Care &amp; Policies</h5>
            <ul>
              <li><a href="#whatsapp" onClick={(e) => { e.preventDefault(); openWhatsAppEnquiry(null); }}>WhatsApp Saree Enquiry</a></li>
              <li><a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ({BRAND_CONFIG.instagramHandle})</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicy('privacy'); }}>Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicy('terms'); }}>Terms &amp; Conditions</a></li>
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); setActivePolicy('shipping'); }}>Shipping &amp; Return Policy</a></li>
            </ul>
          </div>

          <div className="footer-newsletter-col">
            <h5>Direct WhatsApp Concierge</h5>
            <p>Enquire about saree availability, colours, fabric details, and pricing directly on WhatsApp.</p>
            <button
              type="button"
              className="vv-btn-whatsapp-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => openWhatsAppEnquiry(null)}
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Crisp Royal Sandstone Courtyard Stage with 5 Saree Muses & Animated Crimson Silk Ribbon */}
        <div className="footer-courtyard-stage">
          <svg
            className="footer-silk-ribbon-svg"
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="crimsonRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b0152a" stopOpacity="0.92" />
                <stop offset="35%" stopColor="#d92b43" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#830c1c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b0152a" stopOpacity="0.92" />
              </linearGradient>
            </defs>
            <path
              d="M-40,25 C180,140 340,210 560,165 C780,120 980,225 1220,150 C1340,115 1420,65 1480,40 L1480,105 C1380,145 1260,195 1120,210 C890,235 720,165 510,205 C290,245 140,165 -40,85 Z"
              fill="url(#crimsonRibbon)"
            />
            <path
              d="M-40,45 C190,155 350,220 570,175 C790,130 990,235 1230,160 C1350,125 1420,75 1480,55"
              fill="none"
              stroke="#f7df94"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
          </svg>

          {/* 5 Crisp HD Saree Muses in Palace Courtyard Arches */}
          <div className="footer-muses-row">
            {FOOTER_COURTYARD_MODELS.map((muse, i) => (
              <div
                key={muse.id}
                className={`footer-muse-arch muse-pos-${i}`}
                onClick={() => openProductDetail(muse)}
              >
                <img src={muse.image} alt={muse.name} loading="lazy" />
                <span className="muse-tag">{muse.name}</span>
              </div>
            ))}
          </div>

          <div className="footer-bottom-overlay-bar">
            <span>© 2026 VIRASAT VASTRA — Sarees Woven With Culture. All rights reserved.</span>
            <div className="footer-social-pills">
              <a href={BRAND_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>IG</a>
              <span onClick={() => openWhatsAppEnquiry(null)} style={{ cursor: 'pointer' }}>WA</span>
            </div>
            <span>
              <button type="button" className="vv-footer-policy-inline" onClick={() => setActivePolicy('terms')}>Terms &amp; Conditions</button>
              {' • '}
              <button type="button" className="vv-footer-policy-inline" onClick={() => setActivePolicy('privacy')}>Privacy Policy</button>
              {' • '}
              <button type="button" className="vv-footer-policy-inline" onClick={() => setActivePolicy('shipping')}>Shipping &amp; Returns</button>
            </span>
          </div>
        </div>
      </footer>

      {/* =========================================
          SLIDE-IN SAREE SHORTLIST & WHATSAPP ENQUIRY DRAWER
          (Replaces shopping cart / checkout — zero online payment)
          ========================================= */}
      {isShortlistOpen && (
        <div className="cart-backdrop-dim" onClick={() => setIsShortlistOpen(false)}>
          <div className="cart-sidebar-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-panel-head">
              <h4>Shortlisted Sarees ({shortlistedItems.length})</h4>
              <button className="btn-close-cart" onClick={() => setIsShortlistOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-items-list">
              {shortlistedItems.length === 0 ? (
                <div className="empty-cart-state">
                  <Heart size={44} color="#c29b38" strokeWidth={1.2} />
                  <p>No sarees shortlisted yet. Browse our collections and tap the heart or Enquire button on any saree.</p>
                </div>
              ) : (
                shortlistedItems.map((item, index) => (
                  <div key={index} className="cart-line-item">
                    <img
                      src={item.image || item.modelImage}
                      alt={item.name || item.title}
                      onClick={() => {
                        setIsShortlistOpen(false);
                        openProductDetail(item);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="line-item-meta">
                      <h6>{item.name || item.title}</h6>
                      <p>Code: {item.code || 'VV-101'} • {item.fabric || 'Handloom Silk'}</p>
                      <button
                        type="button"
                        className="vv-shortlist-wa-btn"
                        onClick={() => {
                          setIsShortlistOpen(false);
                          openWhatsAppEnquiry(item);
                        }}
                      >
                        <MessageCircle size={12} /> Enquire on WhatsApp
                      </button>
                    </div>
                    <button
                      className="btn-remove-line"
                      onClick={() =>
                        setShortlistedItems(shortlistedItems.filter((_, i) => i !== index))
                      }
                      aria-label="Remove from shortlist"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-panel-checkout">
              <button
                type="button"
                className="vv-btn-whatsapp-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setIsShortlistOpen(false);
                  openWhatsAppEnquiry(shortlistedItems[0] || null);
                }}
              >
                <MessageCircle size={17} />
                <span>Enquire on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <Suspense fallback={null}>
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEnquireWhatsApp={(prod) => {
              setSelectedProduct(null);
              openWhatsAppEnquiry(prod);
            }}
            onOpenLightbox={(items, idx) => setLightboxState({ items, index: idx })}
            onSelectRelated={(rel) => openProductDetail(rel)}
            wishlist={wishlist}
            onToggleWishlist={(title) => toggleWishlist(title, selectedProduct)}
          />
        </Suspense>
      )}

      {/* WHATSAPP ENQUIRY MODAL */}
      <WhatsAppEnquiryModal
        isOpen={waEnquiryProduct !== undefined}
        onClose={() => setWaEnquiryProduct(undefined)}
        product={waEnquiryProduct}
        defaultSize={selectedBlouseSize}
      />

      {/* FULLSCREEN IMAGE ZOOM LIGHTBOX */}
      <LightboxViewer
        items={lightboxState.items}
        activeIndex={lightboxState.index}
        onClose={() => setLightboxState({ items: [], index: -1 })}
        onNavigate={(nextIdx) => setLightboxState((s) => ({ ...s, index: nextIdx }))}
        onEnquire={(item) => {
          setLightboxState({ items: [], index: -1 });
          openWhatsAppEnquiry(item);
        }}
      />

      {/* POLICY VIEWER MODAL */}
      <PolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      {/* FLOATING WHATSAPP CONCIERGE BUTTON */}
      <button
        type="button"
        className="vv-floating-whatsapp-fab"
        onClick={() => openWhatsAppEnquiry(null)}
        title="Enquire on WhatsApp — Virasat Vastra"
        aria-label="Enquire on WhatsApp"
      >
        <MessageCircle size={20} />
        <span>WhatsApp Enquiry</span>
      </button>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="drift-toast-alert">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
