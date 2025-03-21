
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  condition: string;
  price: number;
  acquisitionDate: Date;
  categoryId: string;
  categoryName?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  name: string;
  type: 'time' | 'category';
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  createdAt: Date;
}

export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';
