'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthState, LoginCredentials, AuthResponse } from '@/types'
import { authApi, setAuthToken } from '@/lib/api'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const clearStoredAuth = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_refresh_token')
  localStorage.removeItem('auth_user')
  setAuthToken(null)
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from localStorage — but never trust it blindly.
  // The stored token is validated against the backend (/auth/me) before the
  // session is restored; any failure clears the stored auth and logs out.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')

      if (!token || !userStr) {
        clearStoredAuth()
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Set the token so the /auth/me request is authenticated.
      setAuthToken(token)

      try {
        const res = await authApi.getCurrentUser()
        if (!res.success || !res.data || !res.data.role) {
          clearStoredAuth()
          setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null, token: null }))
          return
        }

        // Trust the server's user object over the (possibly stale) stored copy.
        const user = res.data
        localStorage.setItem('auth_user', JSON.stringify(user))

        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        })
      } catch {
        // Token invalid/expired or backend unreachable — do not restore session.
        clearStoredAuth()
        setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null, token: null }))
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await authApi.login(credentials)

      if (!response.success || !response.data) {
        throw new Error('Login failed: invalid response from server')
      }

      const { user, token, refreshToken } = response.data as AuthResponse

      // Require a fully-formed user + token. Never fabricate credentials or
      // default a missing role — a malformed response is a failed login.
      if (!user || !user.email || !user.role || !token) {
        throw new Error('Login failed: invalid user data received from server')
      }

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken)
      }
      localStorage.setItem('auth_user', JSON.stringify(user))

      // Set token in API client
      setAuthToken(token)

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = () => {
    clearStoredAuth()
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('auth_refresh_token')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken(storedRefreshToken)
      if (!response.success || !response.data) {
        throw new Error('Failed to refresh session')
      }

      const { user, token: newToken, refreshToken: newRefreshToken } = response.data as AuthResponse

      if (!user || !user.role || !newToken) {
        throw new Error('Failed to refresh session: invalid response')
      }

      // Update localStorage
      localStorage.setItem('auth_token', newToken)
      if (newRefreshToken) {
        localStorage.setItem('auth_refresh_token', newRefreshToken)
      }
      localStorage.setItem('auth_user', JSON.stringify(user))

      // Set token in API client
      setAuthToken(newToken)

      setAuthState({
        user,
        token: newToken,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
