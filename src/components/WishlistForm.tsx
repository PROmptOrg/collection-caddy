
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WishlistItem } from '@/types';

const wishlistItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  price: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: 'Price must be a non-negative number' }
  ),
  categoryId: z.string().min(1, 'Please select a category'),
});

type WishlistFormValues = z.infer<typeof wishlistItemSchema>;

interface WishlistFormProps {
  onSuccess?: () => void;
  item?: WishlistItem;
  isEdit?: boolean;
}

const WishlistForm: React.FC<WishlistFormProps> = ({ 
  onSuccess, 
  item,
  isEdit = false
}) => {
  const { addWishlistItem, updateWishlistItem, categories } = useData();
  const { toast } = useToast();
  
  const form = useForm<WishlistFormValues>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item ? String(item.price) : '',
      categoryId: item?.categoryId || '',
    },
  });
  
  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: WishlistFormValues) => {
    try {
      const itemData = {
        ...data,
        price: Number(data.price),
      };
      
      if (isEdit && item) {
        updateWishlistItem(item.id, itemData);
        toast({
          title: 'Wishlist item updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        addWishlistItem(itemData);
        toast({
          title: 'Wishlist item added',
          description: `${data.name} has been added to your wishlist.`,
        });
      }
      
      form.reset({
        name: '',
        description: '',
        price: '',
        categoryId: '',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter item name" 
                  {...field} 
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Price/Value</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter expected price" 
                  {...field} 
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this item" 
                  {...field} 
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isEdit ? 'Update Wishlist Item' : 'Add to Wishlist'}
        </Button>
      </form>
    </Form>
  );
};

export default WishlistForm;
