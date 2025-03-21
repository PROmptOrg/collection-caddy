
import React, { useState } from 'react';
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CollectionItem } from '@/types';

const conditionOptions = [
  { value: 'mint', label: 'Mint' },
  { value: 'near-mint', label: 'Near Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'very-good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  condition: z.string().min(1, 'Please select a condition'),
  price: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: 'Price must be a non-negative number' }
  ),
  acquisitionDate: z.date({
    required_error: 'Please select the acquisition date',
  }),
  categoryId: z.string().min(1, 'Please select a category'),
  notes: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  onSuccess?: () => void;
  item?: CollectionItem;
  isEdit?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ 
  onSuccess, 
  item,
  isEdit = false
}) => {
  const { addCollectionItem, updateCollectionItem, categories } = useData();
  const { toast } = useToast();
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      condition: item?.condition || '',
      price: item ? String(item.price) : '',
      acquisitionDate: item?.acquisitionDate ? new Date(item.acquisitionDate) : new Date(),
      categoryId: item?.categoryId || '',
      notes: item?.notes || '',
    },
  });
  
  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: ItemFormValues) => {
    try {
      const itemData = {
        ...data,
        price: Number(data.price),
      };
      
      if (isEdit && item) {
        updateCollectionItem(item.id, itemData);
        toast({
          title: 'Item updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        addCollectionItem(itemData);
        toast({
          title: 'Item added',
          description: `${data.name} has been added to your collection.`,
        });
      }
      
      form.reset({
        name: '',
        description: '',
        condition: '',
        price: '',
        acquisitionDate: new Date(),
        categoryId: '',
        notes: '',
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price/Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price" 
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
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Condition</SelectLabel>
                      {conditionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="acquisitionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Acquisition Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "h-11 w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes" 
                  {...field} 
                  className="min-h-[80px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isEdit ? 'Update Item' : 'Add Item'}
        </Button>
      </form>
    </Form>
  );
};

export default ItemForm;
