import { supabase } from "../lib/supabase";

const imageUploadService = async (userId: string, imageUri: string, bucketName: string) => {
     const fileName = `${userId}/avatar-${Date.now()}.jpg`;

      // Create file object for upload
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${fileName}.${fileExt}`;

      // Read the file as array buffer
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
      
}


export default imageUploadService;