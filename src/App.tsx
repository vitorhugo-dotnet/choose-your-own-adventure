import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Sword, 
  Shield, 
  BookOpen, 
  Key, 
  Gem, 
  FlaskConical, 
  Play, 
  User, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Dice5, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Map, 
  Crown,
  Lock,
  ArrowRight,
  UserCheck,
  Heart,
  History,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GameConfig, 
  AdventureState, 
  StoryLogEntry, 
  Quest, 
  InventoryItem 
} from "./types";
import { 
  getItemIcon, 
  getGenreTheme, 
  getFallbackArtGradient, 
  getSandboxRoom 
} from "./utils";

// Static options for character customizer
const GENRES = [
  { name: "High Fantasy", description: "Magic, towering castles, elves, and dark magical forces." },
  { name: "Cyberpunk Dystopia", description: "Megacorps, neon rain, cybernetics, and digital rebellion." },
  { name: "Cosmic Horror", description: "Forbidden knowledge, whispering oceans, and ancient elder gods." },
  { name: "Steampunk Era", description: "Clockwork mechanical automatons, brass airships, and alchemical steam." },
  { name: "Post-Apocalyptic Slum", description: "Crumbling rust cities, scattered archaic technologies, and harsh survival." }
];

const CLASSES = [
  { name: "Shadow Infiltrator", weapon: "Obsidian Dagger", perk: "Expert Stealth & Sleight of Hand" },
  { name: "Runic Arcanist", weapon: "Amber Focus Wand", perk: "Bends Elemental & Spatial Magic" },
  { name: "Ironclad Vanguard", weapon: "Vanguard Crest Shield", perk: "Unbeatable Fortitude & Martial Skill" },
  { name: "Wildwood Ranger", weapon: "Recurve Elm Bow", perk: "Beast Speech & Survivalist Tracking" },
  { name: "Sovereign Sage", weapon: "Scroll of Grand Decrees", perk: "Deciphers Forbidden Arcana & Ancient Lore" }
];

const ART_STYLES = [
  { name: "Vibrant Retro Pixel Art", descriptor: "isometric, colorful, nostalgic 16-bit game asset" },
  { name: "Charcoal & Ink Sketch", descriptor: "monochrome, heavy ink lines, gothic, high contrast sketch" },
  { name: "Ethereal Watercolor Painting", descriptor: "soft glowing edges, flowing warm pigments, fairytale fantasy art" },
  { name: "Futuristic Neon Synthwave Digital Art", descriptor: "glowing purple and cyan grid, 80s futuristic cyberpunk poster" },
  { name: "Classic Renaissance Oil Canvas", descriptor: "chiaroscuro, deep shadows, dramatic lighting, classic gallery museum oil painting" }
];

const SAMPLE_NAMES = ["Kaelen", "Valerie", "Nova", "Althea", "Roderick", "Zephyr", "Lyra", "Cassian"];

