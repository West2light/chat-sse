import { apiClient } from "@/lib/axios/client"
import { handleAxiosError } from "@/lib/axios/error"
import type { SiteConfig } from "@/lib/types/site"

export async function getSiteConfig() {
  try {
    const res = await apiClient.get<SiteConfig>("/site")
    return res.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}
