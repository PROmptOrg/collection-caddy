
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
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSuccess?: () => void;
  category?: Category;
  isEdit?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  onSuccess, 
  category,
  isEdit = false
}) => {
  const { addCategory, updateCategory } = useData();
  const { toast } = useToast();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  });
  
  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEdit && category) {
        updateCategory(category.id, data);
        toast({
          title: 'Category updated',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Make sure we're passing a fully defined object with required properties
        addCategory({
          name: data.name,
          description: data.description
        });
        
        // Toast is now added inside addCategory function
      }
      
      form.reset({
        name: '',
        description: '',
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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter category name" 
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
                  placeholder="Describe this category" 
                  {...field} 
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isEdit ? 'Update Category' : 'Add Category'}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;
