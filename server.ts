import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of the GoogleGenAI client to avoid crashing on startup if the key is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please configure your API key in the Secrets panel of Google AI Studio.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Health/Config endpoint to check if the API key is configured
app.get("/api/config", (req, res) => {
  const isKeyConfigured = !!process.env.GEMINI_API_KEY;
  res.json({
    apiKeyConfigured: isKeyConfigured,
    message: isKeyConfigured 
      ? "API key is configured. Adventure engine is ready!" 
      : "Gemini API key is missing. Please set it in Settings > Secrets to enable infinite AI stories and real-time art generation."
  });
});

// Definition schema for the adventure state
const adventureSchema = {
  type: Type.OBJECT,
  properties: {
    storyText: {
      type: Type.STRING,
      description: "A rich, literary, and immersive continuation of the story. Use descriptive atmosphere, evocative details, sensory inputs, and character interactions.",
    },
    inventoryUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the item (e.g. 'Rusted Dagger', 'Ancient Scroll')." },
          action: { type: Type.STRING, description: "Must be exactly 'add' or 'remove'." },
          reason: { type: Type.STRING, description: "Short description of why it was added or removed." },
        },
        required: ["name", "action", "reason"],
      },
      description: "Additions or subtractions to/from the player's inventory as a strict consequence of the current event.",
    },
    questUpdates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The title of the quest." },
          status: { type: Type.STRING, description: "Must be 'active' or 'completed' or 'failed'." },
          reason: { type: Type.STRING, description: "Lore explanation of how the quest state updated." },
        },
        required: ["name", "status", "reason"],
      },
      description: "Updates to quests (finding new quests, completing existing quests, failing quests) that happen in this scene.",
    },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "A concrete, exciting path/action for the player to take next." },
          description: { type: Type.STRING, description: "A summary label of what this choice represents (e.g. 'Investigate the sounds', 'Retreat to safety')." },
        },
        required: ["text", "description"],
      },
      description: "Generate exactly three exciting, tailored choices. Choices must genuinely depend on the protagonist's strengths, equipment, inventory, or setting.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A highly visual and descriptive text-to-image prompt. It should describe this exact scene in detail, including key environmental features and characters, adhering to the specified visual Art Style and Protagonist Description. Avoid text inside the image. Describe composition and lighting.",
    },
    characterDescriptionUpdate: {
      type: Type.STRING,
      description: "Fill this ONLY if the protagonist's outer physical identity or worn equipment has notably changed (e.g. 'A rogue in heavy bronze plate armor'). Keep empty otherwise.",
    },
  },
  required: ["storyText", "inventoryUpdates", "questUpdates", "options", "imagePrompt"],
};

// 2. Start a new adventure
app.post("/api/adventure/start", async (req, res) => {
  try {
    const { genre, artStyle, characterName, characterClass, backgroundStory } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are the ultimate Infinite Choose-Your-Own-Adventure Dungeon Master. 
Our player is playing a text adventure game in a ${genre} setting. 
The art style of the journey's illustrations is: "${artStyle}".
The protagonist is named "${characterName}", who is a "${characterClass}" (${backgroundStory || "an adventurer seeking glory"}).

Your job:
- Open the story with a highly engaging introductory passage set in this universe.
- Introduce the protagonist inside an active environment with an immediate problem or goal.
- Formulate a primary starting Quest (add it to questUpdates as 'active').
- Grant any initial inventory item corresponding to their class/background (add to inventoryUpdates as 'add').
- Formulate exactly 3 immersive options for what the player should do first.
- Construct a detailed imagePrompt so we can draw this starting scene. The character description in the prompt should be: "a ${characterClass} named ${characterName}".

Be narrative, rich, detailed, and atmospheric. Always respond in pure JSON matching the schemas provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Dungeon Master, begin the adventure. Place me in the starting scene.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: adventureSchema,
      },
    });

    if (!response.text) {
      throw new Error("Received empty response from Gemini.");
    }

    const state = JSON.parse(response.text.trim());
    res.json(state);
  } catch (error: any) {
    console.error("Error starting adventure:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Take the next step in the adventure
app.post("/api/adventure/next", async (req, res) => {
  try {
    const { 
      genre, 
      artStyle, 
      characterName, 
      characterClass, 
      characterDescription, 
      currentQuest,
      inventory,
      quests,
      storyHistory, // List of { text: string, choice: string } 
      lastChoice 
    } = req.body;

    const ai = getGeminiClient();

    // Format previous adventure history
    const historyText = storyHistory && storyHistory.length > 0 
      ? storyHistory.map((h: any, i: number) => `Scene ${i+1}: ${h.text}\nPlayer chose: ${h.choice}`).join("\n\n")
      : "The adventure just began.";

    const systemPrompt = `You are the ultimate Infinite Choose-Your-Own-Adventure Dungeon Master.
Setting: ${genre}
Visual Illustration Style: "${artStyle}"
Protagonist: "${characterName}", a "${characterClass}"
Protagonist Description/Appearance: "${characterDescription || `a ${characterClass}`}"

Current Inventory State: [${inventory.join(", ")}]
Current Quests State: ${JSON.stringify(quests)}

Here is the chronicle of key milestones and events that happened so far in this journey:
${historyText}

Player's Current Intent/Choice: "${lastChoice}"

Your job:
1. Genuinely resolve the player's choice. Bring organic, logical, and dramatic consequences. Do not lead to pre-set paths.
2. Draft the next rich, descriptive story passage. Show, don't tell the dangers, beauties, or developments.
3. Keep strict consistency on Character Appearance / Protagonist Description. If their appearance or worn equipment updates, supply it in characterDescriptionUpdate.
4. Update the inventory based on actions (e.g. if they retrieve an item, use action: 'add'. If they lose or use an item, use action: 'remove').
5. Update quests dynamically (mark quests as 'completed' if they solved them, add new 'active' quests, or mark quests as 'failed' if they failed).
6. Provide three tailored next choices. Ensure they reflect the context, protagonist's current inventory, and environment.
7. Craft a highly vivid imagePrompt describing this scene visually, staying completely consistent with the "${artStyle}" style and the protagonist's description.

Always respond in pure JSON matching the schemas provided. Do not include any markdown code gates in your raw output.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `I choose: "${lastChoice}". Resolve this choice and narrate the next part.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: adventureSchema,
      },
    });

    if (!response.text) {
      throw new Error("Received empty response from the AI.");
    }

    const state = JSON.parse(response.text.trim());
    res.json(state);
  } catch (error: any) {
    console.error("Error processing next adventure scene:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Generate dynamic illustrations using Gemini 2.5 Flash Image on server-side
app.post("/api/adventure/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt supplied for image generation." });
    }

    const ai = getGeminiClient();

    console.log("Generating adventure scene illustration for prompt:", prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `${prompt}. High-quality art, immersive digital illustration, highly atmospheric. Do not render any text, words, signatures, or user interfaces inside the image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let base64Image = null;
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("Gemini Image model did not return any image data parts.");
    }

    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });

  } catch (error: any) {
    console.error("Error generating scene illustration:", error.message);
    // Return the error message so the client can fall back to beautiful procedural visuals
    res.status(500).json({ 
      error: error.message,
      message: "Paid-tier image model quota exceeded or key not configured. Using high-fidelity placeholder style art."
    });
  }
});

// Vite middleware integration for full-stack apps
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adventure Engine Server listening on port ${PORT}`);
  });
}

startServer();
