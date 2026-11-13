import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: Buffer | string,
  options: {
    folder?: string;
    resource_type?: "image" | "auto" | "video" | "raw";
    transformation?: Record<string, any>;
    public_id?: string;
  } = {}
): Promise<UploadResult> {
  const { folder, resource_type = "image", transformation, public_id } = options;

  const result = await cloudinary.uploader.upload(
    file as string,
    {
      folder: folder || "eagle-international-school",
      resource_type,
      transformation,
      public_id,
      quality: "auto",
      fetch_format: "auto",
    }
  );

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
