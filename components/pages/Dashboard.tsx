'use client'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your silver shop admin panel
        </p>
      </div>

      {/* Simple content for testing */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Dashboard is loading...</p>
      </div>
    </div>
  )
}
