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
    <div className="fixed bottom-20 right-3 z-40 max-w-[calc(100vw-1.5rem)] md:right-5">
      <audio key={currentTrack.src} ref={audioRef} loop preload="auto" src={currentTrack.src} />
      <div
        className={cn(
          "flex w-[min(16rem,calc(100vw-1.5rem))] items-center gap-2 rounded-[8px] border border-white/10 bg-black/30 p-2 opacity-80 shadow-[0_0_22px_rgba(15,23,42,0.34)] backdrop-blur-md transition hover:opacity-100",
          currentTrack.kind === "spot" && "border-cyan-200/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]",
        )}
      >
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[7px] border border-white/10 bg-slate-900">
          <Image
            alt=""
            className="object-cover"
            fill
            unoptimized
            onError={() => setArtworkSrc(defaultImage)}
            sizes="36px"
            src={artworkSrc}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-100/62">
            <Volume2 className="h-3 w-3" />
            <span>{currentTrack.subtitle ?? "BGM"}</span>
          </div>
          <p className="truncate text-xs font-semibold text-white/86">{currentTrack.title}</p>
          {playbackBlocked ? <p className="text-[11px] text-violet-100/75">再生ボタンで開始</p> : null}
        </div>
        <button
          aria-label={isPlaying ? "BGMを一時停止" : "BGMを再生"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white/86 transition hover:bg-white/18 hover:text-white"
          onClick={() => (isPlaying ? pause() : resume())}
          type="button"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
