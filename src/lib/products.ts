export type Product = {
  id: number;
  name: string;
  tags: string[];
  type: string;
  price: string;
  ingredients?: string[];
  recommendedFor?: string[];
  suitableAges?: string[];
};

export const PRODUCTS: Product[] = [
  { id: 1, name: "Cloud Dew Serum", tags: ["수분", "진정"], type: "진정 세럼", price: "₩29,000", ingredients: ["향료"], recommendedFor: ["민감성","건성"], suitableAges: ['20-29','30-39'] },
  { id: 2, name: "Velvet Barrier Cream", tags: ["보습", "장벽"], type: "보습 크림", price: "₩34,000", ingredients: ["글리세린"], recommendedFor: ["건성"], suitableAges: ['30-39','40+'] },
  { id: 3, name: "Fresh Glow Sun Shield", tags: ["자외선", "가벼움"], type: "선크림", price: "₩27,000", ingredients: ["옥시벤존"], recommendedFor: ["복합성","지성"], suitableAges: ['10-19','20-29'] },
  { id: 4, name: "Pore Clear Toner", tags: ["모공", "피지"], type: "토너", price: "₩18,000", ingredients: ["알콜"], recommendedFor: ["지성"], suitableAges: ['20-29','30-39'] },
  { id: 5, name: "Soothing Mask Pack", tags: ["진정", "수분"], type: "마스크", price: "₩9,900", ingredients: ["알로에"], recommendedFor: ["민감성","건성"], suitableAges: ['10-19','20-29','30-39'] },
];
