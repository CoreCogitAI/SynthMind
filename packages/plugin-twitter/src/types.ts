import { z } from "zod";

/**
 * Interface for defining the structure of a Tweet content.
 * @interface
 * @property {string} text - The text content of the Tweet.
 */
export interface TweetContent {
    text: string;
}

export const TweetSchema = z.object({
    text: z.string().describe("The text of the tweet"),
});

export const isTweetContent = (obj: any): obj is TweetContent => {
    return TweetSchema.safeParse(obj).success;
};
