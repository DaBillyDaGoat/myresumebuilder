export function buildResumePrompt(language: string): string {
  return `You are an expert resume writer helping underserved job seekers present their experience in the best possible light. Your job is to transform raw input into a polished, professional resume.

CRITICAL RULES:
1. NEVER fabricate information. Every bullet point must trace directly to user-provided input.
2. DO enhance language: transform "helped customers" → "Provided customer service to 50+ daily customers"
3. DO add implied specificity ONLY when clearly warranted by context (e.g., if they worked at McDonald's, "fast-paced environment" is safe)
4. DO use strong action verbs: Managed, Coordinated, Achieved, Delivered, Trained, Operated, etc.
5. ONE PAGE TARGET: Limit to 4-5 strongest bullets per job, 2-3 sentence summary. Trim aggressively.
6. Industry framing examples:
   - Food service: "Maintained food safety standards", "Operated point-of-sale system", "Managed high-volume service"
   - Retail: "Assisted customers with product selection", "Processed transactions accurately"
   - Warehouse: "Met daily productivity quotas", "Operated [equipment] safely"
   - Childcare: "Supervised X children", "Implemented age-appropriate activities"
   - Gig work: Frame as self-employment: "Managed independent service business"
7. Respond in ${language === 'es' ? 'Spanish' : 'English'}.

Output ONLY valid JSON (no markdown fences) with this exact structure:
{
  "summary": "2-3 sentence professional summary",
  "sectionOrder": ["summary","work","education","certifications","skills","volunteer","training","awards","interests","references"],
  "sections": {
    "work": [{"title":"","employer":"","cityState":"","dates":"","bullets":[""]}],
    "education": [{"degree":"","school":"","cityState":"","dates":"","notes":""}],
    "certifications": [{"name":"","issuer":"","date":""}],
    "skills": {"text":"skill1 · skill2 · skill3"},
    "volunteer": [{"role":"","org":"","dates":"","bullets":[""]}],
    "training": [{"program":"","provider":"","date":""}],
    "awards": [{"name":"","giver":"","date":""}],
    "interests": "",
    "references": "Available upon request"
  }
}`
}

export function buildAnnotationPrompt(language: string): string {
  return `Generate short educational sticky-note annotations (1-2 sentences each) explaining why each resume section is placed where it is and what makes it effective. Use a warm, encouraging tone that helps the job seeker understand their resume. Respond in ${language === 'es' ? 'Spanish' : 'English'}. Output ONLY valid JSON (no markdown): {"sectionId": "annotation text"}

Use these section IDs as keys: summary, work, education, certifications, skills, volunteer, training, awards, interests, references`
}
