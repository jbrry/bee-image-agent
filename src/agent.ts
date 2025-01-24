import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { FrameworkError } from "bee-agent-framework/errors";
import { TokenMemory } from "bee-agent-framework/memory/tokenMemory";
import { DuckDuckGoSearchTool } from "bee-agent-framework/tools/search/duckDuckGoSearch";
import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
import "dotenv/config.js";
import { getChatLLM } from "./helpers/llm.js";
import { createConsoleReader } from "./helpers/reader.js";

// image tools
import { GetImageDescriptionTool } from "./tools/getImageDescription.js";
import { GetImageInfoFlickrTool } from "./tools/getImageInfoFlickr.js";
import { ImageViewerTool } from "./tools/imageViewerTool.js";
import { SearchImagesFlickrTool } from "./tools/searchImageFlickr.js";

const llm = getChatLLM();
const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [
    new OpenMeteoTool(),
    new DuckDuckGoSearchTool(),
    new GetImageInfoFlickrTool(),
    new GetImageDescriptionTool(),
    new SearchImagesFlickrTool(),
    new ImageViewerTool(),
  ],
});

const reader = createConsoleReader({ fallback: "What is the weather in San Francisco?" });
for await (const { prompt } of reader) {
  try {
    const response = await agent
      .run(
        { prompt },
        {
          execution: {
            maxIterations: 8,
            maxRetriesPerStep: 3,
            totalMaxRetries: 10,
          },
        },
      )
      .observe((emitter) => {
        emitter.on("update", (data) => {
          reader.write(`Agent 🤖 (${data.update.key}) :`, data.update.value);
        });
      });

    reader.write(`Agent 🤖 :`, response.result.text);
  } catch (error) {
    reader.write(`Error`, FrameworkError.ensure(error).dump());
  }
}
