export interface ProductData {
  _id: string;
  name: string;
  slug: string;
  title: string;
  seoDescription: string;
  keywords: string;
  description: string;
  bannerImage: string;
  features: string[];
  applications: string[];
}

export const staticProducts: Record<string, ProductData> = {
  "cello-tape": {
    _id: "prod_1",
    name: "Cello Tape",
    slug: "cello-tape",
    title: "Premium Cello Tape & BOPP Packing Tapes | Omkar MFG Traders",
    seoDescription: "Buy high-quality, durable clear and brown Cello Tapes for industrial and commercial packaging. Omkar MFG Traders offers the best BOPP tapes with strong adhesion.",
    keywords: "cello tape, bopp tape, packing tape, transparent tape, brown tape, packaging tape, industrial tape",
    description: "Our premium Cello Tapes (BOPP Tapes) are engineered for maximum adhesion and durability. Perfect for sealing cartons, bundling items, and general-purpose packaging, these tapes ensure your goods remain secure during transit. Available in both transparent and brown variants, our tapes are resistant to temperature changes and rough handling, making them the ideal choice for e-commerce, logistics, and industrial applications.",
    bannerImage: "/images/products/cello_tape_banner_1788331217793.jpg",
    features: [
      "High tensile strength and excellent adhesion",
      "Resistant to varying temperatures and moisture",
      "Available in multiple widths and lengths",
      "Smooth release for fast application",
      "Ideal for all types of corrugated boxes"
    ],
    applications: [
      "E-commerce packaging and shipping",
      "Logistics and supply chain",
      "Office and commercial use",
      "Industrial carton sealing"
    ]
  },
  "printed-tape": {
    _id: "prod_2",
    name: "Printed Tape",
    slug: "printed-tape",
    title: "Custom Printed Packaging Tapes | Logo & Warning Tapes",
    seoDescription: "Secure your packages and promote your brand with custom printed tapes. High-quality BOPP printed tapes with logos and warning messages from Omkar MFG Traders.",
    keywords: "printed tape, custom packing tape, logo tape, fragile tape, branded packaging tape",
    description: "Elevate your brand presence and secure your shipments simultaneously with our Custom Printed Tapes. These high-quality BOPP tapes can be printed with your company logo, contact details, or specific warning messages (like 'Fragile' or 'Handle with Care'). Not only do they serve as an excellent marketing tool, but they also act as a tamper-evident seal, adding an extra layer of security to your valuable packages.",
    bannerImage: "/images/products/printed_tape_banner_1788331233893.jpg",
    features: [
      "Customizable with company logos and text",
      "High-resolution, fade-resistant printing",
      "Strong adhesive backing for secure sealing",
      "Acts as a tamper-evident security measure",
      "Enhances brand visibility on every shipment"
    ],
    applications: [
      "Branded e-commerce deliveries",
      "Security sealing for high-value goods",
      "Instructional packaging (e.g., 'Fragile')",
      "Retail and wholesale distribution"
    ]
  },
  "stretch-film": {
    _id: "prod_3",
    name: "Stretch Film",
    slug: "stretch-film",
    title: "Industrial Stretch Film & Pallet Wrap | Omkar MFG Traders",
    seoDescription: "Protect your pallet loads with our high-stretch, tear-resistant stretch films. Best quality industrial packaging wrap for logistics and warehousing.",
    keywords: "stretch film, pallet wrap, shrink wrap, industrial stretch wrap, packaging film",
    description: "Our Industrial Stretch Film is the ultimate solution for securing pallet loads and protecting goods from dust, moisture, and transit damage. Manufactured using high-quality LLDPE resins, our stretch films offer exceptional puncture resistance, high clarity, and superior load-retaining force. Whether you are using manual hand dispensers or automated wrapping machines, our films provide maximum yield and reliable performance.",
    bannerImage: "/images/products/stretch_film_banner_1788331247621.jpg",
    features: [
      "Exceptional stretchability and tear resistance",
      "Excellent clarity for barcode scanning",
      "Strong cling property for secure wrapping",
      "Protects against dust, moisture, and tampering",
      "Available for both hand and machine application"
    ],
    applications: [
      "Pallet wrapping and load stabilization",
      "Furniture and large item protection",
      "Warehouse storage and logistics",
      "Export shipments"
    ]
  },
  "bubble-roll": {
    _id: "prod_4",
    name: "Bubble Roll",
    slug: "bubble-roll",
    title: "Air Bubble Wrap Rolls for Packaging | Protective Cushioning",
    seoDescription: "Ensure maximum protection for fragile items with our premium air bubble rolls. Lightweight, shock-absorbing bubble wrap for safe transit.",
    keywords: "bubble roll, bubble wrap, protective packaging, air bubble packing, cushioning material",
    description: "Keep your fragile and delicate items safe during shipping with our premium Air Bubble Rolls. Designed to provide superior cushioning and shock absorption, our bubble wrap effectively protects goods from impact, vibration, and surface scratches. Lightweight and flexible, it conforms easily to items of any shape, reducing shipping costs while maximizing protection.",
    bannerImage: "/images/products/bubble_roll_banner_1788331262152.jpg",
    features: [
      "Excellent shock absorption and cushioning",
      "Lightweight material reduces shipping costs",
      "Flexible and easy to wrap around odd shapes",
      "Reusable and environmentally friendly options",
      "Available in various bubble sizes and roll widths"
    ],
    applications: [
      "Packing electronics and fragile items",
      "Glassware and ceramics protection",
      "Surface protection for furniture",
      "E-commerce safe shipping"
    ]
  },
  "paper-roll": {
    _id: "prod_5",
    name: "Paper Roll",
    slug: "paper-roll",
    title: "Kraft Paper Rolls for Packaging | Eco-Friendly Wrapping",
    seoDescription: "Eco-friendly Kraft Paper Rolls for versatile packaging, void filling, and wrapping. High-strength industrial paper rolls by Omkar MFG Traders.",
    keywords: "paper roll, kraft paper, packaging paper, void fill paper, eco-friendly packaging",
    description: "Our Kraft Paper Rolls offer a versatile, eco-friendly, and cost-effective packaging solution. Known for its high tensile strength and tear resistance, kraft paper is ideal for wrapping products, void filling in cartons, and interleaving between items. 100% recyclable and biodegradable, it is the perfect choice for businesses looking to reduce their environmental footprint without compromising on packaging quality.",
    bannerImage: "/images/products/paper_roll_banner_1788331288674.jpg",
    features: [
      "100% eco-friendly, recyclable, and biodegradable",
      "High tear resistance and durability",
      "Excellent for void filling and cushioning",
      "Provides a clean, professional aesthetic",
      "Available in various GSM (thickness) options"
    ],
    applications: [
      "Eco-friendly e-commerce packaging",
      "Void filling for shipping boxes",
      "Wrapping for industrial parts",
      "Art, craft, and surface protection"
    ]
  },
  "corrugated-sheets": {
    _id: "prod_6",
    name: "Corrugated Sheets",
    slug: "corrugated-sheets",
    title: "Heavy-Duty Corrugated Sheets & Layer Pads",
    seoDescription: "Strong and durable corrugated cardboard sheets for structural support, layer padding, and custom packaging needs.",
    keywords: "corrugated sheets, cardboard sheets, layer pads, packaging boards, corrugated boards",
    description: "Our Heavy-Duty Corrugated Sheets provide essential structural support and protection for your packaging needs. Used primarily as layer pads to disperse weight and prevent damage between stacked items, these sheets are also ideal for creating custom-sized boxes or protective dividers. Manufactured with premium kraft paper, they offer excellent rigidity and edge crush resistance.",
    bannerImage: "/images/products/corrugated_sheets_banner_1788331300621.jpg",
    features: [
      "High rigidity and structural strength",
      "Excellent edge crush and burst resistance",
      "Customizable to any dimension",
      "Lightweight yet highly protective",
      "100% recyclable material"
    ],
    applications: [
      "Layer padding for palletized goods",
      "Creating custom packaging dividers",
      "Floor and surface protection during transit",
      "Base support for heavy items"
    ]
  },
  "corrugated-boxes": {
    _id: "prod_7",
    name: "Corrugated Boxes",
    slug: "corrugated-boxes",
    title: "Custom & Standard Corrugated Boxes for Shipping",
    seoDescription: "Durable multi-ply corrugated boxes for safe shipping and storage. Available in standard and custom sizes for all your packaging requirements.",
    keywords: "corrugated boxes, shipping boxes, carton boxes, packaging boxes, moving boxes",
    description: "Ensure the safe transit of your products with our robust Corrugated Boxes. Available in 3-ply, 5-ply, and 7-ply configurations, our boxes are designed to withstand the rigors of the supply chain. From small e-commerce mailers to large heavy-duty industrial cartons, we provide standard and custom-sized boxes tailored to your specific product weight and dimension requirements.",
    bannerImage: "/images/products/corrugated_boxes_banner_1788331314120.jpg",
    features: [
      "Available in 3-ply, 5-ply, and 7-ply strengths",
      "High burst factor and compression strength",
      "Customizable dimensions and printing",
      "Easy to assemble and securely stackable",
      "Made from sustainable, recyclable materials"
    ],
    applications: [
      "E-commerce order fulfillment",
      "Industrial goods transportation",
      "Retail and FMCG packaging",
      "Moving and storage"
    ]
  }
};
