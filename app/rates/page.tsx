'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ratesApi, ApiError } from '@/lib/api'
import { CurrencyRupeeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function RatesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <RatesEditor />
    </ProtectedRoute>
  )
}

const fmt = (n?: number | null) =>
  n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN')

function RatesEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [gold24, setGold24] = useState('')
  const [gold22, setGold22] = useState('')
  const [silverKg, setSilverKg] = useState('')
  const [resolved, setResolved] = useState<{
    gold_24k?: number | null
    gold_22k?: number | null
    silver_per_kg?: number | null
    source?: string
    is_manual?: boolean
  } | null>(null)
  const [meta, setMeta] = useState<{ at?: string; by?: string }>({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await ratesApi.getManual()
      const d = res?.data || {}
      setEnabled(!!d.enabled)
      setGold24(d.gold_24k != null ? String(d.gold_24k) : '')
      setGold22(d.gold_22k != null ? String(d.gold_22k) : '')
      setSilverKg(d.silver_per_kg != null ? String(d.silver_per_kg) : '')
      setMeta({ at: d.updatedAt, by: d.updatedBy })
      setResolved(res?.resolved || null)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not load rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await ratesApi.setManual({
        enabled,
        gold_24k: gold24.trim() === '' ? undefined : Number(gold24),
        gold_22k: gold22.trim() === '' ? undefined : Number(gold22),
        silver_per_kg: silverKg.trim() === '' ? undefined : Number(silverKg),
      })
      toast.success(
        enabled ? 'Rate saved — it now shows on the website.' : 'Manual rate turned off — the website uses the live rate.'
      )
      await load()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not save the rate')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CurrencyRupeeIcon className="w-7 h-7 text-primary-600" />
            Rate Update
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Set today&apos;s gold &amp; silver rate. It shows instantly on the website&apos;s top rate bar
            and in the &ldquo;how your price is calculated&rdquo; box.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Currently showing on the website */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Currently showing on the website
          </h2>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              resolved?.is_manual
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {resolved?.is_manual ? 'Manual (your rate)' : 'Live / auto rate'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Gold 24K', value: fmt(resolved?.gold_24k), unit: 'per gram' },
            { label: 'Gold 22K', value: fmt(resolved?.gold_22k), unit: 'per gram' },
            { label: 'Silver', value: fmt(resolved?.silver_per_kg), unit: 'per kg' },
          ].map((c) => (
            <div key={c.label} className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
              <p className="text-[11px] text-gray-400">{c.unit}</p>
            </div>
          ))}
        </div>
        {resolved?.source && (
          <p className="mt-3 text-xs text-gray-400">Source: {resolved.source}</p>
        )}
      </div>

      {/* Editor */}
      <form onSubmit={onSave} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Use my rate (override the live rate)
            </span>
            <span className="block text-xs text-gray-500">
              When on, the website shows the numbers below. When off, it uses the automatic live rate.
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gold 24K <span className="text-gray-400 font-normal">(₹ / gram)</span>
            </label>
            <input
              type="number" inputMode="decimal" step="1" min="0"
              value={gold24}
              onChange={(e) => setGold24(e.target.value)}
              placeholder="e.g. 7420"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Gold 22K <span className="text-gray-400 font-normal">(₹ / gram)</span>
            </label>
            <input
              type="number" inputMode="decimal" step="1" min="0"
              value={gold22}
              onChange={(e) => setGold22(e.target.value)}
              placeholder="auto from 24K if blank"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Silver <span className="text-gray-400 font-normal">(₹ / kg)</span>
            </label>
            <input
              type="number" inputMode="decimal" step="1" min="0"
              value={silverKg}
              onChange={(e) => setSilverKg(e.target.value)}
              placeholder="e.g. 96500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
          Tip: enter <strong>Silver per KG</strong> (e.g. 96500) and <strong>Gold per gram</strong>.
          Leave any field blank to keep that metal on the automatic live rate.
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">
            {meta.at
              ? `Last saved ${new Date(meta.at).toLocaleString('en-IN')}${meta.by ? ' by ' + meta.by : ''}`
              : 'Not set yet'}
          </p>
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 font-medium"
          >
            {saving ? 'Saving…' : 'Save rate'}
          </button>
        </div>
      </form>
    </div>
  )
}
