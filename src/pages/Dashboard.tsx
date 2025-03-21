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
  BarChart3,
  Image
} from 'lucide-react';
import { CollectionItem, MediaFile } from '@/types';
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
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  
  const filteredItems = collectionItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'price') {
        return b.price - a.price;
      } else {
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

  const handleViewMedia = (mediaFiles: MediaFile[], startIndex: number = 0) => {
    if (!mediaFiles || mediaFiles.length === 0) return;
    
    setSelectedMediaIndex(startIndex);
    setIsMediaViewerOpen(true);
  };

  const navigateMedia = (direction: 'next' | 'prev') => {
    if (!selectedItem?.mediaFiles) return;
    
    if (direction === 'next') {
      setSelectedMediaIndex((prev) => 
        prev < selectedItem.mediaFiles!.length - 1 ? prev + 1 : 0
      );
    } else {
      setSelectedMediaIndex((prev) => 
        prev > 0 ? prev - 1 : selectedItem.mediaFiles!.length - 1
      );
    }
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
                
                {selectedItem.mediaFiles && selectedItem.mediaFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Media Files</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedItem.mediaFiles.map((file, index) => (
                        <div 
                          key={file.id}
                          className="relative cursor-pointer rounded-md overflow-hidden border border-muted h-16"
                          onClick={() => handleViewMedia(selectedItem.mediaFiles!, index)}
                        >
                          {file.type === 'image' ? (
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
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

      <Dialog open={isMediaViewerOpen} onOpenChange={setIsMediaViewerOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Media Viewer</DialogTitle>
            {selectedItem?.mediaFiles && (
              <DialogDescription>
                {selectedMediaIndex + 1} of {selectedItem.mediaFiles.length}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            {selectedItem?.mediaFiles && selectedItem.mediaFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {selectedItem.mediaFiles[selectedMediaIndex].type === 'image' ? (
                    <img 
                      src={selectedItem.mediaFiles[selectedMediaIndex].url}
                      alt={`Media ${selectedMediaIndex + 1}`}
                      className="max-w-full max-h-[50vh] object-contain rounded-md"
                    />
                  ) : selectedItem.mediaFiles[selectedMediaIndex].type === 'video' ? (
                    <video 
                      src={selectedItem.mediaFiles[selectedMediaIndex].url}
                      controls
                      className="max-w-full max-h-[50vh] rounded-md"
                    />
                  ) : selectedItem.mediaFiles[selectedMediaIndex].type === 'audio' ? (
                    <audio 
                      src={selectedItem.mediaFiles[selectedMediaIndex].url}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                      <Image className="h-12 w-12 mb-2 text-muted-foreground" />
                      <span>File preview not available</span>
                      <a 
                        href={selectedItem.mediaFiles[selectedMediaIndex].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-primary underline"
                      >
                        Open file
                      </a>
                    </div>
                  )}
                </div>
                
                {selectedItem.mediaFiles.length > 1 && (
                  <div className="flex justify-between px-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigateMedia('prev')}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigateMedia('next')}
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {selectedItem.mediaFiles.map((file, index) => (
                    <div 
                      key={file.id}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer ${
                        selectedMediaIndex === index ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setSelectedMediaIndex(index)}
                    >
                      {file.type === 'image' ? (
                        <img 
                          src={file.url} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
