
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Filter,
  Plus,
  Search,
  Package,
  PackageOpen,
  BarChart3
} from 'lucide-react';
import { CollectionItem } from '@/types';
import ItemForm from '@/components/ItemForm';
import CollectionCard from '@/components/CollectionCard';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { collectionItems, categories, deleteCollectionItem } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'name' | 'price' | 'date'>('date');
  
  // Filter items based on search term, category, and sort
  const filteredItems = collectionItems
    .filter(item => {
      // Search term filter
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort order
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'price') {
        return b.price - a.price;
      } else {
        // 'date'
        return new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime();
      }
    });
  
  const totalItems = collectionItems.length;
  const totalValue = collectionItems.reduce((sum, item) => sum + item.price, 0);
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;
  
  const handleEditItem = (item: CollectionItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  
  const handleViewItem = (item: CollectionItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteCollectionItem(id);
    }
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };
  
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedItem(null);
  };

  const getConditionLabel = (condition: string) => {
    return condition.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Collection Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and explore your collection items
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <CardDescription>All items in your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <CardDescription>Sum of all item values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Value</CardTitle>
              <CardDescription>Average price per item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSortOrder('date')}>
                  Date (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('name')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('price')}>
                  Price (High-Low)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-full md:w-[200px] pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>
                    Add details about your collection item.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ItemForm onSuccess={handleCloseAddDialog} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No items match your search or filter'
                : 'Your collection is empty'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try changing your search term or filters to find items'
                : 'Add your first item to start building your collection'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredItems.map((item) => (
              <CollectionCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onView={handleViewItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update details for {selectedItem?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <ItemForm 
                item={selectedItem} 
                isEdit={true} 
                onSuccess={handleCloseEditDialog} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.categoryName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <ScrollArea className="max-h-[65vh]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Value</h4>
                    <div className="mt-1 font-medium">${selectedItem.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Condition</h4>
                    <div className="mt-1 font-medium">
                      {getConditionLabel(selectedItem.condition)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Acquired</h4>
                    <div className="mt-1 font-medium">
                      {new Date(selectedItem.acquisitionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <div className="text-sm">
                    {selectedItem.description}
                  </div>
                </div>
                
                {selectedItem.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                    <div className="text-sm">
                      {selectedItem.notes}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={handleCloseViewDialog}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleCloseViewDialog();
                if (selectedItem) {
                  handleEditItem(selectedItem);
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
