"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlockSpot, visitSpot } from "@/lib/api";
import { useProgressStore } from "@/stores/progress-store";
import type { Spot } from "@/types/domain";

type UseSpotProgressMutationsOptions = {
  spotId: number;
  token?: string | null;
  onUnlockSuccess?: () => void;
};

export function useSpotProgressMutations({ spotId, token, onUnlockSuccess }: UseSpotProgressMutationsOptions) {
  const markSpotUnlocked = useProgressStore((state) => state.markSpotUnlocked);
  const queryClient = useQueryClient();
  const spotQueryKey = ["spot", spotId, token];

  const unlock = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return unlockSpot(spotId, token);
    },
    onSuccess: (result) => {
      onUnlockSuccess?.();
      markSpotUnlocked(spotId, result.gained_points);
      queryClient.setQueryData<Spot>(spotQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          is_unlocked: true,
          unlocked_at: result.user_progress?.unlocked_at ?? result.collection.unlocked_at ?? current.unlocked_at,
          user_progress: {
            ...current.user_progress,
            ...result.user_progress,
            is_unlocked: true,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const visit = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return visitSpot(spotId, token);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<Spot>(spotQueryKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          is_unlocked: true,
          unlocked_at: result.user_progress?.unlocked_at ?? current.unlocked_at,
          visited_at: result.visited_at,
          user_progress: {
            ...current.user_progress,
            ...result.user_progress,
            is_unlocked: true,
            visited_at: result.visited_at,
            stamp_obtained: result.stamp_obtained,
          },
          stamp: current.stamp
            ? {
                ...current.stamp,
                ...result.stamp,
                is_obtained: result.stamp_obtained || current.stamp.is_obtained,
                obtained_at: result.stamp?.obtained_at ?? current.stamp.obtained_at,
              }
            : result.stamp ?? current.stamp,
          stamp_obtained: result.stamp_obtained || current.stamp_obtained,
          obtained_at: result.stamp?.obtained_at ?? current.obtained_at,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["spot", spotId] });
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      queryClient.invalidateQueries({ queryKey: ["stamps"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });

  return { unlock, visit };
}
