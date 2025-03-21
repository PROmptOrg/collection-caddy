
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { FolderPlus, FolderTree, Pencil, Trash2, Search, Info, Package } from 'lucide-react';
import { Category } from '@/types';
import CategoryForm from '@/components/CategoryForm';
import { useToast } from '@/components/ui/use-toast';

const Categories: React.FC = () => {
  const { categories, deleteCategory, collectionItems } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteCategory = (id: string) => {
    const itemsInCategory = collectionItems.filter(item => item.categoryId === id).length;
    
    if (itemsInCategory > 0) {
      toast({
        title: 'Cannot delete category',
        description: `This category contains ${itemsInCategory} items. Please remove or reassign these items first.`,
        variant: 'destructive',
      });
      return;
    }
    
    deleteCategory(id);
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const getCategoryItemCount = (categoryId: string) => {
    return collectionItems.filter(item => item.categoryId === categoryId).length;
  };
  
  const getCategoryValue = (categoryId: string) => {
    return collectionItems
      .filter(item => item.categoryId === categoryId)
      .reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize your collection with custom categories
          </p>
        </header>

        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your collection.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <CategoryForm onSuccess={handleCloseAddDialog} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <FolderTree className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {searchTerm 
                ? 'No categories match your search'
                : 'No categories yet'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchTerm
                ? 'Try changing your search term to find categories'
                : 'Create your first category to organize your collection'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredCategories.map((category) => {
              const itemCount = getCategoryItemCount(category.id);
              const categoryValue = getCategoryValue(category.id);
              
              return (
                <Card key={category.id} className="glass-card overflow-hidden h-full flex flex-col">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-0 flex-grow">
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {category.description}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Items:</div>
                      <div className="font-medium text-right">{itemCount}</div>
                      <div className="text-muted-foreground">Total value:</div>
                      <div className="font-medium text-right">${categoryValue.toFixed(2)}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewCategory(category)}
                    >
                      <Info className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {itemCount > 0 ? (
                              <>
                                This category contains {itemCount} items.
                                You cannot delete a category that contains items.
                                Please remove or reassign these items first.
                              </>
                            ) : (
                              'This will permanently delete the category.'
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          {itemCount === 0 && (
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          )}
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update details for {selectedCategory?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCategory && (
              <CategoryForm 
                category={selectedCategory} 
                isEdit={true} 
                onSuccess={handleCloseEditDialog} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p>{selectedCategory.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Items</h4>
                  <p className="font-medium">{getCategoryItemCount(selectedCategory.id)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Value</h4>
                  <p className="font-medium">${getCategoryValue(selectedCategory.id).toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                <p>{new Date(selectedCategory.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Close
            </Button>
            <Button onClick={() => {
              handleCloseViewDialog();
              if (selectedCategory) {
                handleEditCategory(selectedCategory);
              }
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Categories;
