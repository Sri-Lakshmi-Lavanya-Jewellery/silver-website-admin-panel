'use client'

import { useEffect, useState } from 'react'
import { contentApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

type AnyObj = Record<string, any>

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
const label = 'block text-xs font-medium text-gray-600 mb-1'

function SectionCard({
  title, description, onSave, onReset, saving, children,
}: {
  title: string; description: string; onSave: () => void; onReset: () => void; saving: boolean; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onReset} className="inline-flex items-center gap-1 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowPathIcon className="w-4 h-4" /> Reset
          </button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ContentPage() {
  const [content, setContent] = useState<AnyObj>({})
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await contentApi.list()
      if (res.success && res.data) {
        const map: AnyObj = {}
        res.data.forEach((s) => { map[s.section] = s.data })
        setContent(map)
      }
    } catch (e) {
      toast.error('Failed to load site content')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const setSection = (section: string, data: any) =>
    setContent((c) => ({ ...c, [section]: data }))

  const save = async (section: string) => {
    try {
      setSavingSection(section)
      const res = await contentApi.updateSection(section, content[section])
      if (res.success) toast.success(`${section} saved — live on the website`)
      else toast.error('Save failed')
    } catch (e) {
      toast.error('Save failed')
    } finally {
      setSavingSection(null)
    }
  }

  const reset = async (section: string) => {
    if (!confirm(`Reset "${section}" to the default content?`)) return
    try {
      const res = await contentApi.resetSection(section)
      if (res.success && res.data) { setSection(section, res.data.data); toast.success(`${section} reset to default`) }
    } catch (e) {
      toast.error('Reset failed')
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading site content…</div>
  }

  const hero = content.hero || { slides: [] }
  const announcement = content.announcement || { lines: [] }
  const fb = content.featuredBanner || {}
  const occasions = content.occasions || { items: [] }
  const testimonials = content.testimonials || { items: [] }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
        <p className="text-gray-500">Edit the homepage banners and sections — changes go live on the website immediately. Use image URLs (e.g. /assets/images/products/…/1.jpg or a full https link).</p>
      </div>

      {/* HERO */}
      <SectionCard
        title="Hero Carousel"
        description="The big rotating banners at the top of the homepage. Swap these for festivals/events."
        saving={savingSection === 'hero'}
        onSave={() => save('hero')}
        onReset={() => reset('hero')}
      >
        {(hero.slides || []).map((s: AnyObj, i: number) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Slide {i + 1}</span>
              <button onClick={() => setSection('hero', { slides: hero.slides.filter((_: any, j: number) => j !== i) })} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([
                ['image', 'Image URL'], ['eyebrow', 'Eyebrow (small top text)'],
                ['title', 'Title (line 1)'], ['titleAccent', 'Title accent (gold line)'],
                ['cta', 'Button text'], ['ctaLink', 'Button link (e.g. /categories)'],
              ] as [string, string][]).map(([key, lbl]) => (
                <div key={key}>
                  <label className={label}>{lbl}</label>
                  <input className={input} value={s[key] || ''} onChange={(e) => {
                    const slides = [...hero.slides]; slides[i] = { ...slides[i], [key]: e.target.value }; setSection('hero', { slides })
                  }} />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className={label}>Subtitle</label>
                <textarea className={input} rows={2} value={s.subtitle || ''} onChange={(e) => {
                  const slides = [...hero.slides]; slides[i] = { ...slides[i], subtitle: e.target.value }; setSection('hero', { slides })
                }} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setSection('hero', { slides: [...(hero.slides || []), { image: '', eyebrow: '', title: '', titleAccent: '', subtitle: '', cta: 'Shop Now', ctaLink: '/categories' }] })} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
          <PlusIcon className="w-4 h-4" /> Add slide
        </button>
      </SectionCard>

      {/* ANNOUNCEMENT */}
      <SectionCard
        title="Announcement Bar"
        description="The scrolling gold strip under the hero. One message per line."
        saving={savingSection === 'announcement'}
        onSave={() => save('announcement')}
        onReset={() => reset('announcement')}
      >
        <textarea className={input} rows={5} value={(announcement.lines || []).join('\n')} onChange={(e) => setSection('announcement', { lines: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })} />
      </SectionCard>

      {/* FEATURED BANNER */}
      <SectionCard
        title="Featured Collection Banner"
        description="The dark promo section on the homepage."
        saving={savingSection === 'featuredBanner'}
        onSave={() => save('featuredBanner')}
        onReset={() => reset('featuredBanner')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {([
            ['eyebrow', 'Eyebrow'], ['title', 'Title'], ['subtitle', 'Subtitle (gold italic)'],
            ['primaryCta', 'Primary button text'], ['primaryLink', 'Primary button link'],
            ['secondaryCta', 'Secondary button text'], ['secondaryLink', 'Secondary button link'],
          ] as [string, string][]).map(([key, lbl]) => (
            <div key={key}>
              <label className={label}>{lbl}</label>
              <input className={input} value={fb[key] || ''} onChange={(e) => setSection('featuredBanner', { ...fb, [key]: e.target.value })} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={label}>Description</label>
            <textarea className={input} rows={2} value={fb.description || ''} onChange={(e) => setSection('featuredBanner', { ...fb, description: e.target.value })} />
          </div>
        </div>
      </SectionCard>

      {/* OCCASIONS */}
      <SectionCard
        title="Shop by Occasion"
        description="The tiles in the 'Shop by Occasion' grid (emoji icon + label + link)."
        saving={savingSection === 'occasions'}
        onSave={() => save('occasions')}
        onReset={() => reset('occasions')}
      >
        {(occasions.items || []).map((it: AnyObj, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input className={`${input} w-16 text-center`} value={it.icon || ''} onChange={(e) => { const items = [...occasions.items]; items[i] = { ...items[i], icon: e.target.value }; setSection('occasions', { items }) }} placeholder="🪔" />
            <input className={input} value={it.label || ''} onChange={(e) => { const items = [...occasions.items]; items[i] = { ...items[i], label: e.target.value }; setSection('occasions', { items }) }} placeholder="Festivals & Puja" />
            <input className={input} value={it.link || ''} onChange={(e) => { const items = [...occasions.items]; items[i] = { ...items[i], link: e.target.value }; setSection('occasions', { items }) }} placeholder="/collections" />
            <button onClick={() => setSection('occasions', { items: occasions.items.filter((_: any, j: number) => j !== i) })} className="text-red-500 hover:bg-red-50 p-2 rounded shrink-0"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => setSection('occasions', { items: [...(occasions.items || []), { icon: '✨', label: '', link: '/collections' }] })} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
          <PlusIcon className="w-4 h-4" /> Add occasion
        </button>
      </SectionCard>

      {/* TESTIMONIALS */}
      <SectionCard
        title="Customer Testimonials"
        description="The 'What Our Patrons Say' quotes."
        saving={savingSection === 'testimonials'}
        onSave={() => save('testimonials')}
        onReset={() => reset('testimonials')}
      >
        {(testimonials.items || []).map((t: AnyObj, i: number) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Testimonial {i + 1}</span>
              <button onClick={() => setSection('testimonials', { items: testimonials.items.filter((_: any, j: number) => j !== i) })} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon className="w-4 h-4" /></button>
            </div>
            <textarea className={`${input} mb-2`} rows={2} value={t.quote || ''} onChange={(e) => { const items = [...testimonials.items]; items[i] = { ...items[i], quote: e.target.value }; setSection('testimonials', { items }) }} placeholder="Quote" />
            <div className="grid grid-cols-2 gap-2">
              <input className={input} value={t.name || ''} onChange={(e) => { const items = [...testimonials.items]; items[i] = { ...items[i], name: e.target.value }; setSection('testimonials', { items }) }} placeholder="Name" />
              <input className={input} value={t.place || ''} onChange={(e) => { const items = [...testimonials.items]; items[i] = { ...items[i], place: e.target.value }; setSection('testimonials', { items }) }} placeholder="City" />
            </div>
          </div>
        ))}
        <button onClick={() => setSection('testimonials', { items: [...(testimonials.items || []), { quote: '', name: '', place: '' }] })} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
          <PlusIcon className="w-4 h-4" /> Add testimonial
        </button>
      </SectionCard>
    </div>
  )
}
