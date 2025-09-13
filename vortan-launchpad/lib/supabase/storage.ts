import { supabase } from './client'

const BUCKET_NAME = 'project-images'

export const storageApi = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, projectId: string, type: 'banner' | 'logo'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}/${type}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw new Error(`Failed to upload ${type}: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return urlData.publicUrl
  },

  // Delete image from Supabase Storage
  async deleteImage(projectId: string, type: 'banner' | 'logo'): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${projectId}/${type}`])

    if (error) {
      throw new Error(`Failed to delete ${type}: ${error.message}`)
    }
  },

  // Get image URL
  getImageUrl(projectId: string, type: 'banner' | 'logo'): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${projectId}/${type}`)
    
    return data.publicUrl
  }
}
