import {
    IAgentRuntime,
    IAwsS3Service,
    Service,
    ServiceType,
} from "@elizaos/core";
import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";

/**
 * Represents the result of an upload operation.
 * @typedef {Object} UploadResult
 * @property {boolean} success - Indicates whether the upload was successful or not.
 * @property {string} [url] - The URL of the uploaded file (optional).
 * @property {string} [error] - If there was an error during the upload, this property contains a description of the error (optional).
 */
interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Interface for the result of a JSON upload, extending the UploadResult interface.
 * @interface
 * @extends UploadResult
 * @property {string} [key] - Add storage key
 */
interface JsonUploadResult extends UploadResult {
    key?: string; // Add storage key
}

/**
 * Class representing an AWS S3 service that extends Service and implements IAwsS3Service.
 */
 * @extends Service
 * @implements IAwsS3Service
 */
export class AwsS3Service extends Service implements IAwsS3Service {
    static serviceType: ServiceType = ServiceType.AWS_S3;

    private s3Client: S3Client | null = null;
    private bucket: string = "";
    private fileUploadPath: string = "";
    private runtime: IAgentRuntime | null = null;

/**
 * Asynchronously initializes the AwsS3Service with the provided runtime.
 * 
 * @param {IAgentRuntime} runtime - The runtime to initialize the AwsS3Service with.
 * @returns {Promise<void>} A Promise that resolves when the initialization is complete.
 */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        console.log("Initializing AwsS3Service");
        this.runtime = runtime;
        this.fileUploadPath = runtime.getSetting("AWS_S3_UPLOAD_PATH") ?? "";
    }

/**
 * Initializes the S3 client with the necessary settings obtained from the runtime.
 * @returns {Promise<boolean>} A boolean value indicating whether the S3 client initialization was successful or not.
 */
    private async initializeS3Client(): Promise<boolean> {
        if (this.s3Client) return true;
        if (!this.runtime) return false;

        const AWS_ACCESS_KEY_ID = this.runtime.getSetting("AWS_ACCESS_KEY_ID");
        const AWS_SECRET_ACCESS_KEY = this.runtime.getSetting(
            "AWS_SECRET_ACCESS_KEY"
        );
        const AWS_REGION = this.runtime.getSetting("AWS_REGION");
        const AWS_S3_BUCKET = this.runtime.getSetting("AWS_S3_BUCKET");

        if (
            !AWS_ACCESS_KEY_ID ||
            !AWS_SECRET_ACCESS_KEY ||
            !AWS_REGION ||
            !AWS_S3_BUCKET
        ) {
            return false;
        }

        this.s3Client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucket = AWS_S3_BUCKET;
        return true;
    }

/**
 * Uploads a file to an AWS S3 bucket.
 * 
 * @param {string} filePath - The path to the file to upload.
 * @param {string} [subDirectory=""] - Optional subdirectory within the bucket.
 * @param {boolean} [useSignedUrl=false] - Flag to determine if a signed URL should be used for accessing the file.
 * @param {number} [expiresIn=900] - Expiration time in seconds for the signed URL.
 * @returns {Promise<UploadResult>} The result of the file upload operation.
 */ 
    async uploadFile(
        filePath: string,
        subDirectory: string = "",
        useSignedUrl: boolean = false,
        expiresIn: number = 900
    ): Promise<UploadResult> {
        try {
            if (!(await this.initializeS3Client())) {
                return {
                    success: false,
                    error: "AWS S3 credentials not configured",
                };
            }

            if (!fs.existsSync(filePath)) {
                return {
                    success: false,
                    error: "File does not exist",
                };
            }

            const fileContent = fs.readFileSync(filePath);

            const baseFileName = `${Date.now()}-${path.basename(filePath)}`;
            // Determine storage path based on public access
            const fileName =
                `${this.fileUploadPath}${subDirectory}/${baseFileName}`.replaceAll(
                    "//",
                    "/"
                );
            // Set upload parameters
            const uploadParams = {
                Bucket: this.bucket,
                Key: fileName,
                Body: fileContent,
                ContentType: this.getContentType(filePath),
            };

            // Upload file
            await this.s3Client.send(new PutObjectCommand(uploadParams));

            // Build result object
            const result: UploadResult = {
                success: true,
            };

            // If not using signed URL, return public access URL
            if (!useSignedUrl) {
                result.url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            } else {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: fileName,
                });
                result.url = await getSignedUrl(
                    this.s3Client,
                    getObjectCommand,
                    {
                        expiresIn, // 15 minutes in seconds
                    }
                );
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    }

    /**
     * Generate signed URL for existing file
     */
/**
 * Generates a signed URL for the specified file in AWS S3 bucket.
 * 
 * @param {string} fileName - The name of the file to generate signed URL for.
 * @param {number} [expiresIn=900] - The expiration time for the signed URL in seconds.
 * @returns {Promise<string>} The signed URL for the specified file.
 * @throws {Error} If AWS S3 credentials are not configured.
 */
    async generateSignedUrl(
        fileName: string,
        expiresIn: number = 900
    ): Promise<string> {
        if (!(await this.initializeS3Client())) {
            throw new Error("AWS S3 credentials not configured");
        }

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    private getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: { [key: string]: string } = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
        };
        return contentTypes[ext] || "application/octet-stream";
    }

    /**
     * Upload JSON object to S3
     * @param jsonData JSON data to upload
     * @param fileName File name (optional, without path)
     * @param subDirectory Subdirectory (optional)
     * @param useSignedUrl Whether to use signed URL
     * @param expiresIn Signed URL expiration time (seconds)
     */
    async uploadJson(
        jsonData: any,
        fileName?: string,
        subDirectory?: string,
        useSignedUrl: boolean = false,
        expiresIn: number = 900
    ): Promise<JsonUploadResult> {
        try {
            if (!(await this.initializeS3Client())) {
                return {
                    success: false,
                    error: "AWS S3 credentials not configured",
                };
            }

            // Validate input
            if (!jsonData) {
                return {
                    success: false,
                    error: "JSON data is required",
                };
            }

            // Generate filename (if not provided)
            const timestamp = Date.now();
            const actualFileName = fileName || `${timestamp}.json`;

            // Build complete file path
            let fullPath = this.fileUploadPath || "";
            if (subDirectory) {
                fullPath = `${fullPath}/${subDirectory}`.replace(/\/+/g, "/");
            }
            const key = `${fullPath}/${actualFileName}`.replace(/\/+/g, "/");

            // Convert JSON to string
            const jsonString = JSON.stringify(jsonData, null, 2);

            // Set upload parameters
            const uploadParams = {
                Bucket: this.bucket,
                Key: key,
                Body: jsonString,
                ContentType: "application/json",
            };

            // Upload file
            await this.s3Client.send(new PutObjectCommand(uploadParams));

            // Build result
            const result: JsonUploadResult = {
                success: true,
                key: key,
            };

            // Return corresponding URL based on requirements
            if (!useSignedUrl) {
                result.url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            } else {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                });
                result.url = await getSignedUrl(
                    this.s3Client,
                    getObjectCommand,
                    { expiresIn }
                );
            }

            return result;
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    }
}

export default AwsS3Service;
