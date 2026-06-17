'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'editor', 'viewer'] },
  { name: 'Products', href: '/products', icon: CubeIcon, roles: ['admin', 'editor'] },
  { name: 'Site Content', href: '/content', icon: PaintBrushIcon, roles: ['admin', 'editor'] },
  { name: 'Categories', href: '/categories', icon: TagIcon, roles: ['admin', 'editor'] },
  { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon, roles: ['admin', 'editor'] },
  { name: 'Enquiries', href: '/enquiries', icon: EnvelopeIcon, roles: ['admin', 'editor'] },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['admin', 'editor', 'viewer'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  // Filter navigation based on user role
  const allowedNavigation = navigation.filter(item => 
    !user || item.roles.includes(user.role)
  )

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-primary-600 text-white">
        <h1 className="text-xl font-bold">Silver Shop Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {allowedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Silver Shop Admin v1.0
        </div>
      </div>
    </div>
  )
}
