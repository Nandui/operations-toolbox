export interface QuickLink {
  label: string
  href: string
  icon: 'notion' | 'drive' | 'hr' | 'trail'
  color: string
}

export function getQuickLinksConfig(): QuickLink[] {
  return [
    {
      label: 'Notion',
      href: process.env.NOTION_URL ?? '#',
      icon: 'notion',
      color: 'bg-slate-800',
    },
    {
      label: 'Google Drive',
      href: process.env.GOOGLE_DRIVE_URL ?? '#',
      icon: 'drive',
      color: 'bg-blue-600',
    },
    {
      label: 'HR / Payroll',
      href: process.env.HR_PAYROLL_URL ?? '#',
      icon: 'hr',
      color: 'bg-violet-600',
    },
    {
      label: 'Trail',
      href: process.env.TRAIL_APP_URL ?? 'https://web.trailapp.com',
      icon: 'trail',
      color: 'bg-emerald-600',
    },
  ]
}

export function getDashboardTitle(): string {
  return process.env.DASHBOARD_TITLE ?? 'Operations Toolbox'
}
