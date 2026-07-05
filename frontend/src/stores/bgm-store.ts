"use client";

import { create } from "zustand";
import type { Spot } from "@/types/domain";

export type BgmTrack = {
  id: string;
  kind: "app" | "spot";
  title: string;
  subtitle?: string;
  src: string;
  artworkUrl?: string | null;
};

type BgmState = {
  currentTrack: BgmTrack | null;
  isPlaying: boolean;
  userPaused: boolean;
  volume: number;
  playTrack: (track: BgmTrack) => void;
  playSpot: (spot: Spot) => void;
  resume: () => void;
  pause: () => void;
  stop: () => void;
  markPlaybackBlocked: () => void;
  setVolume: (volume: number) => void;
};

export const useBgmStore = create<BgmState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  userPaused: false,
  volume: 0.38,
  playTrack: (track) => set({ currentTrack: track, isPlaying: true, userPaused: false }),
  playSpot: (spot) => {
    if (!spot.music_url) {
      return;
    }

    set({
      currentTrack: {
        id: `spot-${spot.id}`,
        kind: "spot",
        title: `${spot.name}のBGM`,
        subtitle: "神域の調べ",
        src: spot.music_url,
        artworkUrl: spot.image_url,
      },
      isPlaying: true,
      userPaused: false,
    });
  },
  resume: () => set({ isPlaying: true, userPaused: false }),
  pause: () => set({ isPlaying: false, userPaused: true }),
  stop: () => set({ currentTrack: null, isPlaying: false }),
  markPlaybackBlocked: () => set({ isPlaying: false }),
  setVolume: (volume) => set({ volume }),
}));
