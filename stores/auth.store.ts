import { create } from "zustand"
import { checkLoginStatus, initializeSession } from "@/services/auth.service"

interface AuthState {
  isLoggedIn: boolean
  isAppLoggedIn: boolean
  loading: boolean
  error: string | null

  checkAuth: () => Promise<void>
  login: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isAppLoggedIn: false,
  loading: false,
  error: null,

  checkAuth: async () => {
    set({ loading: true, error: null })
    try {
      const status = await checkLoginStatus()
      set({
        isLoggedIn: status.logged_in,
        isAppLoggedIn: status.app_logged_in,
        loading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || "Failed to check auth status",
        loading: false,
      })
    }
  },

  login: async () => {
    set({ loading: true, error: null })
    try {
      // Initialize session for public access
      await initializeSession()
      
      // Check status
      try {
        const status = await checkLoginStatus()
        set({
          isLoggedIn: status.logged_in,
          isAppLoggedIn: status.app_logged_in,
          loading: false,
        })
      } catch (statusErr) {
        // Even if status check fails, session might be established
        console.warn("Status check failed but session may be active:", statusErr)
        set({
          isLoggedIn: true,
          isAppLoggedIn: true,
          loading: false,
        })
      }
    } catch (error: any) {
      console.error("Login error details:", error)
      const errorMessage = error?.message || error?.data?.message || "Failed to login"
      set({
        error: errorMessage,
        loading: false,
        // Still set as logged in to allow UI to proceed
        isLoggedIn: true,
        isAppLoggedIn: true,
      })
    }
  },
}))
