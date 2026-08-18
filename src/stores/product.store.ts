import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.types';
import { createResourceStore } from './factory';

interface ProductExtras {
  featured: Product[];
  fetchFeatured: () => Promise<void>;
}

export const useProductStore = createResourceStore<Product, ProductExtras>(
  'products',
  productService,
  (set) => ({
    featured: [],
    fetchFeatured: async () => {
      set({ featured: await productService.getFeatured() });
    },
  }),
);
