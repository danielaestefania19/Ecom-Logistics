// Single source of truth for the public /pricing page.
//
// Prices mirror the official Ecom Logistics price list (PDF). Per-unit
// "tiered" sections get automatic volume discounts off the list price,
// following the same unit minimums used across the industry:
//   1 – 500 units    → list price
//   501 – 1,499      → 10% off
//   1,500+ units     → 15% off
//
// Discounts are derived at render time from the list price (see money()),
// so changing a list price here updates every tier automatically. Values are
// floored to the cent so the displayed discount is always AT LEAST the
// advertised percentage (never less). Labels are bilingual; the page picks
// EN/ES from LanguageContext.

// Floor to the cent → guarantees the shown price honors the stated discount.
export const money = (n) => `$${(Math.floor(n * 100) / 100).toFixed(2)}`;

// Volume tiers applied to every "tiered" section.
export const VOLUME_TIERS = {
  en: [
    { label: "1 – 500 units", badge: "List price", discount: 0 },
    { label: "501 – 1,499 units", badge: "10% off", discount: 0.1 },
    { label: "1,500+ units", badge: "15% off", discount: 0.15 },
  ],
  es: [
    { label: "1 – 500 unidades", badge: "Precio de lista", discount: 0 },
    { label: "501 – 1,499 unidades", badge: "10% desc.", discount: 0.1 },
    { label: "1,500+ unidades", badge: "15% desc.", discount: 0.15 },
  ],
};

// Helper for non-tiered (flat) prices that carry a suffix like "/box".
const flat = (price, suffix = {}) => ({ price, suffix });

