
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Heart, Plus, Search } from 'lucide-react';
import { WishlistItem } from '@/types';
import WishlistForm from '@/components/WishlistForm';
import WishlistCard from '@/components/WishlistCard';
import { useToast } from '@/components/ui/use-toast';

const Wishlist: React.FC = () => {
  const { wishlistItems, deleteWishlistItem } = useData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter items based on search term
  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleEditItem = (item: WishlistItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this wishlist item?')) {
      deleteWishlistItem(id);
    }
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground">
            Keep track of items you wish to add to your collection
          </p>
        </header>

        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wishlist..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add to Wishlist</DialogTitle>
                <DialogDescription>
                  Add an item you'd like to acquire to your wishlist.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <WishlistForm onSuccess={handleCloseAddDialog} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {searchTerm 
                ? 'No wishlist items match your search'
                : 'Your wishlist is empty'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchTerm
                ? 'Try changing your search term to find items'
                : 'Add your first wishlist item to start tracking items you want'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Wishlist Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Wishlist Item</DialogTitle>
            <DialogDescription>
              Update details for {selectedItem?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <WishlistForm 
                item={selectedItem} 
                isEdit={true} 
                onSuccess={handleCloseEditDialog} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Wishlist;
