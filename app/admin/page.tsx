'use client'

import { useState, useEffect, useCallback } from 'react'

interface ResumeRow {
  id: string
  created_at: string
  first_name: string
  last_name: string
  language: string
  export_method: string
  completion_time_seconds: number
  raw_data?: Record<string, unknown>
  generated_resume?: Record<string, unknown>
  section_order?: string[]
}

interface MetricEvent {
  event_type: string
  session_id: string
  step_number: number | null
  section_id: string | null
}

interface Metrics {
  total: number
  thisMonth: number
  byLanguage: { en: number; es: number }
  avgTime: number
  completionRate: number
  exportBreakdown: { pdf: number; email: number; none: number }
  commonSkills: { skill: string; count: number }[]
  commonJobTypes: { title: string; count: number }[]
  avgJobsPerResume: number
  educationDist: { type: string; count: number }[]
  dropoffByStep: { step: number; started: number; completed: number }[]
  reorderStats: { section: string; count: number }[]
  dailyCounts: { date: string; count: number }[]
  recent: ResumeRow[]
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedResume, setSelectedResume] = useState<ResumeRow | null>(null)
  const [dataError, setDataError] = useState('')

  const fetchMetrics = useCallback(async (pw: string) => {
    setLoading(true)
    setDataError('')
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        if (res.status === 503) setDataError('Database not configured. Set SUPABASE credentials to see metrics.')
        else setDataError(d.error || 'Failed to load metrics')
        setLoading(false)
        return
      }

      const { all, monthCount, recent, events, daily } = await res.json() as {
        all: ResumeRow[]
        monthCount: number
        recent: ResumeRow[]
        events: MetricEvent[]
        daily: { created_at: string }[]
      }

      // --- Basic stats ---
      const enCount = all.filter(r => r.language === 'en').length
      const esCount = all.filter(r => r.language === 'es').length
      const timesWithData = all.filter(r => r.completion_time_seconds > 0)
      const avgTime = timesWithData.length > 0
        ? Math.round(timesWithData.reduce((s, r) => s + r.completion_time_seconds, 0) / timesWithData.length)
        : 0

      // --- Export breakdown ---
      const pdfCount = all.filter(r => r.export_method === 'pdf').length
      const emailCount = all.filter(r => r.export_method === 'email').length
      const noneCount = all.length - pdfCount - emailCount

      // --- Completion rate ---
      const startedSessions = new Set(events.filter(e => e.event_type === 'session_start').map(e => e.session_id)).size
      const completedSessions = new Set(events.filter(e => e.event_type === 'resume_generated').map(e => e.session_id)).size
      const completionRate = startedSessions > 0 ? Math.round((completedSessions / startedSessions) * 100) : (all.length > 0 ? 100 : 0)

      // --- Common skills ---
      const skillCounts: Record<string, number> = {}
      all.forEach(r => {
        const skills = r.raw_data?.skills as Record<string, unknown> | undefined
        if (!skills) return
        const allSkills: string[] = [
          ...((skills.computer as string[]) || []),
          ...((skills.communication as string[]) || []),
          ...((skills.physical as string[]) || []),
          ...((skills.interpersonal as string[]) || []),
        ]
        allSkills.forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1 })
      })
      const commonSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([skill, count]) => ({ skill, count }))

      // --- Common job types ---
      const jobCounts: Record<string, number> = {}
      all.forEach(r => {
        const work = r.raw_data?.work as Array<{ title: string }> | undefined
        if (!work) return
        work.forEach(w => {
          if (w.title?.trim()) {
            const t = w.title.trim().toLowerCase()
            jobCounts[t] = (jobCounts[t] || 0) + 1
          }
        })
      })
      const commonJobTypes = Object.entries(jobCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([title, count]) => ({ title, count }))

      // --- Avg jobs per resume ---
      const totalJobs = all.reduce((sum, r) => {
        const work = r.raw_data?.work as unknown[]
        return sum + (Array.isArray(work) ? work.length : 0)
      }, 0)
      const avgJobsPerResume = all.length > 0 ? Math.round((totalJobs / all.length) * 10) / 10 : 0

      // --- Education distribution ---
      const eduCounts: Record<string, number> = {}
      all.forEach(r => {
        const edu = r.raw_data?.education as Array<{ type: string }> | undefined
        if (!edu) return
        edu.forEach(e => {
          const t = e.type || 'Unknown'
          eduCounts[t] = (eduCounts[t] || 0) + 1
        })
      })
      const educationDist = Object.entries(eduCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count }))

      // --- Drop-off by step ---
      const stepCompleted: Record<number, Set<string>> = {}
      const stepStarted: Record<number, Set<string>> = {}
      events.forEach(e => {
        if (e.event_type === 'step_complete' && e.step_number != null && e.session_id) {
          if (!stepCompleted[e.step_number]) stepCompleted[e.step_number] = new Set()
          stepCompleted[e.step_number].add(e.session_id)
        }
        if (e.event_type === 'session_start' && e.session_id) {
          if (!stepStarted[1]) stepStarted[1] = new Set()
          stepStarted[1].add(e.session_id)
        }
      })
      const dropoffByStep = Array.from({ length: 15 }, (_, i) => i + 1).map(step => ({
        step,
        started: stepStarted[step]?.size || 0,
        completed: stepCompleted[step]?.size || 0,
      })).filter(s => s.started > 0 || s.completed > 0)

      // --- Section reorder stats ---
      const reorderCounts: Record<string, number> = {}
      events.filter(e => e.event_type === 'section_reordered').forEach(e => {
        const key = e.section_id || 'unknown'
        reorderCounts[key] = (reorderCounts[key] || 0) + 1
      })
      const reorderStats = Object.entries(reorderCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([section, count]) => ({ section, count }))

      // --- Daily counts (last 30 days) ---
      const dailyMap: Record<string, number> = {}
      daily.forEach(r => {
        const date = r.created_at.split('T')[0]
        dailyMap[date] = (dailyMap[date] || 0) + 1
      })
      const days: { date: string; count: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateStr = d.toISOString().split('T')[0]
        days.push({ date: dateStr, count: dailyMap[dateStr] || 0 })
      }

      setMetrics({
        total: all.length,
        thisMonth: monthCount,
        byLanguage: { en: enCount, es: esCount },
        avgTime,
        completionRate,
        exportBreakdown: { pdf: pdfCount, email: emailCount, none: noneCount },
        commonSkills,
        commonJobTypes,
        avgJobsPerResume,
        educationDist,
        dropoffByStep,
        reorderStats,
        dailyCounts: days,
        recent,
      })
    } catch (err) {
      console.error('Admin metrics error:', err)
      setDataError('Connection error loading metrics.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchMetrics(password)
  }, [authed, fetchMetrics, password])

  const handleLogin = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setAuthError(data.error === 'Admin not configured' ? 'Admin not configured on this deployment.' : 'Incorrect password')
      }
    } catch {
      setAuthError('Connection error. Try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchDetail = async (id: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'detail', id }),
      })
      if (res.ok) {
        const { resume } = await res.json()
        if (resume) setSelectedResume(resume as ResumeRow)
      }
    } catch {
      // silently fail — detail is non-critical
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
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myresumebuilder_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Login screen
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
              {authError && <p className="text-red-600 text-sm mt-1">{authError}</p>}
            </div>
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full bg-[#0A66C2] text-white font-semibold py-3 rounded-lg hover:bg-blue-700 min-h-[44px] disabled:opacity-60"
            >
              {authLoading ? 'Checking...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">MyResumeBuilder — Admin</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setAuthed(false)} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading metrics...</span>
          </div>
        )}

        {dataError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-yellow-800 mb-2">Data Unavailable</h3>
            <p className="text-yellow-700 text-sm">{dataError}</p>
          </div>
        )}

        {metrics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Daily Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Resumes per Day — Last 30 Days</h2>
              {metrics.dailyCounts.every(d => d.count === 0) ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (() => {
                const max = Math.max(...metrics.dailyCounts.map(d => d.count), 1)
                return (
                  <div>
                    <div className="flex items-end gap-0.5 h-20">
                      {metrics.dailyCounts.map(d => (
                        <div
                          key={d.date}
                          title={`${d.date}: ${d.count}`}
                          className="flex-1 bg-[#0A66C2] rounded-t min-w-0 transition-all hover:bg-blue-700 cursor-default"
                          style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{metrics.dailyCounts[0]?.date?.slice(5)}</span>
                      <span>{metrics.dailyCounts[29]?.date?.slice(5)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* 2-col stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Language Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { label: 'English (EN)', count: metrics.byLanguage.en, color: 'bg-[#0A66C2]' },
                    { label: 'Spanish (ES)', count: metrics.byLanguage.es, color: 'bg-green-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Export Method</h2>
                <div className="space-y-3">
                  {[
                    { label: 'PDF Download', count: metrics.exportBreakdown.pdf, color: 'bg-blue-500' },
                    { label: 'Email', count: metrics.exportBreakdown.email, color: 'bg-purple-500' },
                    { label: 'Not exported', count: metrics.exportBreakdown.none, color: 'bg-gray-300' },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills + Job Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Top Skills</h2>
                {metrics.commonSkills.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
                  <div className="space-y-2">
                    {metrics.commonSkills.map(({ skill, count }) => (
                      <div key={skill} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate flex-1">{skill}</span>
                        <span className="ml-3 font-semibold text-gray-900 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Top Job Types</h2>
                {metrics.commonJobTypes.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
                  <div className="space-y-2">
                    {metrics.commonJobTypes.map(({ title, count }) => (
                      <div key={title} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate flex-1 capitalize">{title}</span>
                        <span className="ml-3 font-semibold text-gray-900 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Education + Avg Jobs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-1">Education Distribution</h2>
                <p className="text-xs text-gray-400 mb-4">Avg {metrics.avgJobsPerResume} jobs per resume</p>
                {metrics.educationDist.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
                  <div className="space-y-2">
                    {metrics.educationDist.map(({ type, count }) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate flex-1">{type}</span>
                        <span className="ml-3 font-semibold text-gray-900 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Section Reorder Stats</h2>
                {metrics.reorderStats.length === 0 ? <p className="text-gray-400 text-sm">No reorder events yet</p> : (
                  <div className="space-y-2">
                    {metrics.reorderStats.map(({ section, count }) => (
                      <div key={section} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">{section}</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{count} reorders</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drop-off by step */}
            {metrics.dropoffByStep.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Step Completion (from usage events)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-gray-500 text-xs font-semibold uppercase">Step</th>
                        <th className="text-left py-2 px-2 text-gray-500 text-xs font-semibold uppercase">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.dropoffByStep.map(({ step, completed }) => (
                        <tr key={step} className="border-b border-gray-50">
                          <td className="py-2 px-2 text-gray-600">Step {step}</td>
                          <td className="py-2 px-2 font-semibold text-gray-900">{completed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Resumes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Resume Archive (last 50)</h2>
                <button onClick={exportCSV} className="text-sm text-[#0A66C2] hover:underline font-semibold">
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
                        {['Name', 'Date', 'Lang', 'Export', 'Time', ''].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-gray-500 font-semibold text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recent.map(row => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-800">{[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}</td>
                          <td className="py-2 px-3 text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.language === 'es' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {(row.language || 'en').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-500">{row.export_method || '—'}</td>
                          <td className="py-2 px-3 text-gray-500">{formatTime(row.completion_time_seconds)}</td>
                          <td className="py-2 px-3">
                            <button onClick={() => fetchDetail(row.id)} className="text-[#0A66C2] text-xs hover:underline">View</button>
                          </td>
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

      {/* Detail Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResume(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">
                {[selectedResume.first_name, selectedResume.last_name].filter(Boolean).join(' ') || 'Resume Detail'}
              </h2>
              <button onClick={() => setSelectedResume(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Date', value: new Date(selectedResume.created_at).toLocaleString() },
                  { label: 'Language', value: (selectedResume.language || 'en').toUpperCase() },
                  { label: 'Export Method', value: selectedResume.export_method || 'None' },
                  { label: 'Completion Time', value: formatTime(selectedResume.completion_time_seconds) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {selectedResume.generated_resume && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">Generated Resume</h3>
                  <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto text-gray-700 max-h-64 overflow-y-auto">
                    {JSON.stringify(selectedResume.generated_resume, null, 2)}
                  </pre>
                </div>
              )}

              {selectedResume.section_order && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">Section Order</h3>
                  <p className="text-sm text-gray-600">{(selectedResume.section_order as string[]).join(' → ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
