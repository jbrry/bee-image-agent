# 🐝 Bee Image Agent Example

This Agent is based on the [Bee Agent Framework Starter](https://github.com/i-am-bee/bee-agent-framework-starter).

It is extended to showcase image-processing capabilities through the [IBM watsonx.ai Node.js SDK](https://github.com/IBM/watsonx-ai-node-sdk).

The workflow first searches for an image from Flickr, using an `id` parameter. It then retrieves the URL and passes the URL and an accompanying question to a hosted model on WatsonX that is capable of handling image/text inputs, for example `meta-llama/llama-3-2-11b-vision-instruct`.

Here is an example flow using [this](https://www.flickr.com/photos/jennthulhu_photog/54283177907/) image with `id=54283177907`:

```
User 👤 : Get me the image with id: 54283177907 from Flickr, and please describe its contents
Agent 🤖 (thought) : The user wants to get an image from Flickr and describe its contents, I can use the GetImageInfoFlickrTool function to get the image URL and then use the GetImageDescriptionTool function to describe the image.
Agent 🤖 (tool_name) : GetImageInfoFlickrTool
Agent 🤖 (tool_input) : {"id": "54283177907"}
Agent 🤖 (tool_output) : https://farm66.staticflickr.com/65535/54283177907_8359857afb.jpg
Agent 🤖 (thought) : Now that I have the image URL, I can use the GetImageDescriptionTool function to describe the image.
Agent 🤖 (tool_name) : GetImageDescriptionTool
Agent 🤖 (tool_input) : {"image_url":"https://farm66.staticflickr.com/65535/54283177907_8359857afb.jpg","question":"Describe the image"}
Agent 🤖 (tool_output) : The image shows a photo of a professional ice hockey game in progress.

*   A player wearing a black uniform with the number 51 on his left sleeve runs across the ice with his left foot forward.
    *   His uniform consists of a black helmet, black top with teal and red accents, black pants with teal and red accents, black socks with teal and red stripes, and black shin guards. He also wears black skates and black gloves.
    *   The player extends his left leg forwards in mid-stride.
    *   His lower right leg appears blurred due to being in motion.
*   Behind him, two other players are engaged in the game.
    *   On the right, a player wears a white helmet and respectively themed top, pants, and gloves with the letters "CAPS" on his sleeves holding a hockey stick;
    *   On the left, a player in a matching top and pants uniform, but wearing a goalkeeping helmet, is obscured by and behind the man in blacks body and striking out with their left arm.
*   The background shows a crowd watching the game from the stands.
    *   Behind the crowd is a metallic fence wall with advertisements behind it.
    *   Furthermore down, there is a yellow line along which the crowd sits, before the ice sheet.

This image depicts the intensity and action of an ice hockey game in progress.

Agent 🤖 (thought) : I have the image description, now I can provide the final answer.
Agent 🤖 (final_answer) : The image with id: 54283177907 from Flickr is a photo of a professional ice hockey game in progress. A player wearing a black uniform with the number 51 on his left sleeve runs across the ice with his left foot forward. Behind him, two other players are engaged in the game. The background shows a crowd watching the game from the stands.
Agent 🤖 : The image with id: 54283177907 from Flickr is a photo of a professional ice hockey game in progress. A player wearing a black uniform with the number 51 on his left sleeve runs across the ice with his left foot forward. Behind him, two other players are engaged in the game. The background shows a crowd watching the game from the stands.
```

## Prerequisites

Obtain an API key for Flickr [here](https://www.flickr.com/services/apps/create/).
Obtain Watsonx credentials (see `.env.template` for the parameters that are necessary).

Install necessary packages:

```bash
npm install
```

Run the agent:

```bash
npm run start src/agent.ts <<< "Get me the image with id: 54283177907 from Flickr, and please describe its contents"
```

```bash
npm run start src/agent.ts <<< "Get me some images from Flickr that show waves crashing on a shore"
```
