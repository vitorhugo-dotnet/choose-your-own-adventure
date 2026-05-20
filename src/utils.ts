import { 
  Key, 
  Sword, 
  Shield, 
  BookOpen, 
  Gem, 
  FlaskConical, 
  Cpu, 
  Compass, 
  Gamepad2, 
  Eye, 
  CheckCircle2, 
  Play, 
  XCircle,
  Skull,
  Coins,
  Map,
  Wand2,
  Compass as CompassIcon,
  Crown
} from "lucide-react";
import React from 'react';
import { AdventureState } from "./types";

/**
 * Dynamically picks an elegant Lucide icon depending on the item's name.
 */
export function getItemIcon(itemName: string) {
  const name = itemName.toLowerCase();
  
  if (name.includes("key") || name.includes("passcard") || name.includes("card")) return Key;
  if (name.includes("sword") || name.includes("dagger") || name.includes("blade") || name.includes("spear") || name.includes("sabre") || name.includes("weapon")) return Sword;
  if (name.includes("shield") || name.includes("buckler") || name.includes("armor") || name.includes("mail")) return Shield;
  if (name.includes("book") || name.includes("scroll") || name.includes("journal") || name.includes("ledger") || name.includes("map") || name.includes("parchment")) return BookOpen;
  if (name.includes("gem") || name.includes("amulet") || name.includes("ring") || name.includes("necklace") || name.includes("jewel") || name.includes("ruby") || name.includes("relic")) return Gem;
  if (name.includes("potion") || name.includes("flask") || name.includes("bottle") || name.includes("elixir") || name.includes("poison") || name.includes("vial")) return FlaskConical;
  if (name.includes("chip") || name.includes("cpu") || name.includes("hologram") || name.includes("scanner") || name.includes("device") || name.includes("cyber") || name.includes("gadget")) return Cpu;
  if (name.includes("coin") || name.includes("gold") || name.includes("silver") || name.includes("credit") || name.includes("money")) return Coins;
  if (name.includes("wand") || name.includes("staff") || name.includes("scepter") || name.includes("relic")) return Wand2;
  if (name.includes("crown") || name.includes("tiara") || name.includes("sceptre")) return Crown;
  
  return Compass; // Default item icon
}

/**
 * Pick a color scheme and custom CSS gradient matching the selected genre.
 */
export function getGenreTheme(genre: string) {
  switch (genre) {
    case "High Fantasy":
      return {
        accent: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
        accentSolid: "bg-emerald-500 hover:bg-emerald-600 text-slate-950",
        ring: "focus:ring-emerald-500",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        bgStyle: "from-slate-950 via-emerald-950/20 to-slate-950"
      };
    case "Cyberpunk Dystopia":
      return {
        accent: "text-rose-400 bg-rose-950/40 border-rose-500/30",
        accentSolid: "bg-rose-500 hover:bg-rose-600 text-slate-950",
        ring: "focus:ring-rose-500",
        glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        bgStyle: "from-slate-950 via-rose-950/20 to-slate-950"
      };
    case "Cosmic Horror":
      return {
        accent: "text-violet-400 bg-violet-950/40 border-violet-500/30",
        accentSolid: "bg-violet-500 hover:bg-violet-600 text-slate-950",
        ring: "focus:ring-violet-500",
        glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]",
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        bgStyle: "from-slate-950 via-purple-950/20 to-slate-950"
      };
    case "Steampunk Era":
      return {
        accent: "text-amber-400 bg-amber-950/40 border-amber-500/30",
        accentSolid: "bg-amber-500 hover:bg-amber-600 text-slate-950",
        ring: "focus:ring-amber-500",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        bgStyle: "from-slate-950 via-amber-950/20 to-slate-950"
      };
    case "Post-Apocalyptic Slum":
      return {
        accent: "text-orange-400 bg-orange-950/40 border-orange-500/30",
        accentSolid: "bg-orange-500 hover:bg-orange-600 text-slate-950",
        ring: "focus:ring-orange-500",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        bgStyle: "from-slate-950 via-orange-950/20 to-slate-950"
      };
    default:
      return {
        accent: "text-slate-400 bg-slate-950/40 border-slate-500/30",
        accentSolid: "bg-slate-200 hover:bg-slate-300 text-slate-950",
        ring: "focus:ring-slate-500",
        glow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        bgStyle: "from-slate-950 via-slate-900 to-slate-950"
      };
  }
}

/**
 * Procedurally returns an SVG background pattern if image rendering is skipped or disabled
 */
