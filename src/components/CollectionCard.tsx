
import React from 'react';
import { CollectionItem } from '@/types';
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
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionCardProps {
  item: CollectionItem;
  onEdit: (item: CollectionItem) => void;
  onDelete: (id: string) => void;
  onView: (item: CollectionItem) => void;
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'mint':
      return 'bg-green-500';
    case 'near-mint':
      return 'bg-emerald-500';
    case 'excellent':
      return 'bg-teal-500';
    case 'very-good':
      return 'bg-blue-500';
    case 'good':
      return 'bg-sky-500';
    case 'fair':
      return 'bg-amber-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getConditionLabel = (condition: string) => {
  return condition.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const CollectionCard: React.FC<CollectionCardProps> = ({ 
  item, 
  onEdit, 
  onDelete,
  onView
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
            variant="secondary" 
            className={cn("ml-2 text-white", getConditionColor(item.condition))}
          >
            {getConditionLabel(item.condition)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2 flex-grow">
        <div className="text-sm line-clamp-3 mb-3">{item.description}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Value:</div>
          <div className="font-medium text-right">${item.price.toFixed(2)}</div>
          <div className="text-muted-foreground">Acquired:</div>
          <div className="font-medium text-right">{format(new Date(item.acquisitionDate), 'MMM d, yyyy')}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onView(item)}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
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

export default CollectionCard;
