
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Category, CollectionItem, WishlistItem, Report } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Generate a valid UUID v4
const generateUUID = () => {
  // This implementation creates a valid UUID v4 without external dependencies
  const hex = '0123456789abcdef';
  let uuid = '';
  
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4'; // Version 4
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8]; // Variant
    } else {
      uuid += hex[Math.floor(Math.random() * 16)];
    }
  }
  
  return uuid;
};

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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (user) {
      loadDataFromSupabase();
    } else {
      setCategories([]);
      setCollectionItems([]);
      setWishlistItems([]);
      setReports([]);
    }
    setIsLoading(false);
  }, [user]);

  const loadDataFromSupabase = async () => {
    try {
      setIsLoading(true);
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      if (categoriesData) {
        const formattedCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          createdAt: new Date(cat.created_at)
        }));
        setCategories(formattedCategories);
      }
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('collection_items')
        .select('*, categories(name)');
      
      if (itemsError) throw itemsError;
      if (itemsData) {
        const formattedItems: CollectionItem[] = itemsData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          condition: item.condition,
          price: item.price,
          acquisitionDate: new Date(item.acquisition_date),
          categoryId: item.category_id || '',
          categoryName: item.categories?.name,
          notes: item.notes || undefined,
          imageUrl: item.image_url || undefined,
          mediaFiles: [],
          createdAt: new Date(item.created_at)
        }));
        setCollectionItems(formattedItems);
      }
      
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select('*, categories(name)');
      
      if (wishlistError) throw wishlistError;
      if (wishlistData) {
        const formattedWishlist: WishlistItem[] = wishlistData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.category_id || '',
          categoryName: item.categories?.name,
          createdAt: new Date(item.created_at)
        }));
        setWishlistItems(formattedWishlist);
      }
      
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*');
      
      if (reportsError) throw reportsError;
      if (reportsData) {
        const formattedReports: Report[] = reportsData.map(report => ({
          id: report.id,
          name: report.name,
          type: report.type as "time" | "category",
          startDate: report.start_date ? new Date(report.start_date) : undefined,
          endDate: report.end_date ? new Date(report.end_date) : undefined,
          categoryId: report.category_id || undefined,
          createdAt: new Date(report.created_at)
        }));
        setReports(formattedReports);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'There was a problem loading your collection data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      let userId = user.id;
      if (!isValidUUID(userId)) {
        userId = generateUUID();
        console.log(`Converting mock user ID "${user.id}" to UUID format: ${userId}`);
      }
      
      const newCategory = {
        name: category.name,
        description: category.description,
        user_id: userId
      };
      
      console.log("Adding category with data:", newCategory);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (data) {
        const formattedCategory: Category = {
          id: data.id,
          name: data.name,
          description: data.description,
          createdAt: new Date(data.created_at)
        };
        
        setCategories(prev => [...prev, formattedCategory]);
        
        toast({
          title: 'Category added',
          description: `"${category.name}" has been added to your categories.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error adding category',
        description: error.message || 'There was a problem adding the category.',
        variant: 'destructive',
      });
    }
  };

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const updateData: any = {};
      if (category.name) updateData.name = category.name;
      if (category.description) updateData.description = category.description;
      
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedCategories = categories.map(cat => 
        cat.id === id ? { ...cat, ...category } : cat
      );
      
      setCategories(updatedCategories);
      
      if (category.name) {
        const updatedItems = collectionItems.map(item => 
          item.categoryId === id ? { ...item, categoryName: category.name } : item
        );
        setCollectionItems(updatedItems);
        
        const updatedWishlist = wishlistItems.map(item => 
          item.categoryId === id ? { ...item, categoryName: category.name } : item
        );
        setWishlistItems(updatedWishlist);
      }
      
      toast({
        title: 'Category updated',
        description: `The category has been updated successfully.`,
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error updating category',
        description: error.message || 'There was a problem updating the category.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
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
      
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error deleting category',
        description: error.message || 'There was a problem deleting the category.',
        variant: 'destructive',
      });
    }
  };

  const addCollectionItem = async (item: Omit<CollectionItem, 'id' | 'createdAt'>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const category = categories.find(cat => cat.id === item.categoryId);
      
      const newItem = {
        name: item.name,
        description: item.description,
        condition: item.condition,
        price: item.price,
        acquisition_date: item.acquisitionDate.toISOString(),
        category_id: item.categoryId,
        notes: item.notes || null,
        image_url: item.imageUrl || null,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('collection_items')
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedItem: CollectionItem = {
          id: data.id,
          name: data.name,
          description: data.description,
          condition: data.condition,
          price: data.price,
          acquisitionDate: new Date(data.acquisition_date),
          categoryId: data.category_id,
          categoryName: category?.name,
          notes: data.notes || undefined,
          imageUrl: data.image_url || undefined,
          mediaFiles: [],
          createdAt: new Date(data.created_at)
        };
        
        setCollectionItems(prev => [...prev, formattedItem]);
        
        if (item.mediaFiles && item.mediaFiles.length > 0) {
          for (const file of item.mediaFiles) {
            const mediaFile = {
              name: file.name,
              type: file.type,
              url: file.url,
              thumbnail_url: file.thumbnailUrl || null,
              item_id: data.id,
              user_id: user.id
            };
            
            await supabase.from('media_files').insert([mediaFile]);
          }
        }
        
        toast({
          title: 'Item added',
          description: `"${item.name}" has been added to your collection.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding collection item:', error);
      toast({
        title: 'Error adding item',
        description: error.message || 'There was a problem adding the item.',
        variant: 'destructive',
      });
    }
  };

  const updateCollectionItem = async (id: string, item: Partial<CollectionItem>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      let categoryName;
      if (item.categoryId) {
        const category = categories.find(cat => cat.id === item.categoryId);
        categoryName = category?.name;
      }
      
      const updateData: any = {};
      
      if (item.name) updateData.name = item.name;
      if (item.description) updateData.description = item.description;
      if (item.condition) updateData.condition = item.condition;
      if (item.price !== undefined) updateData.price = item.price;
      if (item.acquisitionDate) updateData.acquisition_date = item.acquisitionDate.toISOString();
      if (item.categoryId) updateData.category_id = item.categoryId;
      if (item.notes !== undefined) updateData.notes = item.notes || null;
      if (item.imageUrl !== undefined) updateData.image_url = item.imageUrl || null;
      
      const { error } = await supabase
        .from('collection_items')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (item.mediaFiles) {
        const { data: existingMedia } = await supabase
          .from('media_files')
          .select('*')
          .eq('item_id', id);
        
        if (existingMedia) {
          const existingIds = new Set(existingMedia.map(media => media.id));
          const newMediaIds = new Set(item.mediaFiles.map(media => media.id));
          
          for (const media of existingMedia) {
            if (!newMediaIds.has(media.id)) {
              await supabase.from('media_files').delete().eq('id', media.id);
            }
          }
          
          for (const file of item.mediaFiles) {
            if (!existingIds.has(file.id)) {
              const mediaFile = {
                name: file.name,
                type: file.type,
                url: file.url,
                thumbnail_url: file.thumbnailUrl || null,
                item_id: id,
                user_id: user.id
              };
              
              await supabase.from('media_files').insert([mediaFile]);
            }
          }
        }
      }
      
      const updatedItems = collectionItems.map(collectionItem => 
        collectionItem.id === id ? { 
          ...collectionItem, 
          ...item,
          ...(categoryName ? { categoryName } : {})
        } : collectionItem
      );
      
      setCollectionItems(updatedItems);
      
      toast({
        title: 'Item updated',
        description: 'The item has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating collection item:', error);
      toast({
        title: 'Error updating item',
        description: error.message || 'There was a problem updating the item.',
        variant: 'destructive',
      });
    }
  };

  const deleteCollectionItem = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedItems = collectionItems.filter(item => item.id !== id);
      setCollectionItems(updatedItems);
      
      toast({
        title: 'Item deleted',
        description: 'The item has been deleted from your collection.',
      });
    } catch (error: any) {
      console.error('Error deleting collection item:', error);
      toast({
        title: 'Error deleting item',
        description: error.message || 'There was a problem deleting the item.',
        variant: 'destructive',
      });
    }
  };

  const addWishlistItem = async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const category = categories.find(cat => cat.id === item.categoryId);
      
      const newItem = {
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.categoryId,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedItem: WishlistItem = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.category_id,
          categoryName: category?.name,
          createdAt: new Date(data.created_at)
        };
        
        setWishlistItems(prev => [...prev, formattedItem]);
        
        toast({
          title: 'Wishlist item added',
          description: `"${item.name}" has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding wishlist item:', error);
      toast({
        title: 'Error adding wishlist item',
        description: error.message || 'There was a problem adding the wishlist item.',
        variant: 'destructive',
      });
    }
  };

  const updateWishlistItem = async (id: string, item: Partial<WishlistItem>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      let categoryName;
      if (item.categoryId) {
        const category = categories.find(cat => cat.id === item.categoryId);
        categoryName = category?.name;
      }
      
      const updateData: any = {};
      
      if (item.name) updateData.name = item.name;
      if (item.description) updateData.description = item.description;
      if (item.price !== undefined) updateData.price = item.price;
      if (item.categoryId) updateData.category_id = item.categoryId;
      
      const { error } = await supabase
        .from('wishlist_items')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedItems = wishlistItems.map(wishlistItem => 
        wishlistItem.id === id ? { 
          ...wishlistItem, 
          ...item,
          ...(categoryName ? { categoryName } : {})
        } : wishlistItem
      );
      
      setWishlistItems(updatedItems);
      
      toast({
        title: 'Wishlist item updated',
        description: 'The wishlist item has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating wishlist item:', error);
      toast({
        title: 'Error updating wishlist item',
        description: error.message || 'There was a problem updating the wishlist item.',
        variant: 'destructive',
      });
    }
  };

  const deleteWishlistItem = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedItems = wishlistItems.filter(item => item.id !== id);
      setWishlistItems(updatedItems);
      
      toast({
        title: 'Wishlist item deleted',
        description: 'The item has been removed from your wishlist.',
      });
    } catch (error: any) {
      console.error('Error deleting wishlist item:', error);
      toast({
        title: 'Error deleting wishlist item',
        description: error.message || 'There was a problem deleting the wishlist item.',
        variant: 'destructive',
      });
    }
  };

  const addReport = async (report: Omit<Report, 'id' | 'createdAt'>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const newReport = {
        name: report.name,
        type: report.type,
        start_date: report.startDate ? report.startDate.toISOString() : null,
        end_date: report.endDate ? report.endDate.toISOString() : null,
        category_id: report.categoryId || null,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('reports')
        .insert([newReport])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedReport: Report = {
          id: data.id,
          name: data.name,
          type: data.type as "time" | "category",
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          categoryId: data.category_id || undefined,
          createdAt: new Date(data.created_at)
        };
        
        setReports(prev => [...prev, formattedReport]);
        
        toast({
          title: 'Report created',
          description: `"${report.name}" report has been created.`,
        });
      }
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({
        title: 'Error creating report',
        description: error.message || 'There was a problem creating the report.',
        variant: 'destructive',
      });
    }
  };

  const deleteReport = async (id: string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const updatedReports = reports.filter(report => report.id !== id);
      setReports(updatedReports);
      
      toast({
        title: 'Report deleted',
        description: 'The report has been deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error deleting report',
        description: error.message || 'There was a problem deleting the report.',
        variant: 'destructive',
      });
    }
  };

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
