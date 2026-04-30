export interface ParsedFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed'
  additions: number
  deletions: number
  patch: string | null
  language: string
  isReviewable: boolean
}

export interface ParsedDiff {
  files: ParsedFile[]
  totalAdditions: number
  totalDeletions: number
  reviewableFiles: ParsedFile[]
}

// Files we should skip reviewing
const SKIP_EXTENSIONS = [
  '.lock', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.eot',
  '.min.js', '.min.css', '.map'
]

const SKIP_FILENAMES = [
  'bun.lockb', 'package-lock.json', 'yarn.lock',
  'pnpm-lock.yaml', '.gitignore', '.prettierrc',
  '.eslintrc', 'LICENSE'
]

// Detect language from file extension
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const langMap: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript/React',
    js: 'JavaScript', jsx: 'JavaScript/React',
    py: 'Python', go: 'Go', rs: 'Rust',
    java: 'Java', cs: 'C#', cpp: 'C++',
    rb: 'Ruby', php: 'PHP', swift: 'Swift',
    kt: 'Kotlin', sql: 'SQL', sh: 'Shell',
    md: 'Markdown', json: 'JSON', yaml: 'YAML',
    yml: 'YAML', css: 'CSS', html: 'HTML',
  }
  return langMap[ext] ?? 'Unknown'
}

// Check if file should be reviewed
function isReviewable(filename: string): boolean {
  const lowerName = filename.toLowerCase()

  // Skip by exact filename
  if (SKIP_FILENAMES.some(skip => lowerName.endsWith(skip))) {
    return false
  }

  // Skip by extension
  if (SKIP_EXTENSIONS.some(ext => lowerName.endsWith(ext))) {
    return false
  }

  // Skip generated files
  if (lowerName.includes('generated') || lowerName.includes('.gen.')) {
    return false
  }

  return true
}

// Parse GitHub PR files into structured format
export function parseDiff(files: any[]): ParsedDiff {
  const parsedFiles: ParsedFile[] = files.map(file => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? null,
    language: detectLanguage(file.filename),
    isReviewable: isReviewable(file.filename) && !!file.patch,
  }))

  const reviewableFiles = parsedFiles.filter(f => f.isReviewable)

  console.log(`✅ ${reviewableFiles.length}/${parsedFiles.length} files are reviewable`)

  return {
    files: parsedFiles,
    totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
    totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
    reviewableFiles,
  }
}

// Format diff for AI consumption
export function formatDiffForAI(parsedDiff: ParsedDiff): string {
  const lines: string[] = []

  lines.push(`Total changes: +${parsedDiff.totalAdditions} -${parsedDiff.totalDeletions}`)
  lines.push(`Files to review: ${parsedDiff.reviewableFiles.length}`)
  lines.push('')

  for (const file of parsedDiff.reviewableFiles) {
    lines.push(`### File: ${file.filename}`)
    lines.push(`Language: ${file.language}`)
    lines.push(`Changes: +${file.additions} -${file.deletions}`)
    lines.push('```')
    lines.push(file.patch ?? '')
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}