export default function App() {
  // Initialization state
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);
  const [engineMode, setEngineMode] = useState<"ai" | "sandbox">("ai");
  const [activeTab, setActiveTab] = useState<"current" | "character" | "journal">("current");
  
  // Game Setup state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [characterName, setCharacterName] = useState<string>("Valerie");
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0].name);
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0].name);
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>(ART_STYLES[0].name);
  const [backgroundStory, setBackgroundStory] = useState<string>("");

  // Running Game state
  const [currentRoom, setCurrentRoom] = useState<AdventureState | null>(null);
  const [storyLog, setStoryLog] = useState<StoryLogEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [characterDescription, setCharacterDescription] = useState<string>("");
  const [sceneImageUrl, setSceneImageUrl] = useState<string>("");

  // Loading indicator states
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  
  // Interaction/Inputs state
  const [customAction, setCustomAction] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto scroll reference for the chat screen
  const chronicleEndRef = useRef<HTMLDivElement | null>(null);

  // Check backend server setup on load
  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setApiKeyConfigured(data.apiKeyConfigured);
        if (!data.apiKeyConfigured) {
          // Default to Sandbox mode if no key is found on backend
          setEngineMode("sandbox");
        }
      })
      .catch(err => {
        console.error("Config check failed, default to Sandbox Mode:", err);
        setApiKeyConfigured(false);
        setEngineMode("sandbox");
      });
  }, []);

  // Scroll down whenever log changes
  useEffect(() => {
    chronicleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentRoom, storyLoading]);

  // Map class name to custom perk description
  const getSelectedClassPerk = () => {
    const cls = CLASSES.find(c => c.name === selectedClass);
    return cls ? cls.perk : "";
  };

  // Get active color theme based on selected Genre
  const theme = getGenreTheme(selectedGenre);

  // Randomize character name
  const rollRandomName = () => {
    const idx = Math.floor(Math.random() * SAMPLE_NAMES.length);
    setCharacterName(SAMPLE_NAMES[idx]);
  };

  // Starts the interactive game
  const handleStartGame = async () => {
    setStoryLoading(true);
    setErrorMessage(null);
    setSceneImageUrl("");
    
    const initialConfig: GameConfig = {
      characterName,
      characterClass: selectedClass,
      genre: selectedGenre,
      artStyle: selectedArtStyle,
      backgroundStory: backgroundStory || `A legendary ${selectedClass} seeking their ultimate destiny.`
    };

    if (engineMode === "sandbox") {
      // Sandbox implementation
      setTimeout(() => {
        const room = getSandboxRoom(null, initialConfig);
        
        // Initialize dynamic sidebar state
        const initialInventory: InventoryItem[] = room.inventoryUpdates.map((up, i) => ({
          id: `item-${Date.now()}-${i}`,
          name: up.name,
          acquiredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        const initialQuests: Quest[] = room.questUpdates.map(qu => ({
          name: qu.name,
          status: qu.status,
          reason: qu.reason
        }));

        setInventory(initialInventory);
        setQuests(initialQuests);
        setCharacterDescription(`A highly competent ${selectedClass} wielding a ${CLASSES.find(c => c.name === selectedClass)?.weapon}`);
        setCurrentRoom(room);
        setStoryLog([
          {
            storyText: room.storyText,
            choiceMade: "Started Adventure",
            imagePrompt: room.imagePrompt,
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(room.imagePrompt)}/800/450`
          }
        ]);
        setSceneImageUrl(`https://picsum.photos/seed/${encodeURIComponent(room.imagePrompt)}/800/450`);
        setIsPlaying(true);
        setStoryLoading(false);
      }, 800);
    } else {
      // Real AI implementation
      try {
        const response = await fetch("/api/adventure/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialConfig)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to contact Gemini backend.");
        }

        const room: AdventureState = await response.json();
        
        // Populate dynamic lists
        const freshInventory: InventoryItem[] = room.inventoryUpdates
          .filter(up => up.action === "add")
          .map((up, i) => ({
            id: `item-${Date.now()}-${i}`,
            name: up.name,
            acquiredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));

        const freshQuests: Quest[] = room.questUpdates.map(qu => ({
          name: qu.name,
          status: qu.status,
          reason: qu.reason
        }));

        setInventory(freshInventory);
        setQuests(freshQuests);
        setCharacterDescription(`A highly competent ${selectedClass} wielding a ${CLASSES.find(c => c.name === selectedClass)?.weapon}`);
        setCurrentRoom(room);
        setStoryLog([
          {
            storyText: room.storyText,
            choiceMade: "Started Adventure",
            imagePrompt: room.imagePrompt
          }
        ]);
        
        setIsPlaying(true);
        setStoryLoading(false);

        // Fetch companion illustration asynchronously
        fetchSceneImage(room.imagePrompt);

      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "An unexpected error occurred while contacting the Gemini DM.");
        setStoryLoading(false);
      }
    }
  };

  // Asynchronously request base64 image from backend Gemini-Image model
  const fetchSceneImage = async (prompt: string) => {
    setImageLoading(true);
    try {
      const imgRes = await fetch("/api/adventure/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!imgRes.ok) {
        throw new Error("Failed to receive structured image from Gemini.");
      }

      const imgData = await imgRes.json();
      if (imgData.imageUrl) {
        setSceneImageUrl(imgData.imageUrl);
        setStoryLog(prev => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[updated.length - 1].imageUrl = imgData.imageUrl;
          return updated;
        });
      } else {
        throw new Error("Missing imageUrl in server response.");
      }
    } catch (err) {
      console.warn("Real-time image generation failed. Using high-fidelity visual fallback:", err);
      // Perfect fallback: seed a highly curated beautiful stylized picsum frame
      const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 50))}/800/450`;
      setSceneImageUrl(fallbackUrl);
    } finally {
      setImageLoading(false);
    }
  };

  // Processes both predefined options & fully customized player entries
  const handleNextStep = async (choiceText: string) => {
    if (storyLoading || !currentRoom) return;

    setStoryLoading(true);
    setErrorMessage(null);
    setSceneImageUrl("");
    setCustomAction("");

    // Append choice to history
    const choiceEntry = {
      storyText: currentRoom.storyText,
      choiceMade: choiceText,
      imagePrompt: currentRoom.imagePrompt,
      imageUrl: sceneImageUrl
    };
    
    const updatedStoryLog = [...storyLog, choiceEntry];
    setStoryLog(updatedStoryLog);

    if (engineMode === "sandbox") {
      // Local Sandbox Resolution
      setTimeout(() => {
        const nextRoom = getSandboxRoom(choiceText, {
          characterName,
          characterClass: selectedClass,
          genre: selectedGenre
        });

        // Apply Sandbox state updates
        applyStateUpdates(nextRoom);
        setCurrentRoom(nextRoom);
        setStoryLoading(false);
        setSceneImageUrl(`https://picsum.photos/seed/${encodeURIComponent(nextRoom.imagePrompt.substring(0,40))}/800/450`);
      }, 700);
    } else {
      // Contact Live Gemini backend for true plot divergence
      try {
        const payload = {
          genre: selectedGenre,
          artStyle: selectedArtStyle,
          characterName,
          characterClass: selectedClass,
          characterDescription,
          inventory: inventory.map(i => i.name),
          quests,
          storyHistory: updatedStoryLog.map(log => ({
            text: log.storyText,
            choice: log.choiceMade
          })),
          lastChoice: choiceText
        };

        const response = await fetch("/api/adventure/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Failed to resolve game state with the AI Dungeon Master.");
        }

        const nextRoom: AdventureState = await response.json();
        
        applyStateUpdates(nextRoom);
        setCurrentRoom(nextRoom);
        setStoryLoading(false);

        // Load next dynamic illustration
        fetchSceneImage(nextRoom.imagePrompt);

      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Unable to calculate next part of the story. Please try again.");
        setStoryLoading(false);
        // Recover previous room state so the user isn't stuck on a blank screen
        setStoryLog(prev => prev.slice(0, -1));
      }
    }
  };

  // Helper to sync inventory & quests lists based on updates from DM json
  const applyStateUpdates = (room: AdventureState) => {
    // 1. Process Inventory updates
    if (room.inventoryUpdates && room.inventoryUpdates.length > 0) {
      setInventory(prev => {
        let updated = [...prev];
        room.inventoryUpdates.forEach(update => {
          if (update.action === "add") {
            // Avoid duplicates
            if (!updated.some(i => i.name.toLowerCase() === update.name.toLowerCase())) {
              updated.push({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                name: update.name,
                acquiredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
            }
          } else if (update.action === "remove") {
            updated = updated.filter(i => i.name.toLowerCase() !== update.name.toLowerCase());
          }
        });
        return updated;
      });
    }

    // 2. Process Quest log updates
    if (room.questUpdates && room.questUpdates.length > 0) {
      setQuests(prev => {
        const updated = [...prev];
        room.questUpdates.forEach(update => {
          const existingIdx = updated.findIndex(q => q.name.toLowerCase() === update.name.toLowerCase());
          if (existingIdx > -1) {
            // Update status & reason
            updated[existingIdx].status = update.status;
            updated[existingIdx].reason = update.reason;
          } else {
            // Insert brand new active quest
            updated.push({
              name: update.name,
              status: update.status,
              reason: update.reason
            });
          }
        });
        return updated;
      });
    }

    // 3. Process Character cosmetic changes
    if (room.characterDescriptionUpdate && room.characterDescriptionUpdate.trim() !== "") {
      setCharacterDescription(room.characterDescriptionUpdate);
    }
  };

  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim()) return;
    handleNextStep(customAction.trim());
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentRoom(null);
    setStoryLog([]);
    setInventory([]);
    setQuests([]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-500 overflow-hidden">
      
      {/* 1. TOP HEADER / CORE NAV SECTION */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-tight select-none bg-gradient-to-r from-slate-100 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
              Choose Your Own Adventure
            </h1>
            <p className="text-xs text-slate-400 font-mono">D&D Core Engine v3.5</p>
          </div>
        </div>

        {/* Global Connection / Mode Status pill */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${apiKeyConfigured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
            <span className="text-slate-300 font-medium">
              {apiKeyConfigured ? "Gemini Neural DM Online" : "Sandbox Mode (Offline)"}
            </span>
          </div>

          {isPlaying && (
            <button 
              onClick={handleReset}
              className="text-xs flex items-center gap-2 bg-rose-950/40 text-rose-300 border border-rose-950 hover:bg-rose-900/30 px-3 py-1.5 rounded-lg font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retreat Home
            </button>
          )}
        </div>
      </header>

      {/* 2. CORE INTERFACE CONTAINER */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* A. CUSTOMIZER Setup Page */}
          {!isPlaying ? (
            <motion.div 
              id="setup-screen"
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Infinite Narrative Engine
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Forge Your Unending Chronicle
                </h2>
                <p className="text-slate-400 text-sm md:text-base">
                  Configure your starting origin, environmental background, and art guidelines. The AI will weave a continuous, fully responsive plot customized directly to your decisions.
                </p>
              </div>

              {/* API warning box if unconfigured */}
              {!apiKeyConfigured && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start max-w-3xl mx-auto shadow-inner">
                  <div className="bg-amber-950/80 p-2 rounded-lg border border-amber-500/30 text-amber-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-200">Sandbox Engine Selected</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No Gemini API key was detected in your workspace secrets. Real-time neural divergence and neural-painting are temporarily offline. Play in our pre-designed **Offline Sandbox Mode** or configure a secret key in AI Studio settings to unlock full infinite universe capabilities.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-800/60 shadow-xl max-w-4xl mx-auto">
                
                {/* Panel Left: Character Stats */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" /> Character Configuration
                  </h3>

                  {/* Character Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 flex justify-between">
                      PROTAGONIST NAME <span>*</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        id="character-name-input"
                        type="text"
                        maxLength={20}
                        value={characterName}
                        onChange={(e) => setCharacterName(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-700 outline-none transition-all font-medium"
                        placeholder="Enter hero name..."
                        required
                      />
                      <button 
                        type="button"
                        onClick={rollRandomName}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-all"
                        title="Roll random name"
                      >
                        <Dice5 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Class Selection Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">ARCHETYPE / CLASS</label>
                    <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {CLASSES.map((cls) => (
                        <button
                          key={cls.name}
                          type="button"
                          onClick={() => setSelectedClass(cls.name)}
                          className={`text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1 relative overflow-hidden ${
                            selectedClass === cls.name 
                              ? "bg-indigo-500/10 border-indigo-500 text-slate-100 shadow-[0_0_10px_rgba(99,102,241,0.1)]" 
                              : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:bg-slate-900/40"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-slate-200 text-sm">{cls.name}</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono font-medium">
                              {cls.weapon}
                            </span>
                          </div>
                          <span className="text-slate-400 leading-normal">{cls.perk}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character Custom Background (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 flex justify-between">
                      BACKGROUND BIOGRAPHY <span className="text-slate-600 font-mono">OPTIONAL</span>
                    </label>
                    <textarea 
                      id="bg-biography-input"
                      value={backgroundStory}
                      onChange={(e) => setBackgroundStory(e.target.value)}
                      rows={2}
                      maxLength={180}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-700 outline-none transition-all resize-none"
                      placeholder="e.g. Seeking a lost family heirloom, or fleeing an elite squad of high-tech assassins..."
                    />
                  </div>
                </div>

                {/* Panel Right: Setting & Theme Parameters */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" /> Universe & Aesthetics
                  </h3>

                  {/* Universe / Genre Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">UNIVERSE SETTING</label>
                    <div className="grid grid-cols-1 gap-2">
                      {GENRES.map((gen) => (
                        <button
                          key={gen.name}
                          type="button"
                          onClick={() => {
                            setSelectedGenre(gen.name);
                            // Avoid layout locking if setting requires API key, let them see info
                          }}
                          className={`text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1 ${
                            selectedGenre === gen.name 
                              ? "bg-purple-500/10 border-purple-500 text-slate-100 shadow-[0_0_10px_rgba(168,85,247,0.1)]" 
                              : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:bg-slate-900/40"
                          }`}
                        >
                          <span className="font-bold text-slate-200 text-xs">{gen.name}</span>
                          <span className="text-slate-400 select-none leading-relaxed">{gen.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Illustration Art Style Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">VISUAL ART STYLE FOR ART</label>
                    <div className="relative">
                      <select
                        id="art-style-select"
                        value={selectedArtStyle}
                        onChange={(e) => setSelectedArtStyle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        {ART_STYLES.map((style) => (
                          <option key={style.name} value={style.name} className="bg-slate-950">
                            {style.name} ({style.descriptor})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Our real-time neural sketcher will apply this design prompt to all generated scene visual backdrops.
                      </p>
                    </div>
                  </div>

                  {/* Offline sandbox toggle */}
                  {apiKeyConfigured && (
                    <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                        SYSTEM ENGINE
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEngineMode("ai")}
                          className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                            engineMode === "ai" 
                              ? "bg-slate-900 border-slate-700 text-indigo-400 shadow-sm"
                              : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Gemini Neural
                        </button>
                        <button
                          type="button"
                          onClick={() => setEngineMode("sandbox")}
                          className={`flex-1 py-1.5 rounded text-xs font-semibold border transition-all ${
                            engineMode === "sandbox" 
                              ? "bg-slate-900 border-slate-700 text-amber-400 shadow-sm"
                              : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Offline Sandbox
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trigger button */}
              <div className="flex flex-col items-center gap-3 py-4">
                <button
                  id="start-journey-button"
                  onClick={handleStartGame}
                  disabled={storyLoading || !characterName.trim()}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer tracking-wide"
                >
                  {storyLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Consulting the Cosmos...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Embarque on Journey
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                  CREATED UNDER LICENSE SHARED PERMISSIONS INTER-CHRONICLE
                </span>
              </div>
            </motion.div>
          ) : (
            
            /* B. LIVE GAMEPLAY DASHBOARD */
            <motion.div 
              id="gameplay-dashboard"
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full"
            >

              {/* L1. CENTRAL NARRATIVE COLUMN */}
              <div className="flex-1 flex flex-col bg-slate-950 border-r border-slate-900 overflow-hidden relative">
                
                {/* Visual Canvas Backdrop */}
                <div className="h-[220px] md:h-[300px] bg-slate-900 relative border-b border-slate-900 overflow-hidden shrink-0">
                  
                  {/* Dynamic painting loader */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-3 px-4">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                      <p className="text-xs font-mono text-indigo-300 animate-pulse text-center leading-normal">
                        "The neural sketcher is rendering: '{currentRoom?.imagePrompt.slice(0, 40)}'..."
                      </p>
                    </div>
                  )}

                  {/* Fallback pattern frame if image missing, else image itself */}
                  {sceneImageUrl ? (
                    <img 
                      id="scene-illustration"
                      src={sceneImageUrl} 
                      alt="Adventure illustration path" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-opacity duration-700"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500"
                      style={{ background: getFallbackArtGradient(selectedGenre, selectedArtStyle, currentRoom?.imagePrompt || "fantasy") }}
                    >
                      <Sparkles className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
                      <p className="text-xs font-mono max-w-md italic select-none">
                        Rendering beautiful static conceptual elements...
                      </p>
                    </div>
                  )}

                  {/* Art Style floating badge */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5 select-none shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Style: {selectedArtStyle.replace("Illustration", "").replace("Digital Art", "")}
                  </div>

                  {/* Genre floating background icon indicator */}
                  <div className="absolute top-3 right-3 opacity-20">
                    <Map className="w-12 h-12 text-slate-400 rotate-12" />
                  </div>
                </div>

                {/* Dynamic warning if engine error occured */}
                {errorMessage && (
                  <div className="bg-rose-950/75 border-b border-rose-900/50 text-rose-200 text-xs px-4 py-2.5 flex justify-between items-center z-20 shrink-0">
                    <span className="font-semibold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      {errorMessage}
                    </span>
                    <button 
                      onClick={() => setErrorMessage(null)}
                      className="text-[10px] uppercase font-bold text-slate-400 hover:text-white px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* THE CHRONICLE / READING STORY AREA */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
                  
                  {/* Previous Chronicle memory (Collapsible history of interactions) */}
                  {storyLog.length > 1 && (
                    <div className="space-y-4 opacity-50 hover:opacity-100 transition-opacity duration-300 pb-4 border-b border-slate-900/60">
                      <div className="flex items-center gap-2 text-xs font-semibold font-mono text-slate-400 uppercase tracking-widest select-none">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        Memory Log ({storyLog.length - 1} interactions prior)
                      </div>
                      
                      <div className="text-xs space-y-3.5 max-h-[140px] overflow-y-auto pr-2 scrollbar-thin">
                        {storyLog.slice(0, -1).map((log, index) => (
                          <div key={index} className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
                            <p className="font-semibold text-indigo-300 mb-1">
                              » Player chose: "{log.choiceMade}"
                            </p>
                            <p className="text-slate-400 leading-relaxed italic line-clamp-2">
                              {log.storyText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE PASSAGE (Staggered Animation) */}
                  <AnimatePresence mode="wait">
                    {currentRoom && (
                      <motion.div
                        key={currentRoom.storyText.substring(0, 30)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        {/* Story Body Paragraphs */}
                        <div id="story-text" className="text-slate-200 text-sm md:text-base leading-relaxed space-y-4 font-normal tracking-wide">
                          {currentRoom.storyText.split("\n\n").map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>

                        {/* Recent inventory updates log inside chat */}
                        {currentRoom.inventoryUpdates && currentRoom.inventoryUpdates.length > 0 && (
                          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/50 flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
                              Inventory Update Notes
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {currentRoom.inventoryUpdates.map((item, idx) => (
                                <div key={idx} className="flex gap-2.5 items-center text-xs">
                                  {item.action === "add" ? (
                                    <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-emerald-500/20">
                                      + ARRIVED
                                    </span>
                                  ) : (
                                    <span className="bg-rose-900/30 text-rose-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-rose-500/20">
                                      - EXPENDED
                                    </span>
                                  )}
                                  <span className="text-slate-200 font-semibold">{item.name}</span>
                                  <span className="text-[10px] text-slate-500">({item.reason})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent quest updates log inside chat */}
                        {currentRoom.questUpdates && currentRoom.questUpdates.length > 0 && (
                          <div className="bg-indigo-950/15 p-3.5 rounded-xl border border-indigo-900/20 flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider font-mono">
                              Quest Chronicles Log
                            </span>
                            <div className="space-y-2">
                              {currentRoom.questUpdates.map((quest, idx) => (
                                <div key={idx} className="flex gap-2.5 items-center text-xs">
                                  {quest.status === "completed" ? (
                                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-emerald-500/20">
                                      ✓ COMPLETED
                                    </span>
                                  ) : quest.status === "failed" ? (
                                    <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-rose-500/20">
                                      ✗ FAILED
                                    </span>
                                  ) : (
                                    <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-indigo-500/20">
                                      ★ UNLOCKED
                                    </span>
                                  )}
                                  <span className="text-slate-200 font-semibold">{quest.name}</span>
                                  <span className="text-[10px] text-slate-500">({quest.reason})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Calculation status message spinner */}
                  {storyLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-900 max-w-sm"
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-slate-300 animate-spin" />
                      <span className="text-xs font-mono text-slate-400 animate-pulse">
                        Calculating cosmic timeline divergence...
                      </span>
                    </motion.div>
                  )}

                  <div ref={chronicleEndRef} />
                </div>

                {/* THE OPTIONS & CUSTOM CHOICE INPUT BOARD */}
                <div className="border-t border-slate-900 bg-slate-900/40 px-6 py-5 space-y-4 shrink-0">
                  
                  {/* Option Choice Buttons */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentRoom && !storyLoading && currentRoom.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleNextStep(opt.text)}
                        className={`text-left p-3.5 rounded-xl border text-xs text-slate-300 font-medium transition-all duration-200 flex items-center justify-between hover:translate-x-1 hover:text-white cursor-pointer select-none outline-none group bg-slate-950/60 border-slate-900/80 hover:border-indigo-500/40 hover:bg-slate-900/50 shadow-sm`}
                      >
                        <div className="flex gap-3 items-center">
                          <span className="w-5 h-5 rounded-md bg-slate-900 text-indigo-400 font-semibold flex items-center justify-center font-mono text-[10px] border border-slate-800">
                            {oIdx + 1}
                          </span>
                          <div className="flex flex-col sm:flex-row sm:gap-2">
                            <span className="font-semibold text-slate-100">{opt.description}:</span>
                            <span className="text-slate-300 group-hover:text-slate-100">{opt.text}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>

                  {/* Fully custom wild text input action */}
                  <form onSubmit={handleCustomActionSubmit} className="flex gap-2">
                    <input 
                      id="custom-action-input"
                      type="text"
                      maxLength={120}
                      disabled={storyLoading}
                      value={customAction}
                      onChange={(e) => setCustomAction(e.target.value)}
                      placeholder="Or write any wild action! What else do you try?"
                      className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs leading-none text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium disabled:opacity-40"
                    />
                    <button 
                      type="submit"
                      disabled={storyLoading || !customAction.trim()}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-950 disabled:border-slate-900 disabled:text-slate-700 disabled:cursor-not-allowed text-white w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>


              {/* L2. SIDEBAR PANELS (Inventory & Quests) */}
              <div className="w-full lg:w-[320px] bg-slate-950 flex flex-col shrink-0">
                
                {/* Tabs to switch panels on smaller screens */}
                <div className="flex border-b border-slate-900 justify-between px-2 bg-slate-900/20 shrink-0">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`flex-1 py-3 text-xs font-bold leading-none tracking-wider uppercase border-b-2 text-center transition-all ${
                      activeTab === "current" ? "text-indigo-400 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    STATUS
                  </button>
                  <button
                    onClick={() => setActiveTab("journal")}
                    className={`flex-1 py-3 text-xs font-bold leading-none tracking-wider uppercase border-b-2 text-center transition-all ${
                      activeTab === "journal" ? "text-indigo-400 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    QUEST LOG ({quests.length})
                  </button>
                </div>

                {/* TAB WINDOWS */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                  
                  {/* Tab B1: Status Page */}
                  {activeTab === "current" && (
                    <div className="space-y-6">
                      
                      {/* Character Card info banner */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 relative overflow-hidden shadow-sm">
                        <div className="absolute top-2 right-2 opacity-10">
                          <Crown className="w-10 h-10 text-indigo-400 rotate-12" />
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 font-mono">
                          PLAYER PROTOCOL
                        </span>
                        <h4 className="text-white font-extrabold text-base leading-tight mt-1">{characterName}</h4>
                        <p className="text-xs text-slate-300 mt-1 font-semibold">{selectedClass}</p>
                        <p className="text-[10px] text-slate-400 italic mt-2 border-t border-slate-800/60 pt-2 leading-relaxed">
                          {characterDescription}
                        </p>
                      </div>

                      {/* DYNAMIC PLAYER INVENTORY SIDEBAR */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                          BAG / INVENTORY ({inventory.length})
                        </span>

                        <div className="space-y-2 h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                          {inventory.length === 0 ? (
                            <div className="text-center py-8 rounded-lg border border-dashed border-slate-900/80 text-xs text-slate-600 italic select-none">
                              Pouch remains hollow & empty
                            </div>
                          ) : (
                            inventory.map((item) => {
                              const ItemIcon = getItemIcon(item.name);
                              return (
                                <div 
                                  key={item.id} 
                                  className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-900/20 text-xs group hover:border-slate-800 transition-all"
                                >
                                  <div className="flex gap-2.5 items-center">
                                    <div className="w-7 h-7 rounded-md bg-slate-950 flex items-center justify-center border border-slate-900 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                                      <ItemIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold text-slate-200">{item.name}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-500">{item.acquiredAt}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Tab B2: Quest log tab */}
                  {activeTab === "journal" && (
                    <div className="space-y-4 h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
                        DYNAMIC CHRONICLE QUESTS
                      </span>

                      {quests.length === 0 ? (
                        <div className="text-center py-10 rounded-lg border border-dashed border-slate-900/80 text-xs text-slate-600 italic select-none">
                          No quests documented yet.
                        </div>
                      ) : (
                        quests.map((quest, qIdx) => (
                          <div 
                            key={qIdx} 
                            className={`p-3.5 rounded-xl border text-xs space-y-2 leading-relaxed transition-all shadow-sm ${
                              quest.status === "completed" 
                                ? "bg-emerald-950/10 border-emerald-900/40 text-slate-300"
                                : quest.status === "failed" 
                                  ? "bg-rose-950/10 border-rose-900/40 text-slate-400"
                                  : "bg-slate-900/50 border-slate-900 text-slate-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-100">{quest.name}</span>
                              {quest.status === "completed" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Done
                                </span>
                              ) : quest.status === "failed" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase">
                                  <XCircle className="w-2.5 h-2.5" /> Failed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase animate-pulse">
                                  <Play className="w-2 h-2 fill-current" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{quest.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
