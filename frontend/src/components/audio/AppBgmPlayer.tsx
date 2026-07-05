"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { APP_BGM_TRACK } from "@/data/app-bgm";
import { defaultImage } from "@/data/fallback-spots";
import { useBgmStore } from "@/stores/bgm-store";
import { cn } from "@/lib/utils";

const spotDetailPattern = /^\/spots\/\d+(\/|$)/;

export function AppBgmPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [artworkSrc, setArtworkSrc] = useState(APP_BGM_TRACK.artworkUrl ?? defaultImage);
  const {
    currentTrack,
    isPlaying,
    markPlaybackBlocked,
    pause,
    playTrack,
    resume,
    stop,
    userPaused,
    volume,
  } = useBgmStore();

  const isSpotDetail = useMemo(() => spotDetailPattern.test(pathname), [pathname]);

  useEffect(() => {
    if (isSpotDetail) {
      if (currentTrack?.kind === "app") {
        stop();
      }

      return;
    }

    if (currentTrack?.id !== APP_BGM_TRACK.id && !userPaused) {
      playTrack(APP_BGM_TRACK);
    }
  }, [currentTrack?.id, currentTrack?.kind, isSpotDetail, playTrack, stop, userPaused]);

  useEffect(() => {
    setArtworkSrc(currentTrack?.artworkUrl || defaultImage);
  }, [currentTrack?.artworkUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    audio.volume = volume;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    audio
      .play()
      .then(() => setPlaybackBlocked(false))
      .catch(() => {
        setPlaybackBlocked(true);
        markPlaybackBlocked();
      });
  }, [currentTrack, isPlaying, markPlaybackBlocked, volume]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-[calc(100vw-2rem)] md:right-6">
      <audio key={currentTrack.src} ref={audioRef} loop preload="auto" src={currentTrack.src} />
      <div
        className={cn(
          "flex w-[min(22rem,calc(100vw-2rem))] items-center gap-3 rounded-[8px] border border-violet-300/25 bg-slate-950/72 p-3 shadow-[0_0_28px_rgba(139,92,246,0.24)] backdrop-blur-xl",
          currentTrack.kind === "spot" && "border-cyan-200/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]",
        )}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[8px] border border-white/15 bg-slate-900">
          <Image
            alt=""
            className="object-cover"
            fill
            unoptimized
            onError={() => setArtworkSrc(defaultImage)}
            sizes="48px"
            src={artworkSrc}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-cyan-100/70">
            <Volume2 className="h-3.5 w-3.5" />
            <span>{currentTrack.subtitle ?? "BGM"}</span>
          </div>
          <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
          {playbackBlocked ? <p className="text-[11px] text-violet-100/75">再生ボタンで開始</p> : null}
        </div>
        <button
          aria-label={isPlaying ? "BGMを一時停止" : "BGMを再生"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-violet-200/35 bg-violet-500/25 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)] transition hover:bg-violet-400/35"
          onClick={() => (isPlaying ? pause() : resume())}
          type="button"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
