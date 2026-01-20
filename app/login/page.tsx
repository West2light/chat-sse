"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

export default function LoginPage() {
  const { login, loading, error, isAppLoggedIn } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Auto-login for public access
    const autoLogin = async () => {
      try {
        await login()
      } catch (err) {
        console.error("Auto-login failed:", err)
      }
    }
    autoLogin()
  }, [login])

  useEffect(() => {
    // Redirect to home if logged in
    if (isAppLoggedIn) {
      router.push("/")
    }
  }, [isAppLoggedIn, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            DTPOS AI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hỗ trợ sử dụng hệ thống phần mềm quản lí bán hàng DTPOS
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {loading && (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-gray-600">Đang đăng nhập...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => login()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
