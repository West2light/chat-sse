import { create } from "zustand"
import { getSiteConfig } from "@/services/site.service"

interface SiteState {
  iconUrl: string
  title: string
  description: string
  chatColorTheme: string
  loading: boolean

  fetchSiteConfig: () => Promise<void>
}

export const useSiteStore = create<SiteState>((set) => ({
  iconUrl: "",
  title: "DTPOS AI",
  description: "",
  chatColorTheme: "#781a1a",
  loading: false,

  fetchSiteConfig: async () => {
    set({ loading: true })
    try {
      const config = await getSiteConfig()
      set({
        iconUrl: config.site?.icon_url || "",
        title: config.site?.title || "DTPOS AI",
        description: config.site?.description || "",
        chatColorTheme: config.site?.chat_color_theme || "#781a1a",
        loading: false,
      })
    } catch (error) {
      console.error("Failed to fetch site config:", error)
      set({ loading: false })
    }
  },
}))
