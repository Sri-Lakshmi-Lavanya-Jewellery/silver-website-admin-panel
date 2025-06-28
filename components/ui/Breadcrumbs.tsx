'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { ComponentType } from 'react'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/inventory': 'Inventory',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

interface BreadcrumbItem {
  label: string
  href: string
  icon?: ComponentType<{ className?: string }>
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumb items based on current path
  const pathSegments = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon }
  ]

  // If not on dashboard, add current page
  if (pathname !== '/dashboard') {
    const currentLabel = routeLabels[pathname] || pathname.split('/').pop()?.replace('-', ' ') || 'Page'
    breadcrumbItems.push({
      label: currentLabel,
      href: pathname,
    })
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const IconComponent = item.icon

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              {isLast ? (
                <span className="flex items-center text-gray-900 font-medium">
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
