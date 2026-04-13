import type { FormData } from '@/types'

export function getPDFFilename(lastName: string, firstName: string): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const safeLast = lastName.replace(/[^a-zA-Z0-9]/g, '')
  const safeFirst = firstName.replace(/[^a-zA-Z0-9]/g, '')
  return `MyResumeBuilder_${safeLast}_${safeFirst}_${month}${year}.pdf`
}

export function getDefaultSectionOrder(formData: FormData): string[] {
  const order: string[] = ['summary']

  // Work experience goes first if they have entries
  if (formData.work && formData.work.length > 0) {
    order.push('work')
  }

  // Education
  if (formData.education && formData.education.length > 0) {
    order.push('education')
  }

  // Certifications
  const selectedCerts = formData.certifications?.filter(c => c.selected)
  if (selectedCerts && selectedCerts.length > 0) {
    order.push('certifications')
  }

  // Skills
  const hasSkills =
    (formData.skills?.computer?.length ?? 0) > 0 ||
    (formData.skills?.communication?.length ?? 0) > 0 ||
    (formData.skills?.physical?.length ?? 0) > 0 ||
    (formData.skills?.interpersonal?.length ?? 0) > 0 ||
    formData.skills?.other

  if (hasSkills) {
    order.push('skills')
  }

  // Military before volunteer if present
  if (formData.military && formData.military.branch) {
    order.push('military')
  }

  // Volunteer (if work is thin, bump up)
  if (formData.volunteer && formData.volunteer.length > 0) {
    if ((formData.work?.length ?? 0) < 2) {
      // Move volunteer up before education if work is thin
      const eduIdx = order.indexOf('education')
      if (eduIdx !== -1) {
        order.splice(eduIdx, 0, 'volunteer')
      } else {
        order.push('volunteer')
      }
    } else {
      order.push('volunteer')
    }
  }

  // Training
  if (formData.training && formData.training.length > 0) {
    order.push('training')
  }

  // Awards
  if (formData.awards && formData.awards.length > 0) {
    order.push('awards')
  }

  // Interests
  if (formData.interests) {
    order.push('interests')
  }

  // References always last
  order.push('references')

  return order
}

export function countPages(element: HTMLElement): number {
  const pageHeightPx = 1056 // 11in at 96dpi
  const contentHeight = element.scrollHeight
  return Math.ceil(contentHeight / pageHeightPx)
}

export function getNameParts(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}