export const pricingSections = [
  {
    id: "fba-prep",
    tiered: true,
    icon: "box",
    title: { en: "FBA Prep", es: "Preparación FBA" },
    subtitle: {
      en: "Per-unit prep with volume discounts. Materials billed separately below.",
      es: "Preparación por unidad con descuentos por volumen. Materiales se facturan aparte (abajo).",
    },
    unit: { en: "/unit", es: "/unidad" },
    rows: [
      {
        label: {
          en: "Basic Prep – Standard (Single FNSKU)",
          es: "Prep Básico – Estándar (FNSKU único)",
        },
        price: 0.7,
      },
      {
        label: {
          en: "Basic Prep – Oversize (Single FNSKU)",
          es: "Prep Básico – Oversize (FNSKU único)",
        },
        price: 1.3,
      },
      {
        label: {
          en: "Basic Prep + Polybag (Standard)",
          es: "Prep Básico + Polybag (Estándar)",
        },
        price: 0.95,
      },
      {
        label: {
          en: "Basic Prep + Bubble Wrap (Max 12 in)",
          es: "Prep Básico + Burbuja (Máx 12 in)",
        },
        price: 1.5,
      },
      {
        label: {
          en: "Bundle (Up to 5 Units / Bundle)",
          es: "Bundle (Hasta 5 Unidades / Bundle)",
        },
        price: 1.4,
      },
    ],
  },
  {
    id: "pick-pack",
    tiered: true,
    icon: "truck",
    title: { en: "3PL Pick & Pack", es: "3PL Pick & Pack" },
    subtitle: {
      en: "Per-order fulfillment — packaging materials included.",
      es: "Fulfillment por pedido — materiales de empaque incluidos.",
    },
    unit: { en: "/order", es: "/pedido" },
    rows: [
      {
        label: { en: "Small – Medium Box", es: "Caja Pequeña – Mediana" },
        price: 2.5,
      },
      { label: { en: "Large Box", es: "Caja Grande" }, price: 3.5 },
      { label: { en: "Bubble Mailer", es: "Sobre Burbuja" }, price: 1.8 },
      { label: { en: "Poly Mailer", es: "Sobre Poly" }, price: 1.6 },
    ],
  },
  {
    id: "storage",
    tiered: false,
    icon: "warehouse",
    title: { en: "Storage", es: "Almacenamiento" },
    subtitle: {
      en: "First 7 days free. Monthly, no long-term contract.",
      es: "Primeros 7 días gratis. Mensual, sin contrato a largo plazo.",
    },
    rows: [
      {
        label: { en: "Bin (monthly)", es: "Bin (mensual)" },
        ...flat(10, { en: "/mo", es: "/mes" }),
      },
      {
        label: { en: "Shelf (monthly)", es: "Estante (mensual)" },
        ...flat(20, { en: "/mo", es: "/mes" }),
      },
      {
        label: { en: "Pallet (monthly)", es: "Pallet (mensual)" },
        ...flat(45, { en: "/mo", es: "/mes" }),
      },
    ],
  },
  {
    id: "receiving",
    tiered: false,
    icon: "inbound",
    title: { en: "Receiving & Unloading", es: "Recepción y Descarga" },
    subtitle: {
      en: "Inbound handling for cases, pallets and full containers.",
      es: "Manejo de entrada para cajas, pallets y contenedores completos.",
    },
    rows: [
      {
        label: { en: "Case Receiving Fee", es: "Recepción por Caja" },
        ...flat(3),
      },
      {
        label: {
          en: "Pallet Receiving & Outbound",
          es: "Recepción y Salida por Pallet",
        },
        ...flat(15),
      },
      {
        label: { en: "Container Unload — 20 ft", es: "Descarga Contenedor — 20 ft" },
        ...flat(300),
      },
      {
        label: {
          en: "Container Unload — 40–53 ft",
          es: "Descarga Contenedor — 40–53 ft",
        },
        ...flat(550),
      },
      {
        label: { en: "Hourly Work", es: "Trabajo por Hora" },
        ...flat(40, { en: "/hr", es: "/hr" }),
      },
    ],
  },
  {
    id: "materials",
    tiered: false,
    icon: "box",
    title: { en: "Materials & Supplies", es: "Materiales e Insumos" },
    subtitle: {
      en: "Boxes and palletizing, billed only when used.",
      es: "Cajas y paletizado, se cobran solo cuando se usan.",
    },
    rows: [
      {
        label: { en: "Small Master Box", es: "Master Box Pequeña" },
        ...flat(2.5, { en: "/box", es: "/caja" }),
      },
      {
        label: { en: "Medium Master Box", es: "Master Box Mediana" },
        ...flat(3.5, { en: "/box", es: "/caja" }),
      },
      {
        label: { en: "Large Master Box", es: "Master Box Grande" },
        ...flat(4, { en: "/box", es: "/caja" }),
      },
      {
        label: { en: "Standard Pallet (40x48)", es: "Pallet Estándar (40x48)" },
        ...flat(20),
      },
      {
        label: { en: "Pallet Wrapping", es: "Emplayado de Pallet" },
        ...flat(20, { en: "/pallet", es: "/pallet" }),
      },
    ],
  },
  {
    id: "add-ons",
    tiered: false,
    icon: "plus",
    title: { en: "Additional Services", es: "Servicios Adicionales" },
    subtitle: {
      en: "Optional value-adds for your e-commerce operation.",
      es: "Complementos opcionales para tu operación de e-commerce.",
    },
    rows: [
      {
        label: { en: "Promotional Coupon Insert", es: "Inserto de Cupón Promocional" },
        ...flat(0.5, { en: "/unit", es: "/unidad" }),
      },
      {
        label: { en: "Filler / Dunnage", es: "Relleno / Filler" },
        ...flat(0.5, { en: "/unit", es: "/unidad" }),
      },
      {
        label: { en: "Account / Database Setup", es: "Configuración de Cuenta / Base de Datos" },
        ...flat(400, { en: " one-time", es: " único" }),
      },
      {
        label: { en: "Personalized Box", es: "Caja Personalizada" },
        price: { en: "Contact Sales", es: "Consultar" },
      },
      {
        label: { en: "Returns Management", es: "Gestión de Devoluciones" },
        price: { en: "Contact Sales", es: "Consultar" },
      },
    ],
  },
];

// Shown as a compact strip near the bottom.
export const paymentFees = {
  title: { en: "Payment Processing", es: "Procesamiento de Pago" },
  rows: [
    { label: { en: "ACH Payment", es: "Pago ACH" }, price: "0.8%" },
    { label: { en: "Credit Card", es: "Tarjeta de Crédito" }, price: "3.5%" },
  ],
};
