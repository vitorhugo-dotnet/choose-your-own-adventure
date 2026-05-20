export interface InventoryUpdate {
  name: string;
  action: "add" | "remove";
  reason: string;
}

export interface QuestUpdate {
  name: string;
  status: "active" | "completed" | "failed";
  reason: string;
}

export interface AdventureOption {
  text: string;
  description: string;
}

export interface AdventureState {
  storyText: string;
  options: AdventureOption[];
  inventoryUpdates: InventoryUpdate[];
  questUpdates: QuestUpdate[];
  imagePrompt: string;
  characterDescriptionUpdate?: string;
}

export interface StoryLogEntry {
  storyText: string;
  choiceMade: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface GameConfig {
  characterName: string;
  characterClass: string;
  genre: string;
  artStyle: string;
  backgroundStory: string;
}

export interface Quest {
  name: string;
  status: "active" | "completed" | "failed";
  reason: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  acquiredAt: string;
}
