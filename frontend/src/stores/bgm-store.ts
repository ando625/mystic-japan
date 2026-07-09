"use client";

import { create } from "zustand";
import type { Spot } from "@/types/domain";

// アプリ全体で再生するBGMの1曲分の情報です。
export type BgmTrack = {
  // app-homeやspot-1のように、再生中判定に使う一意なIDです。
  id: string;
  // アプリ共通BGMか、スポット専用BGMかを区別します。
  kind: "app" | "spot";
  title: string;
  subtitle?: string;
  src: string;
  artworkUrl?: string | null;
};

// BGMプレイヤーの状態を全画面で共有するZustand storeです。
type BgmState = {
  // 現在選択されている曲です。nullなら何も選択されていません。
  currentTrack: BgmTrack | null;
  // 再生中かどうかです。実際のaudio要素はAppBgmPlayer側でこの値を見ます。
  isPlaying: boolean;
  // ユーザーが明示的に停止したかどうかです。自動再生の扱いを判断するために使います。
  userPaused: boolean;
  volume: number;
  // 任意の曲を再生します。ホームBGMなどに使います。
  playTrack: (track: BgmTrack) => void;
  // スポット詳細で、そのスポットのmusic_urlを再生します。
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
    // music_urlがないスポットでは再生せず、BGM準備中の表示に任せます。
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
