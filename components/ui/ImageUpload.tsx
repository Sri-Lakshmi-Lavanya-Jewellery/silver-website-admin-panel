'use client'

import { useState, useRef } from 'react'
import { imageApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { PhotoIcon, XMarkIcon, PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface ImageUploadProps {
  images: string[] | undefined
  onImagesChange: (images: string[]) => void
  maxImages?: number
  accept?: string
}

export default function ImageUpload({ 
  images = [], 
  onImagesChange, 
  maxImages = 10,
  accept = "image/*"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug: Log re-renders
  console.log('ImageUpload rendered with', images?.length || 0, 'images')

  const handleFileSelect = async (files: FileList) => {
    console.log('handleFileSelect called with', files.length, 'files')
    const currentImages = images || []
    if (currentImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    try {
      const filesArray = Array.from(files)
      console.log('Processing files:', filesArray.map(f => f.name))
      
      if (filesArray.length === 1) {
        const response = await imageApi.uploadImage(filesArray[0])
        console.log('Single upload response:', response)
        if (response.success && response.data && response.data.urls) {
          // Use the medium size URL for display, fallback to original
          const imageUrl = response.data.urls.medium || response.data.urls.original
          console.log('Using image URL:', imageUrl)
          onImagesChange([...currentImages, imageUrl])
          toast.success('Image uploaded successfully')
        } else {
          console.error('Invalid response structure:', response)
          toast.error('Failed to process uploaded image')
        }
      } else {
        const response = await imageApi.uploadMultipleImages(filesArray)
        console.log('Multiple upload response:', response)
        if (response.success && response.data && response.data.images) {
          // Use the medium size URL for display, fallback to original
          const uploadedPaths = response.data.images.map(image => 
            image.urls.medium || image.urls.original
          )
          console.log('Using image URLs:', uploadedPaths)
          onImagesChange([...currentImages, ...uploadedPaths])
          toast.success(`${filesArray.length} images uploaded successfully`)
        } else {
          console.error('Invalid response structure:', response)
          toast.error('Failed to process uploaded images')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error instanceof Error) {
        toast.error(`Failed to upload images: ${error.message}`)
      } else {
        toast.error('Failed to upload images')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const currentImages = images || []
    const newImages = currentImages.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const addManualUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      const currentImages = images || []
      onImagesChange([...currentImages, url.trim()])
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Choose Files
              </button>
              <p className="text-sm text-gray-600 mt-2">
                or drag and drop images here
              </p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each. Max {maxImages} images.
            </p>
          </div>
        )}
      </div>

      {/* Manual URL Input */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addManualUrl}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Or add image URL manually
        </button>
      </div>

      {/* Image Preview Grid */}
      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    console.warn('Failed to load image:', image)
                    target.src = '/placeholder-product.jpg'
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                    console.log('Image loaded successfully:', image)
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                Image {index + 1}
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {images && images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-600 text-center">
        {images ? images.length : 0} of {maxImages} images
      </div>
    </div>
  )
}
