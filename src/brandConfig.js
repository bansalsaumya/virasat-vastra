// ============================================================================
// VIRASAT VASTRA — CENTRAL BRAND & WHATSAPP ENQUIRY CONFIGURATION
// Replace the clearly marked placeholders below with your actual business details.
// ============================================================================

export const BRAND_CONFIG = {
  brandName: 'VIRASAT VASTRA',
  tagline: 'Sarees Woven With Culture',
  subTagline: 'Threads of Royal Heritage',

  // --------------------------------------------------------------------------
  // WHATSAPP BUSINESS NUMBER (Configurable Placeholder)
  // Enter digits with country code (e.g. "919876543210") when ready.
  // Kept as a clearly identifiable placeholder so no phone number is invented.
  // --------------------------------------------------------------------------
  whatsappNumber: 'YOUR_WHATSAPP_NUMBER_HERE',
  whatsappDisplayPlaceholder: '[Set WhatsApp Number in src/brandConfig.js]',

  // --------------------------------------------------------------------------
  // BUSINESS CONTACT PLACEHOLDERS (Do not invent contact details)
  // --------------------------------------------------------------------------
  contactPhoneDisplay: '[Configure Business Phone in src/brandConfig.js]',
  contactEmail: '[Configure Business Email in src/brandConfig.js]',
  businessAddress: '[Configure Showroom / Atelier Address in src/brandConfig.js]',
  businessHours: '[Configure Visiting Hours in src/brandConfig.js]',

  // Optional Google Maps Embed URL (Paste your Google Maps iframe src URL here)
  googleMapsEmbedUrl: '',

  // Social Media Links (Configurable Placeholders)
  instagramHandle: '@virasatvastra',
  instagramUrl: 'https://www.instagram.com/',

  // Toggle whether sample catalogue prices are displayed on cards & detail pages
  showPrices: true,
  sampleContentNotice: 'Sample Catalogue Showcase — Replace sample items & prices in src/data.js',

  // Genuine customer testimonials array (kept empty by default so no fake reviews are invented;
  // add verified customer quotes here as they are collected)
  genuineTestimonials: []
};

/**
 * Checks whether the merchant has replaced the placeholder with a real numeric WhatsApp number.
 */
export function hasConfiguredWhatsAppNumber() {
  const cleaned = (BRAND_CONFIG.whatsappNumber || '').replace(/\D/g, '');
  return cleaned.length >= 10;
}

/**
 * Builds a pre-filled WhatsApp enquiry message and URL for any saree or general enquiry.
 */
export function buildWhatsAppEnquiryData(product = null, options = {}) {
  const {
    selectedSize = '',
    selectedColor = '',
    topics = ['Availability', 'Color Options', 'Fabric & Zari Details', 'Pricing'],
    customNote = ''
  } = options;

  let messageLines = [];

  if (product) {
    const prodName = product.name || product.title || 'Virasat Vastra Saree';
    const prodCode = product.code || product.sku || `VV-${String(product.id || '01').toUpperCase()}`;
    const prodCategory = product.category || 'Royal Saree Collection';
    const prodFabric = product.fabric || 'Handloom Silk';
    const prodColor = selectedColor || product.color || 'As Shown';

    messageLines = [
      `Namaste ${BRAND_CONFIG.brandName}! 🙏`,
      ``,
      `I would like to enquire about the following saree:`,
      `• *Saree Name:* ${prodName}`,
      `• *Product Code (SKU):* ${prodCode}`,
      `• *Category:* ${prodCategory}`,
      `• *Fabric:* ${prodFabric}`,
      `• *Colour:* ${prodColor}`,
      ...(selectedSize ? [`• *Blouse Size Preference:* ${selectedSize}`] : []),
      ``,
      `Please share details regarding: ${topics.join(', ')}.`,
      ...(customNote ? [`Note: ${customNote}`] : [])
    ];
  } else {
    messageLines = [
      `Namaste ${BRAND_CONFIG.brandName}! 🙏`,
      ``,
      `I am browsing your *${BRAND_CONFIG.tagline}* website and would like to enquire about your saree collections, availability, and private styling assistance.`,
      ...(customNote ? [``, `Enquiry Details: ${customNote}`] : [])
    ];
  }

  const messageText = messageLines.join('\n');
  const encodedText = encodeURIComponent(messageText);
  const cleanedNumber = (BRAND_CONFIG.whatsappNumber || '').replace(/\D/g, '');

  const url =
    cleanedNumber.length >= 10
      ? `https://wa.me/${cleanedNumber}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

  return {
    messageText,
    url,
    isPlaceholderNumber: cleanedNumber.length < 10
  };
}

