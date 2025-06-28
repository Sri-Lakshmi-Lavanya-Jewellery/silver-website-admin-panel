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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 AuthContext: Initializing authentication state...')
      
      try {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        console.log('🔍 AuthContext: Checking localStorage:', { 
          hasToken: !!token, 
          hasUser: !!userStr 
        })
        
        if (token && userStr) {
          const user = JSON.parse(userStr)
          console.log('✅ AuthContext: Found stored auth, restoring session for:', { 
            email: user.email, 
            role: user.role,
            roleType: typeof user.role,
            userObject: user
          })
          
          // Validate that the user object has required properties
          if (!user.role) {
            console.warn('⚠️ AuthContext: User object missing role property, logging out...')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_refresh_token')
            localStorage.removeItem('auth_user')
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }))
            return
          }
          
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
          
          // Set token in API client
          setAuthToken(token)
          console.log('🔑 AuthContext: Token restored to API client')
        } else {
          console.log('❌ AuthContext: No stored auth found, user is unauthenticated')
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error('💥 AuthContext: Error during initialization:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    console.log('🔐 AuthContext: Starting login process for:', credentials.email)
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      console.log('🔄 AuthContext: Set loading state to true')
      
      console.log('📡 AuthContext: Making API call to authApi.login...')
      const response = await authApi.login(credentials)
      console.log('✅ AuthContext: Login API response received:', { 
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      })
      
      if (!response.success || !response.data) {
        throw new Error('Login failed: Invalid response from server')
      }
      
      console.log('🔍 AuthContext: Raw API response data:', response.data)
      
      // Handle different possible API response structures
      let userData = response.data as AuthResponse
      let user = userData.user
      let token = userData.token
      let refreshToken = userData.refreshToken
      
      // Check if the response has a different structure
      if (!user && (response.data as any).email) {
        console.log('🔄 AuthContext: API returned user data directly, restructuring...')
        const rawData = response.data as any
        user = {
          id: rawData.id || rawData._id || 'unknown',
          email: rawData.email,
          name: rawData.name || rawData.username || 'Unknown User',
          role: rawData.role || rawData.userRole || 'admin' as const,
          createdAt: rawData.createdAt || new Date().toISOString(),
          updatedAt: rawData.updatedAt || new Date().toISOString(),
        }
        token = rawData.accessToken || rawData.token || 'temp_token'
        refreshToken = rawData.refreshToken || 'temp_refresh_token'
      }
      
      // Ensure role is properly set
      if (user && !user.role) {
        console.warn('⚠️ AuthContext: User role missing, setting default role as admin')
        user = { ...user, role: 'admin' as const }
      }
      
      // Validate required user properties
      if (!user || !user.email || !user.role) {
        console.error('❌ AuthContext: Invalid user data received from API:', user)
        throw new Error('Invalid user data received from server')
      }
      
      console.log('👤 AuthContext: Processed user data:', { 
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : [],
        email: user?.email,
        name: user?.name,
        role: user?.role,
        roleType: typeof user?.role,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken
      })
      
      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_refresh_token', refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(user))
      console.log('💾 AuthContext: Stored tokens and user data in localStorage')
      console.log('💾 AuthContext: Stored user object:', JSON.stringify(user, null, 2))
      
      // Set token in API client
      setAuthToken(token)
      console.log('🔑 AuthContext: Set token in API client')
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
      console.log('✨ AuthContext: Updated auth state - user is now authenticated')
      console.log('✨ AuthContext: Final auth state user role:', user?.role)
      
    } catch (error: any) {
      console.error('❌ AuthContext: Login failed:', error.message || error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }))
      throw error
    }
  }

  const logout = () => {
    console.log('🚪 AuthContext: Starting logout process...')
    
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    console.log('🗑️ AuthContext: Cleared all auth data from localStorage')
    
    // Clear API client token
    setAuthToken(null)
    console.log('🔑 AuthContext: Cleared token from API client')
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
    console.log('✅ AuthContext: User logged out successfully')
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('auth_refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await authApi.refreshToken(refreshToken)
      const { user, token: newToken, refreshToken: newRefreshToken } = response.data as AuthResponse
      
      // Update localStorage
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_refresh_token', newRefreshToken)
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
