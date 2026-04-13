'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface ResumeRow {
  id: string
  created_at: string
  first_name: string
  last_name: string
  language: string
  export_method: string
  completion_time_seconds: number
}

interface Metrics {
  total: number
  thisMonth: number
  byLanguage: { en: number; es: number }
  avgTime: number
  completionRate: number
  recent: ResumeRow[]
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)

  const adminPassword = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin')
    : 'admin'

  const fetchMetrics = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [allRes, monthRes, recentRes] = await Promise.all([
        supabase.from('resumes').select('language, completion_time_seconds, export_method'),
        supabase.from('resumes').select('id').gte('created_at', startOfMonth),
        supabase.from('resumes')
          .select('id, created_at, first_name, last_name, language, export_method, completion_time_seconds')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const all = allRes.data || []
      const month = monthRes.data || []
      const recent = recentRes.data || []

      const enCount = all.filter(r => r.language === 'en').length
      const esCount = all.filter(r => r.language === 'es').length
      const timesWithData = all.filter(r => r.completion_time_seconds > 0)
      const avgTime = timesWithData.length > 0
        ? Math.round(timesWithData.reduce((sum, r) => sum + r.completion_time_seconds, 0) / timesWithData.length)
        : 0

      setMetrics({
        total: all.length,
        thisMonth: month.length,
        byLanguage: { en: enCount, es: esCount },
        avgTime,
        completionRate: all.length > 0 ? Math.round((all.length / Math.max(all.length, 1)) * 100) : 0,
        recent: recent as ResumeRow[],
      })
    } catch (err) {
      console.error('Admin metrics error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchMetrics()
    }
  }, [authed, fetchMetrics])

  const handleLogin = () => {
    if (password === adminPassword) {
      setAuthed(true)
      setWrongPassword(false)
    } else {
      setWrongPassword(true)
    }
  }

  const exportCSV = () => {
    if (!metrics?.recent) return
    const headers = ['ID', 'Date', 'First Name', 'Last Name', 'Language', 'Export Method', 'Completion Time (s)']
    const rows = metrics.recent.map(r => [
      r.id,
      new Date(r.created_at).toLocaleDateString(),
      r.first_name || '',
      r.last_name || '',
      r.language || '',
      r.export_method || '',
      r.completion_time_seconds || '',
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myresumebuilder_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">Admin Dashboard</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0A66C2] min-h-[44px]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
              {wrongPassword && (
                <p className="text-red-600 text-sm mt-1">Incorrect password</p>
              )}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#0A66C2] text-white font-semibold py-3 rounded-lg hover:bg-blue-700 min-h-[44px]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">MyResumeBuilder — Admin</h1>
        <div className="flex items-center gap-4">
          {!supabase && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              Supabase not connected
            </span>
          )}
          <button
            onClick={() => setAuthed(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {!supabase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Supabase Not Configured</h3>
            <p className="text-yellow-700 text-sm">
              Connect your Supabase database by setting SUPABASE_URL and SUPABASE_ANON_KEY in your .env.local file.
              Once connected, metrics will appear here.
            </p>
          </div>
        )}

        {metrics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Resumes', value: metrics.total },
                { label: 'This Month', value: metrics.thisMonth },
                { label: 'Completion Rate', value: `${metrics.completionRate}%` },
                { label: 'Avg. Time', value: formatTime(metrics.avgTime) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Language Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-4">Language Breakdown</h2>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-gray-500">English (EN)</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.byLanguage.en}</p>
                  {metrics.total > 0 && (
                    <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0A66C2] h-2 rounded-full"
                        style={{ width: `${Math.round((metrics.byLanguage.en / metrics.total) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spanish (ES)</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.byLanguage.es}</p>
                  {metrics.total > 0 && (
                    <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.round((metrics.byLanguage.es / metrics.total) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Resumes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Resumes</h2>
                <button
                  onClick={exportCSV}
                  className="text-sm text-[#0A66C2] hover:underline font-semibold"
                >
                  Export CSV
                </button>
              </div>

              {metrics.recent.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No resumes yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Name</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Date</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Language</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Export</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recent.map(row => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-800">
                            {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                          </td>
                          <td className="py-2 px-3 text-gray-500">
                            {new Date(row.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.language === 'es' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {(row.language || 'en').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-500">{row.export_method || '—'}</td>
                          <td className="py-2 px-3 text-gray-500">{formatTime(row.completion_time_seconds)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
