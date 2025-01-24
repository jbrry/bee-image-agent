import "dotenv/config";
import { createFlickr } from "flickr-sdk";

import { Emitter } from "bee-agent-framework/emitter/emitter";
import {
  StringToolOutput,
  Tool,
  ToolEmitter,
  ToolInput,
  ToolInputValidationError,
} from "bee-agent-framework/tools/base";
import { z } from "zod";

const apiKey = process.env.FLICKR_API_KEY;
if (!apiKey) {
  throw new Error("Flickr API key is not defined in the .env file. Please set FLICKR_API_KEY.");
}

const { flickr } = createFlickr(apiKey);

export class SearchImagesFlickrTool extends Tool<StringToolOutput> {
  name = "SearchImagesFlickrTool";
  description = "Searches Flickr for images based on a query and returns a list of image URLs.";

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "searchimagesflickrtool"],
    creator: this,
  });

  inputSchema() {
    return z.object({
      query: z.string().min(1), // The search query
      count: z.number().int().min(1).optional(), // Optional: number of results to return
    });
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    try {
      const { query, count } = input;

      // Perform the Flickr search
      const res = await flickr("flickr.photos.search", {
        text: query,
        per_page: count?.toString(),
      });

      if (!res.photos || !res.photos.photo.length) {
        throw new ToolInputValidationError(
          `No images found for query: "${query}". Response object was: (${JSON.stringify(res, null, 2)})`,
        );
      }

      // Map the search results to image URLs
      const imageUrls = res.photos.photo.map((photo: any) => {
        return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      });

      // Return the image URLs as a string
      return new StringToolOutput(imageUrls.join("\n"));
    } catch (error) {
      console.error("Error searching Flickr:", error);
      throw new ToolInputValidationError(`Error searching Flickr: (${error.message || error})`);
    }
  }
}
