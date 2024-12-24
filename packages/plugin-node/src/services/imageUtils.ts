import sharp from "sharp";
import * as FileType from "file-type/core";

interface ImageDimensions {
    width: number;
    height: number;
}

interface ProcessedImage {
    buffer: Buffer;
    mimeType: string;
    dimensions: {
        original: ImageDimensions;
        resized: ImageDimensions;
    };
}

export async function resizeImageBuffer(
    imageBuffer: Buffer,
    maxWidth: number,
    maxHeight: number
): Promise<ProcessedImage> {
    // Detect MIME type
    try {
        // Detect MIME type
        const fileTypeResult = await FileType.fileTypeFromBuffer(imageBuffer);
        if (!fileTypeResult || !fileTypeResult.mime.startsWith("image/")) {
            throw new Error("Invalid image format");
        }

        // Get original image metadata
        const metadata = await sharp(imageBuffer).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error("Could not get image dimensions");
        }

        // Calculate new dimensions maintaining aspect ratio
        let width = metadata.width;
        let height = metadata.height;

        if (width > maxWidth) {
            height = Math.round((maxWidth * height) / width);
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = Math.round((maxHeight * width) / height);
            height = maxHeight;
        }

        // Process the image
        const resizedBuffer = await sharp(imageBuffer)
            .resize(width, height, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .toBuffer();

        return {
            buffer: resizedBuffer,
            mimeType: fileTypeResult.mime,
            dimensions: {
                original: {
                    width: metadata.width,
                    height: metadata.height,
                },
                resized: {
                    width,
                    height,
                },
            },
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Image processing failed: ${error.message}`);
        }
        throw new Error("Image processing failed with unknown error");
    }
}
