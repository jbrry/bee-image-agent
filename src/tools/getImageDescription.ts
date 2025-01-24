import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import axios from "axios";
import { Emitter } from "bee-agent-framework/emitter/emitter";
import {
  StringToolOutput,
  Tool,
  ToolEmitter,
  ToolInput,
  ToolInputValidationError,
} from "bee-agent-framework/tools/base";
import "dotenv/config";
import { z } from "zod";

const projectId = process.env.WATSONX_PROJECT_ID;
const spaceId = projectId ? undefined : process.env.WATSONX_AI_SPACE_ID;
const serviceUrl = process.env.WATSONX_SERVICE_URL;

if (!projectId || !serviceUrl) {
  throw new Error(
    "WatsonXAI environment variables are missing. Please set WATSONX_AI_PROJECT_ID and WATSONX_AI_SERVICE_URL in the .env file.",
  );
}

// original implementation: https://github.com/IBM/watsonx-ai-node-sdk/blob/d46ddf942317db91e5547bdcaf5d8dd50741782e/examples/src/sdk/example_chat_image.ts
export class GetImageDescriptionTool extends Tool<StringToolOutput> {
  name = "GetImageDescriptionTool";
  description = `This tool sends an image URL and a question to an API service to describe an image and returns the model's response.`;

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "getimagedescriptiontool"],
    creator: this,
  });

  inputSchema() {
    return z.object({
      image_url: z.string(),
      question: z.string().optional(),
    });
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    try {
      // Service instance
      const watsonxAIService = WatsonXAI.newInstance({
        version: "2024-05-31",
        serviceUrl,
      });

      const modelParameters = {
        maxTokens: 512,
      };

      const response = await axios.get(input.image_url, { responseType: "arraybuffer" });
      const imgBase64 = Buffer.from(response.data, "binary").toString("base64");

      const question = input.question ?? "What is in the picture?";

      const messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imgBase64}`,
              },
            },
            {
              type: "text",
              text: question,
            },
          ],
        },
      ];

      // Call WatsonXAI
      const chatResponse = await watsonxAIService.textChat({
        modelId: "meta-llama/llama-3-2-11b-vision-instruct",
        projectId,
        spaceId,
        messages,
        ...modelParameters,
      });

      if (!chatResponse || !chatResponse.result || !chatResponse.result.choices) {
        throw new Error("Invalid response structure from WatsonXAI.");
      }

      const modelResponse = chatResponse.result.choices[0].message?.content;
      if (!modelResponse) {
        throw new Error("WatsonXAI returned no content.");
      }

      return new StringToolOutput(modelResponse);
    } catch (error) {
      console.error("Error in WatsonXAIChatTool execution:", error);
      throw new ToolInputValidationError(
        `Error processing image with WatsonXAI: (${error.message || error})`,
      );
    }
  }
}
