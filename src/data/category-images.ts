export interface CategoryImage {
  src: string;
  alt: string;
}

export const categoryImages: Record<string, CategoryImage> = {
  face: {
    src: "/images/categories/face.jpg",
    alt: "Face Care — Cleansers, moisturisers and daily skin essentials",
  },
  body: {
    src: "/images/categories/body.jpg",
    alt: "Body Care — Everyday cleansing, softness and body routines",
  },
  hair: {
    src: "/images/categories/hair.jpg",
    alt: "Hair Care — Scalp care, shampoos and glossy lengths",
  },
  underarm: {
    src: "/images/categories/underarm.jpg",
    alt: "Underarm Care — Gentle roll-ons and fresh daily routines",
  },
  wellness: {
    src: "/images/categories/wellness.jpg",
    alt: "Health & Wellness — Daily gummies and vitality essentials",
  },
  tools: {
    src: "/images/categories/tools.jpg",
    alt: "Care Tools — Facial massage and self-care grooming accessories",
  },
  acne: {
    src: "/images/categories/acne.jpg",
    alt: "Acne Care — Targeted options for blemishes and body breakouts",
  },
  hydration: {
    src: "/images/categories/hydration.jpg",
    alt: "Hydration — Replenishing care for dry and dehydrated skin",
  },
  all: {
    src: "/images/categories/all.jpg",
    alt: "All Products — Comprehensive Be Bodywise personal care collection",
  },
};

export function getCategoryImage(categoryId: string): CategoryImage | undefined {
  return categoryImages[categoryId];
}
