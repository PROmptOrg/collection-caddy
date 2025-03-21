
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaFile } from '@/types';
import { FileImage, FileVideo, FileAudio, File, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  mediaFiles: MediaFile[];
  onMediaAdd: (files: MediaFile[]) => void;
  onMediaRemove: (id: string) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  mediaFiles, 
  onMediaAdd, 
  onMediaRemove 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newMediaFiles: MediaFile[] = files.map(file => {
      // Determine file type
      let type: 'image' | 'video' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      return {
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        type,
        url,
        createdAt: new Date()
      };
    });

    onMediaAdd(newMediaFiles);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'video': return <FileVideo className="h-8 w-8 text-red-500" />;
      case 'audio': return <FileAudio className="h-8 w-8 text-green-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Drag files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports images, videos, audio, and documents
        </p>
        <Input
          id="fileInput"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
      </div>

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {mediaFiles.map((file) => (
            <div key={file.id} className="relative group border rounded-md p-3 bg-background">
              <div className="flex flex-col items-center">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="h-20 w-20 object-contain mb-2" 
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center mb-2">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <p className="text-xs truncate w-full text-center">{file.name}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMediaRemove(file.id);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
