export type Language = 'en' | 'es'

export interface ContactInfo {
  fullName: string
  legalName?: string
  phone: string
  email: string
  addressOption: 'full' | 'city-state' | 'none'
  addressFull?: string
  cityState?: string
}

export interface WorkEntry {
  id: string
  title: string
  employer: string
  cityState: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export type EducationType = 'High School/GED' | 'Some College' | "Associate's Degree" | "Bachelor's Degree" | 'Trade/Vocational' | 'Other'

export interface EducationEntry {
  id: string
  type: EducationType
  school: string
  cityState: string
  completionDate: string
  inProgress: boolean
  field: string
  notes: string
}

export interface VolunteerEntry {
  id: string
  role: string
  org: string
  dates: string
  description: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  expiration: string
  status: 'Active' | 'Expired' | 'In Progress'
  selected: boolean
}

export interface Skills {
  computer: string[]
  communication: string[]
  physical: string[]
  interpersonal: string[]
  other: string
  bilingualLanguage?: string
}

export interface MilitaryService {
  branch: string
  startDate: string
  endDate: string
  rank: string
  mos: string
  dischargeStatus: string
  notes: string
}

export interface TrainingEntry {
  id: string
  program: string
  provider: string
  date: string
  notes: string
}

export interface Award {
  id: string
  name: string
  giver: string
  date: string
}

export interface EmploymentGap {
  id: string
  reason: string
  startDate: string
  endDate: string
  notes: string
}

export interface Accomplishment {
  id: string
  label: string
  value: boolean
  detail?: string
}

export interface Reference {
  id: string
  name: string
  titleRelationship: string
  phone: string
  email: string
}

export interface SummaryBuilder {
  targetRole: string
  strengths: string
}

export interface Availability {
  schedule: 'open' | 'weekdays' | 'weekends' | 'flexible'
  transportation: string[]
  willingToRelocate: 'yes' | 'no' | 'local'
}

export interface FormData {
  contact: ContactInfo
  work: WorkEntry[]
  education: EducationEntry[]
  volunteer: VolunteerEntry[]
  certifications: Certification[]
  skills: Skills
  military: MilitaryService | null
  training: TrainingEntry[]
  awards: Award[]
  employmentGaps: EmploymentGap[]
  accomplishments: Accomplishment[]
  interests: string
  references: {
    type: 'request' | 'include'
    list: Reference[]
  }
  summary: SummaryBuilder
  availability: Availability
}

export interface ResumeSection {
  id: string
  type: string
  title: string
  content: unknown
}

export interface GeneratedResume {
  summary: string
  sectionOrder: string[]
  sections: {
    work?: Array<{
      title: string
      employer: string
      cityState: string
      dates: string
      bullets: string[]
    }>
    education?: Array<{
      degree: string
      school: string
      cityState: string
      dates: string
      notes: string
    }>
    certifications?: Array<{
      name: string
      issuer: string
      date: string
    }>
    skills?: { text: string }
    volunteer?: Array<{
      role: string
      org: string
      dates: string
      bullets: string[]
    }>
    training?: Array<{
      program: string
      provider: string
      date: string
    }>
    awards?: Array<{
      name: string
      giver: string
      date: string
    }>
    interests?: string
    references?: string
  }
  language: Language
  annotations?: Record<string, string>
}