export function getFallbackArtGradient(genre: string, artStyle: string, seedWord: string) {
  const seed = seedWord.length;
  const colors = [
    ["#1e293b", "#0f172a"], // slate
    ["#064e3b", "#022c22"], // emerald
    ["#881337", "#4c0519"], // rose
    ["#581c87", "#3b0764"], // violet
    ["#78350f", "#451a03"], // amber
  ];
  
  const selectedIdx = seed % colors.length;
  const gradient = colors[selectedIdx];
  return `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
}

/**
 * Rich, preloaded local adventure script for "Sandbox Offline Mode".
 * This gives players a high-fidelity experience even if their Gemini API Key is unconfigured!
 */
export function getSandboxRoom(choice: string | null, config: { characterName: string, characterClass: string, genre: string }): AdventureState {
  const name = config.characterName;
  const cClass = config.characterClass;
  const genre = config.genre;

  // Starting Room
  if (!choice) {
    return {
      storyText: `Welcome to the Sandbox Chronicles. You find yourself at the dangerous onset of your journey. 

You are **${name}**, a skilled **${cClass}**. Staring out through the dust-streaked atmosphere, the sky resembles bruised iron. Above, a giant monolith looms in the distance—the heart of the legendary Forge. 

To your left expands a narrow obsidian ravine shimmering with toxic energy. To your right sits a decaying trading shelter smelling of ozone and charcoal. Your main goal is clear: discover what lies beneath the spire.`,
      options: [
        { text: "Investigate the decaying trading shelter", description: "Search for supplies" },
        { text: "Rappel down the obsidian ravine", description: "Take the risk" },
        { text: "Approach the massive monolith gates directly", description: "Charge frontside" }
      ],
      inventoryUpdates: [
        { name: "Iron Lantern", action: "add", reason: "Found hanging at the starting gateway." },
        { name: "Survival Rations", action: "add", reason: "Tucked inside your belt pouch." }
      ],
      questUpdates: [
        { name: "Reach the Core Spire", status: "active", reason: "You must enter the monolith to uncover your origins." }
      ],
      imagePrompt: `A magnificent wide shot of ${name} the ${cClass} standing before a gargantuan dark metal monolith under a bruised sky, high-contrast atmospheric concept art.`
    };
  }

  const choiceLower = choice.toLowerCase();

  // Route 1: Decaying shelter
  if (choiceLower.includes("shelter")) {
    return {
      storyText: `You quietly step inside the crumbling awning of the trading outpost. Dust particles dance in the faint light. 

A silent merchant sits behind a counter made of welded pipes. As you approach, the cloaked figure motions silently toward a rusted lockbox embedded in the wall. Beside them lies a discarded leather scabbard. 

"The wind speaks of a climber," the merchant mutters, their voice like gravel. "Take what you need, but leave a token."`,
      options: [
        { text: "Use your lockpicking skills on the metal box", description: "Rely on stealth" },
        { text: "Trade your Survival Rations for the rusted scabbard", description: "Interact peacefully" },
        { text: "Leave the shelter and head towards the ravine", description: "Retreat to safety" }
      ],
      inventoryUpdates: [
        { name: "Battered Silver Key", action: "add", reason: "Discovered resting behind the counter." }
      ],
      questUpdates: [
        { name: "Investigate Outpost", status: "completed", reason: "You met the silent merchant of the wasteland shelter." }
      ],
      imagePrompt: `An atmospheric dim shelter with dust particles floating in the light beams, showing a mysterious cloaked merchant gesturing to a rusted wall locker.`
    };
  }

  // Route 2: Ravine
  if (choiceLower.includes("ravine") || choiceLower.includes("rappel")) {
    return {
      storyText: `You anchor your rope with steel spikes and slide carefully into the deep granite ravine. The ambient temperature drops rapidly, and the air smells strongly of brimstone and mineral salts.

At the bottom, you notice bright crystalline fractures embedded in the dark rock walls. One peculiar cluster pulses with a gentle jade light. 

Suddenly, a low, tectonic growl vibrates through the canyon floor. A landslide is imminent, or worse—something is waking up underneath the bedrock.`,
      options: [
        { text: "Chisel out the glowing jade crystal", description: "Acquire raw magic" },
        { text: "Sprint towards the crack in the far wall", description: "Seek instant shelter" },
        { text: "Climb back up as quickly as possible", description: "Abandon descent" }
      ],
      inventoryUpdates: [
        { name: "obsidian Rope Anchor", action: "remove", reason: "Rope snapped and anchored high above." }
      ],
      questUpdates: [
        { name: "Survive Ravine Descents", status: "active", reason: "The rumbling canyon poses immediate threat to life." }
      ],
      imagePrompt: `Deep rocky obsidian canyon with green crystalline glowing veins, a lone adventurer looking miniscule under high sheer dark cliffs.`
    };
  }

  // Route 3: Gates / Spire
  if (choiceLower.includes("monolith") || choiceLower.includes("gates") || choiceLower.includes("approach")) {
    return {
      storyText: `You march directly to the gargantuan stone-and-metal gates of the monolith. Heavy magnetic fields hum through the dark metal pillars, making your hairs stand on end.

Two hollow sockets flank the entryway, where power spheres originally sat. One socket is cold and empty; the other holds a cracked cobalt stone emitting faint static pulses. 

An engraving on the gate reads: *"Only the balanced key or the star's blood shall command access."*`,
      options: [
        { text: "Place the Iron Lantern in the empty hollow socket", description: "A makeshift seal" },
        { text: "Force the lock mechanism with raw strength", description: "Brute force entry" },
        { text: "Search the rubble piles around the gate base", description: "Scavenge area" }
      ],
      inventoryUpdates: [],
      questUpdates: [
        { name: "Open the Monolith Gates", status: "active", reason: "You must solve the socket riddle to breach the monolith." }
      ],
      imagePrompt: `Gargantuan stone monolith gates, high-voltage fields glowing with crackling electric blue arcs between tall iron pillars.`
    };
  }

  // Fallbacks for nested branches
  return {
    storyText: `Your quick action: "${choice}" leads details of your journey further into unknown territories!

The local rumors swirl of your bold feat. You uncover a hidden subterranean tunnel heading ever deeper. The atmospheric density increases, and a glowing light guides your path forward. Under your feet, gears click into place. What is your next tactical move, ${config.characterClass}?`,
    options: [
      { text: "Deepen the expedition downwards", description: "Explore lower vaults" },
      { text: "Establish a defensive campsite", description: "Rest and recover" },
      { text: "Return to the gateway terminal", description: "Return of the scout" }
    ],
    inventoryUpdates: [
      { name: "Ancient Brass Coin", action: "add", reason: "Spotted gleaming under a mossy step." }
    ],
    questUpdates: [
      { name: "Explore Deeper Vaults", status: "active", reason: "A hidden doorway has unlocked a long-sealed dungeon pathway." }
    ],
    imagePrompt: `A mysterious dark stone gateway covered in glowing yellow runes, opening to a wide underground staircase.`
  };
}
