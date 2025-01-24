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

export class GetImageInfoFlickrTool extends Tool<StringToolOutput> {
  name = "GetImageInfoFlickrTool";
  description = "It generates a random puzzle to test your knowledge.";

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "getimageinfoflickrtool"],
    creator: this,
  });

  inputSchema() {
    return z.object({
      id: z.string(),
    });
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    const res = await flickr("flickr.photos.getInfo", {
      photo_id: input.id,
    });

    const photoInfo = res.photo;
    const imageUrl = `https://farm${photoInfo.farm}.staticflickr.com/${photoInfo.server}/${photoInfo.id}_${photoInfo.secret}.jpg`;

    if (!imageUrl) {
      throw new ToolInputValidationError(`Riddle with such index (${imageUrl}) does not exist!`);
    }

    return new StringToolOutput(imageUrl);
  }
}
