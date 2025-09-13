export interface Project {
  id: string
  sale_address: string | null
  project_owner: string
  name: string
  symbol: string
  short_description: string
  long_description?: string
  website?: string
  twitter?: string
  discord?: string
  medium?: string
  banner_url?: string
  logo_url?: string
  status: 'draft' | 'pending' | 'live' | 'ended' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  sale_address?: string | null
  project_owner: string
  name: string
  symbol: string
  short_description: string
  long_description?: string
  website?: string
  twitter?: string
  discord?: string
  medium?: string
  banner_url?: string
  logo_url?: string
  status?: 'draft' | 'pending' | 'live' | 'ended' | 'cancelled'
}
