// Context for managing application state
'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Product, ProductFilters, Statistics, CategoryCount } from '@/types'

interface AppState {
  // Products
  products: Product[]
  selectedProduct: Product | null
  productFilters: ProductFilters
  productsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Analytics
  statistics: Statistics | null
  categoryStats: CategoryCount[]
  
  // UI State
  activeTab: string
  loading: {
    products: boolean
    statistics: boolean
    categories: boolean
  }
  
  // Modals & Forms
  modals: {
    productForm: boolean
    confirmDelete: boolean
    imageUpload: boolean
  }
  
  // User
  user: {
    id: string
    name: string
    email: string
  } | null
}

type AppAction = 
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product | null }
  | { type: 'SET_PRODUCT_FILTERS'; payload: ProductFilters }
  | { type: 'SET_PRODUCTS_PAGINATION'; payload: AppState['productsPagination'] }
  | { type: 'SET_STATISTICS'; payload: Statistics }
  | { type: 'SET_CATEGORY_STATS'; payload: CategoryCount[] }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_MODAL'; payload: { modal: keyof AppState['modals']; open: boolean } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_USER'; payload: AppState['user'] }

const initialState: AppState = {
  products: [],
  selectedProduct: null,
  productFilters: {
    page: 1,
    limit: 12,
    isActive: true, // Default to showing only active products
  },
  productsPagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  statistics: null,
  categoryStats: [],
  activeTab: 'dashboard',
  loading: {
    products: false,
    statistics: false,
    categories: false,
  },
  modals: {
    productForm: false,
    confirmDelete: false,
    imageUpload: false,
  },
  user: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload }
    
    case 'SET_PRODUCT_FILTERS':
      return { ...state, productFilters: action.payload }
    
    case 'SET_PRODUCTS_PAGINATION':
      return { ...state, productsPagination: action.payload }
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload }
    
    case 'SET_CATEGORY_STATS':
      return { ...state, categoryStats: action.payload }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    
    case 'SET_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.open,
        },
      }
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [action.payload, ...state.products],
      }
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      }
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      }
    
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Custom hooks for specific functionality
export function useProducts() {
  const { state, dispatch } = useAppContext()
  
  return {
    products: state.products,
    filters: state.productFilters,
    pagination: state.productsPagination,
    loading: state.loading.products,
    selectedProduct: state.selectedProduct,
    setProducts: (products: Product[]) => dispatch({ type: 'SET_PRODUCTS', payload: products }),
    setFilters: (filters: ProductFilters) => dispatch({ type: 'SET_PRODUCT_FILTERS', payload: filters }),
    setPagination: (pagination: AppState['productsPagination']) => dispatch({ type: 'SET_PRODUCTS_PAGINATION', payload: pagination }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: { key: 'products', value: loading } }),
    setSelectedProduct: (product: Product | null) => dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product }),
    addProduct: (product: Product) => dispatch({ type: 'ADD_PRODUCT', payload: product }),
    updateProduct: (product: Product) => dispatch({ type: 'UPDATE_PRODUCT', payload: product }),
    deleteProduct: (id: string) => dispatch({ type: 'DELETE_PRODUCT', payload: id }),
  }
}

export function useAnalytics() {
  const { state, dispatch } = useAppContext()
  
  return {
    statistics: state.statistics,
    categoryStats: state.categoryStats,
    loading: state.loading.statistics,
    setStatistics: (stats: Statistics) => dispatch({ type: 'SET_STATISTICS', payload: stats }),
    setCategoryStats: (stats: CategoryCount[]) => dispatch({ type: 'SET_CATEGORY_STATS', payload: stats }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: { key: 'statistics', value: loading } }),
  }
}

export function useNavigation() {
  const { state, dispatch } = useAppContext()
  
  return {
    activeTab: state.activeTab,
    setActiveTab: (tab: string) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
  }
}

export function useModals() {
  const { state, dispatch } = useAppContext()
  
  return {
    modals: state.modals,
    openModal: (modal: keyof AppState['modals']) => dispatch({ type: 'SET_MODAL', payload: { modal, open: true } }),
    closeModal: (modal: keyof AppState['modals']) => dispatch({ type: 'SET_MODAL', payload: { modal, open: false } }),
  }
}
