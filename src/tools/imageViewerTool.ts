import { Emitter } from "bee-agent-framework/emitter/emitter";
import { StringToolOutput, Tool, ToolEmitter, ToolInput } from "bee-agent-framework/tools/base";
import express, { Request, Response } from "express";
import open from "open";
import { z } from "zod";

export class ImageViewerTool extends Tool<StringToolOutput> {
  name = "ImageViewerTool";
  description = `Spins up an image viewer server using the provided list of image URLs.`;

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "imageviewer"],
    creator: this,
  });

  inputSchema() {
    return z.object({
      urls: z.array(z.string().url()), // List of image URLs
      querySummary: z.string(),
    });
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    const { urls, querySummary } = input;

    if (!urls || urls.length === 0) {
      throw new Error("No image URLs provided to the Image Viewer Tool.");
    }

    // capitalise summary for webpage
    const capitalizedSummary = querySummary
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const app = express();

    app.get("/", (req: Request, res: Response) => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${capitalizedSummary}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              h1 {
                margin: 20px 0;
              }
              .grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                width: 90%;
                max-width: 1200px;
                margin: 0 auto;
              }
              .grid-item {
                position: relative;
                overflow: hidden;
                background-color: #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .grid-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease-in-out;
              }
              .grid-item:hover img {
                transform: scale(1.1);
              }
              footer {
                margin: 20px 0;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>${capitalizedSummary}</h1>
            <div class="grid-container">
              ${urls
                .map(
                  (url) => `
                <div class="grid-item">
                  <img src="${url}" alt="Image">
                </div>
              `,
                )
                .join("")}
            </div>
          </body>
        </html>
      `;
      res.send(html);
    });

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Image Viewer running at http://localhost:${PORT}`);
      open(`http://localhost:${PORT}`);
    });

    return new StringToolOutput(`Server started at http://localhost:${PORT}`);
  }
}
