import { apiClient } from "@/lib/axios/client"
import { handleAxiosError } from "@/lib/axios/error"
import type { SystemFeatures } from "@/lib/types/system"

export async function getSystemFeatures() {
  try {
    const res = await apiClient.get<SystemFeatures>(
      "/console/api/system-features"
    )
    return res.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}
