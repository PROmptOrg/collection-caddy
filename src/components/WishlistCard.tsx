
import React from 'react';
import { WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Pencil, Trash2, Heart } from 'lucide-react';

interface WishlistCardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ 
  item, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card className="glass-card overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-1">{item.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {item.categoryName}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="ml-2 bg-pink-100 text-pink-800 border-pink-300"
          >
            <Heart className="h-3 w-3 mr-1 fill-pink-500 text-pink-500" />
            Wishlist
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2 flex-grow">
        <div className="text-sm line-clamp-3 mb-3">{item.description}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Expected Value:</div>
          <div className="font-medium text-right">${item.price.toFixed(2)}</div>
          <div className="text-muted-foreground">Added:</div>
          <div className="font-medium text-right">{format(new Date(item.createdAt), 'MMM d, yyyy')}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onEdit(item)}
        >
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistCard;
