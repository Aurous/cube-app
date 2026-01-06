// Wrapper for Expo Image Picker
// Using dynamic import to handle missing modules gracefully

type ImagePickerType = typeof import('expo-image-picker')

let ImagePickerInstance: ImagePickerType | null = null
let isAvailable = false

// Initialize Image Picker module
import('expo-image-picker')
  .then((imagePickerModule) => {
    ImagePickerInstance = imagePickerModule
    isAvailable = true
  })
  .catch(() => {
    console.warn('Expo Image Picker native module not available')
  })

export const getImagePicker = () => ImagePickerInstance
export const isImagePickerAvailable = () => isAvailable
