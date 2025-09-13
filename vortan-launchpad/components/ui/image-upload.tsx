"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void
  currentFile: File | null
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function ImageUpload({ 
  onFileSelect, 
  currentFile, 
  accept = "image/*",
  maxSize = 5,
  className 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`)
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      onFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {currentFile ? (
        <div className="relative">
          <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/50">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground truncate flex-1">
              {currentFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full h-20 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload image
            </span>
            <span className="text-xs text-muted-foreground">
              Max {maxSize}MB
            </span>
          </div>
        </Button>
      )}
    </div>
  )
}