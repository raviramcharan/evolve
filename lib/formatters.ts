export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function weekLabel(weekNumber: number): string {
  return `Week ${weekNumber}`
}

export function feelingEmoji(score: number | null): string {
  if (!score) return '—'
  if (score >= 5) return '😁'
  if (score >= 4) return '😊'
  if (score >= 3) return '😐'
  if (score >= 2) return '😔'
  return '😞'
}
