import { z } from "zod";

export const FileLocationResultSchema = z.object({
    fileLocation: z.string().min(1),
});

/**
 * Represents the result type inferred from the schema for FileLocationResult.
 */
export type FileLocationResult = z.infer<typeof FileLocationResultSchema>;

/**
 * Check if the input object is an instance of FileLocationResult.
 * @param {unknown} obj - The input object to be checked.
 * @returns {boolean} Whether the input object is an instance of FileLocationResult.
 */
export function isFileLocationResult(obj: unknown): obj is FileLocationResult {
    return FileLocationResultSchema.safeParse(obj).success;
}
