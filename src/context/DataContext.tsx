
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Category, CollectionItem, WishlistItem, Report } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface DataContextProps {
  categories: Category[];
  collectionItems: CollectionItem[];
  wishlistItems: WishlistItem[];
  reports: Report[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCollectionItem: (item: Omit<CollectionItem, 'id' | 'createdAt'>) => void;
  updateCollectionItem: (id: string, item: Partial<CollectionItem>) => void;
  deleteCollectionItem: (id: string) => void;
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => void;
  updateWishlistItem: (id: string, item: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;
  addReport: (report: Omit<Report, 'id' | 'createdAt'>) => void;
  deleteReport: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCollectionItemById: (id: string) => CollectionItem | undefined;
  getWishlistItemById: (id: string) => WishlistItem | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (user) {
      // Load user data from localStorage when user signs in
      loadData();
    } else {
      // Clear data when user signs out
      setCategories([]);
      setCollectionItems([]);
      setWishlistItems([]);
      setReports([]);
    }
    setIsLoading(false);
  }, [user]);

  // Load data from localStorage
  const loadData = () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const storedCategories = localStorage.getItem(`${userId}_categories`);
      const storedItems = localStorage.getItem(`${userId}_items`);
      const storedWishlist = localStorage.getItem(`${userId}_wishlist`);
      const storedReports = localStorage.getItem(`${userId}_reports`);

      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedItems) setCollectionItems(JSON.parse(storedItems));
      if (storedWishlist) setWishlistItems(JSON.parse(storedWishlist));
      if (storedReports) setReports(JSON.parse(storedReports));

      // Set initial sample data if none exists
      if (!storedCategories) {
        const sampleCategories: Category[] = [
          { id: '1', name: 'Books', description: 'Literary collections', createdAt: new Date() },
          { id: '2', name: 'Coins', description: 'Numismatic collection', createdAt: new Date() },
        ];
        setCategories(sampleCategories);
        saveToStorage(`${userId}_categories`, sampleCategories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'There was a problem loading your collection data.',
        variant: 'destructive',
      });
    }
  };

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
    if (!user) return;
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    if (user) {
      saveToStorage(`${user.id}_categories`, updatedCategories);
    }
    
    toast({
      title: 'Category added',
      description: `"${category.name}" has been added to your categories.`,
    });
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, ...category } : cat
    );
    
    setCategories(updatedCategories);
    
    if (user) {
      saveToStorage(`${user.id}_categories`, updatedCategories);
    }
    
    // Update category names in collection items
    if (category.name) {
      const updatedItems = collectionItems.map(item => 
        item.categoryId === id ? { ...item, categoryName: category.name } : item
      );
      setCollectionItems(updatedItems);
      
      if (user) {
        saveToStorage(`${user.id}_items`, updatedItems);
      }
      
      // Update category names in wishlist items
      const updatedWishlist = wishlistItems.map(item => 
        item.categoryId === id ? { ...item, categoryName: category.name } : item
      );
      setWishlistItems(updatedWishlist);
      
      if (user) {
        saveToStorage(`${user.id}_wishlist`, updatedWishlist);
      }
    }
    
    toast({
      title: 'Category updated',
      description: `The category has been updated successfully.`,
    });
  };

  const deleteCategory = (id: string) => {
    // Check if there are items using this category
    const hasItems = collectionItems.some(item => item.categoryId === id);
    const hasWishlistItems = wishlistItems.some(item => item.categoryId === id);
    
    if (hasItems || hasWishlistItems) {
      toast({
        title: 'Cannot delete category',
        description: 'This category is in use by one or more items in your collection or wishlist.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    
    if (user) {
      saveToStorage(`${user.id}_categories`, updatedCategories);
    }
    
    toast({
      title: 'Category deleted',
      description: 'The category has been deleted successfully.',
    });
  };

  // Collection Items
  const addCollectionItem = (item: Omit<CollectionItem, 'id' | 'createdAt'>) => {
    const category = categories.find(cat => cat.id === item.categoryId);
    
    const newItem: CollectionItem = {
      ...item,
      id: generateId(),
      categoryName: category?.name,
      createdAt: new Date(),
    };
    
    const updatedItems = [...collectionItems, newItem];
    setCollectionItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_items`, updatedItems);
    }
    
    toast({
      title: 'Item added',
      description: `"${item.name}" has been added to your collection.`,
    });
  };

  const updateCollectionItem = (id: string, item: Partial<CollectionItem>) => {
    // If categoryId is being updated, get the category name
    let categoryName;
    if (item.categoryId) {
      const category = categories.find(cat => cat.id === item.categoryId);
      categoryName = category?.name;
    }
    
    const updatedItems = collectionItems.map(collectionItem => 
      collectionItem.id === id ? { 
        ...collectionItem, 
        ...item,
        ...(categoryName ? { categoryName } : {})
      } : collectionItem
    );
    
    setCollectionItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_items`, updatedItems);
    }
    
    toast({
      title: 'Item updated',
      description: 'The item has been updated successfully.',
    });
  };

  const deleteCollectionItem = (id: string) => {
    const updatedItems = collectionItems.filter(item => item.id !== id);
    setCollectionItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_items`, updatedItems);
    }
    
    toast({
      title: 'Item deleted',
      description: 'The item has been deleted from your collection.',
    });
  };

  // Wishlist Items
  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    const category = categories.find(cat => cat.id === item.categoryId);
    
    const newItem: WishlistItem = {
      ...item,
      id: generateId(),
      categoryName: category?.name,
      createdAt: new Date(),
    };
    
    const updatedItems = [...wishlistItems, newItem];
    setWishlistItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_wishlist`, updatedItems);
    }
    
    toast({
      title: 'Wishlist item added',
      description: `"${item.name}" has been added to your wishlist.`,
    });
  };

  const updateWishlistItem = (id: string, item: Partial<WishlistItem>) => {
    // If categoryId is being updated, get the category name
    let categoryName;
    if (item.categoryId) {
      const category = categories.find(cat => cat.id === item.categoryId);
      categoryName = category?.name;
    }
    
    const updatedItems = wishlistItems.map(wishlistItem => 
      wishlistItem.id === id ? { 
        ...wishlistItem, 
        ...item,
        ...(categoryName ? { categoryName } : {})
      } : wishlistItem
    );
    
    setWishlistItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_wishlist`, updatedItems);
    }
    
    toast({
      title: 'Wishlist item updated',
      description: 'The wishlist item has been updated successfully.',
    });
  };

  const deleteWishlistItem = (id: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedItems);
    
    if (user) {
      saveToStorage(`${user.id}_wishlist`, updatedItems);
    }
    
    toast({
      title: 'Wishlist item deleted',
      description: 'The item has been removed from your wishlist.',
    });
  };

  // Reports
  const addReport = (report: Omit<Report, 'id' | 'createdAt'>) => {
    const newReport: Report = {
      ...report,
      id: generateId(),
      createdAt: new Date(),
    };
    
    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    
    if (user) {
      saveToStorage(`${user.id}_reports`, updatedReports);
    }
    
    toast({
      title: 'Report created',
      description: `"${report.name}" report has been created.`,
    });
  };

  const deleteReport = (id: string) => {
    const updatedReports = reports.filter(report => report.id !== id);
    setReports(updatedReports);
    
    if (user) {
      saveToStorage(`${user.id}_reports`, updatedReports);
    }
    
    toast({
      title: 'Report deleted',
      description: 'The report has been deleted successfully.',
    });
  };

  // Getters
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getCollectionItemById = (id: string) => {
    return collectionItems.find(item => item.id === id);
  };

  const getWishlistItemById = (id: string) => {
    return wishlistItems.find(item => item.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        collectionItems,
        wishlistItems,
        reports,
        addCategory,
        updateCategory,
        deleteCategory,
        addCollectionItem,
        updateCollectionItem,
        deleteCollectionItem,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        addReport,
        deleteReport,
        getCategoryById,
        getCollectionItemById,
        getWishlistItemById,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
