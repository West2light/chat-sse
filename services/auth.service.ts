import { apiClient } from "@/lib/axios/client"
import { handleAxiosError } from "@/lib/axios/error"

export async function checkLoginStatus() {
  try {
    const appCode = process.env.NEXT_PUBLIC_APP_CODE
    const res = await apiClient.get<{
      logged_in: boolean
      app_logged_in: boolean
    }>("/login/status", {
      params: {
        app_code: appCode,
      },
    })
    return res.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}

export async function checkAccessMode() {
  try {
    const appCode = process.env.NEXT_PUBLIC_APP_CODE
    const res = await apiClient.get<{
      accessMode: string
    }>("/webapp/access-mode", {
      params: {
        appCode: appCode,
      },
    })
    return res.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}

export async function initializeSession() {
  try {
    // For public access, call /site to establish session
    const res = await apiClient.get("/site")
    return res.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}
