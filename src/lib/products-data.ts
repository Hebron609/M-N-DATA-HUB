// M&L Data product catalog
export type Product = {
  id: string;
  name: string;
  category: string;
  network: string;
  sku: string;
  image: string;
  badge?: string;
  stock?: "in" | "out";
  sizes: string[];
  prices: Record<string, string>;
  description: string;
  additionalInfo: string;
  notices: string[];
  relatedProducts: string[];
};

export const products: Product[] = [
  {
    id: "mtn1",
    name: "MTN Bundle",
    category: "MTN",
    network: "MTN",
    sku: "MTN001",
    image: "/images/mtn.webp",
    badge: "Hot",
    stock: "in",
    sizes: [
      "1GB", "2GB", "3GB", "4GB", "5GB", "6GB", "7GB", "8GB",
      "10GB", "15GB", "20GB", "25GB", "30GB", "40GB", "50GB", "100GB",
    ],
    prices: {
      "1GB": "₵4.65",
      "2GB": "₵9.30",
      "3GB": "₵13.50",
      "4GB": "₵18.50",
      "5GB": "₵23.80",
      "6GB": "₵26.80",
      "7GB": "₵30.00",
      "8GB": "₵37.20",
      "10GB": "₵46.00",
      "15GB": "₵66.40",
      "20GB": "₵84.98",
      "25GB": "₵109.00",
      "30GB": "₵137.00",
      "40GB": "₵169.00",
      "50GB": "₵204.00",
      "100GB": "₵400.00",
    },
    description: `Our DATA REQUEST DOESN'T support the following:
- Turbonet SIM
- Merchant SIM
- EVD SIM
- Broadband SIM
- Blacklisted SIM
- Roaming SIM
- Different Network
- Wrong Number
- Inactive Number

Any data transferred to the above SIMs gets burned and cannot be reversed. Client pays for the loss.`,
    additionalInfo: "Browse seamlessly with our affordable MTN data offers.",
    notices: ["❗❗❗❗❗Delivery time is between 20min to 4hrs"],
    relatedProducts: ["airteltigo1", "telecel1"],
  },
  {
    id: "airteltigo1",
    name: "AirtelTigo iShare",
    category: "AirtelTigo",
    network: "AirtelTigo",
    sku: "AT001",
    image: "/images/airteltigo.webp",
    stock: "in",
    sizes: [
      "1GB", "2GB", "3GB", "4GB", "5GB",
      "10GB", "15GB", "20GB", "25GB", "30GB",
    ],
    prices: {
      "1GB": "₵4.20",
      "2GB": "₵8.50",
      "3GB": "₵13.00",
      "4GB": "₵17.50",
      "5GB": "₵22.00",
      "6GB": "₵26.50",
      "7GB": "₵31.00",
      "8GB": "₵35.50",
      "10GB": "₵43.00",
      "15GB": "₵64.00",
      "20GB": "₵83.00",
      "25GB": "₵104.00",
      "30GB": "₵125.00",
    },
    description: "Instant Delivery — iShare data delivered immediately to recipient.",
    additionalInfo: "Browse seamlessly with our affordable AirtelTigo offers.",
    notices: ["❗❗❗❗❗iShare delivery is instant.❗❗❗❗❗"],
    relatedProducts: ["mtn1", "telecel1"],
  },
  {
    id: "telecel1",
    name: "Telecel Non-Expiry",
    category: "Telecel",
    network: "Telecel",
    sku: "T001",
    image: "/images/telecel.webp",
    stock: "in",
    sizes: [
      "10GB", "15GB", "20GB", "25GB", "30GB",
      "35GB", "40GB", "45GB", "50GB", "100GB",
    ],
    prices: {
      "10GB": "₵42.00",
      "15GB": "₵63.00",
      "20GB": "₵84.00",
      "25GB": "₵105.00",
      "30GB": "₵126.00",
      "35GB": "₵148.00",
      "40GB": "₵168.00",
      "45GB": "₵188.00",
      "50GB": "₵210.00",
      "100GB": "₵415.00",
    },
    description: "Telecel data that never expires — use it at your own pace.",
    additionalInfo: "Browse seamlessly with our affordable Telecel offers.",
    notices: ["Ensure SIM is active before purchasing."],
    relatedProducts: ["mtn1", "airteltigo1"],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const getPriceRange = (product: Product) => {
  const vals = Object.values(product.prices).map((p) =>
    parseFloat(p.replace(/[^0-9.]/g, ""))
  );
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return `₵${min.toFixed(2)} - ₵${max.toFixed(2)}`;
};
