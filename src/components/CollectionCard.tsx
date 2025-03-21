
import React, { useState } from 'react';
import { CollectionItem, MediaFile } from '@/types';
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
import { Eye, Pencil, Trash2, Image, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  
  const hasMedia = item.mediaFiles && item.mediaFiles.length > 0;
  const imageFiles = item.mediaFiles?.filter(file => file.type === 'image') || [];
  const hasImages = imageFiles.length > 0;

  const handleMediaClick = () => {
    if (hasMedia) {
      setSelectedMediaIndex(0);
      setMediaDialogOpen(true);
    }
  };

  const navigateMedia = (direction: 'next' | 'prev') => {
    if (!item.mediaFiles) return;
    
    if (direction === 'next') {
      setSelectedMediaIndex((prev) => 
        prev < item.mediaFiles!.length - 1 ? prev + 1 : 0
      );
    } else {
      setSelectedMediaIndex((prev) => 
        prev > 0 ? prev - 1 : item.mediaFiles!.length - 1
      );
    }
  };

  return (
    <>
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
          
          {hasImages && (
            <div 
              className="mt-3 cursor-pointer relative rounded-md overflow-hidden"
              onClick={handleMediaClick}
            >
              <img 
                src={imageFiles[0].url} 
                alt={item.name} 
                className="w-full h-24 object-cover"
              />
              {imageFiles.length > 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Images className="h-8 w-8 text-white" />
                  <span className="text-white font-medium ml-2">{imageFiles.length}</span>
                </div>
              )}
            </div>
          )}
          
          {!hasImages && hasMedia && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={handleMediaClick}
            >
              <Image className="mr-2 h-4 w-4" />
              View Media ({item.mediaFiles?.length})
            </Button>
          )}
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

      {/* Media Viewer Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Media Files - {item.name}</DialogTitle>
            <DialogDescription>
              {item.mediaFiles && item.mediaFiles.length > 0 ? 
                `Viewing file ${selectedMediaIndex + 1} of ${item.mediaFiles.length}` : 
                'No media files available'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            {item.mediaFiles && item.mediaFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {item.mediaFiles[selectedMediaIndex].type === 'image' ? (
                    <img 
                      src={item.mediaFiles[selectedMediaIndex].url}
                      alt={`Media ${selectedMediaIndex + 1}`}
                      className="max-w-full max-h-[50vh] object-contain rounded-md"
                    />
                  ) : item.mediaFiles[selectedMediaIndex].type === 'video' ? (
                    <video 
                      src={item.mediaFiles[selectedMediaIndex].url}
                      controls
                      className="max-w-full max-h-[50vh] rounded-md"
                    />
                  ) : item.mediaFiles[selectedMediaIndex].type === 'audio' ? (
                    <audio 
                      src={item.mediaFiles[selectedMediaIndex].url}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                      <Image className="h-12 w-12 mb-2 text-muted-foreground" />
                      <span>File preview not available</span>
                      <a 
                        href={item.mediaFiles[selectedMediaIndex].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-primary underline"
                      >
                        Open file
                      </a>
                    </div>
                  )}
                </div>
                
                {item.mediaFiles.length > 1 && (
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
                  {item.mediaFiles.map((file, index) => (
                    <div 
                      key={file.id}
                      className={cn(
                        "w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer",
                        selectedMediaIndex === index ? "border-primary" : "border-transparent"
                      )}
                      onClick={() => setSelectedMediaIndex(index)}
                    >
                      {file.type === 'image' ? (
                        <img 
                          src={file.url} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : file.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : file.type === 'audio' ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
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
    </>
  );
};

export default CollectionCard;
