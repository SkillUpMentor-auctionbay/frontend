"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { blobToDataURL } from "../utils/imageUtils";
import { useAuth } from "./useAuth";


export function useProfilePicture() {
  const { user } = useAuth();

  return useQuery<string, Error>({
    queryKey: ["profile-picture", user?.id],
    queryFn: async () => {
      try {
        const response = await api.get("/api/v1/users/me/profile-picture", {
          responseType: "blob",
        });

        const dataURL = await blobToDataURL(response.data);
        return dataURL;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}