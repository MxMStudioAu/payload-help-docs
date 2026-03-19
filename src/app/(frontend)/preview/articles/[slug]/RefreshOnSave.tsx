'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export default function RefreshOnSave() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => new Promise((resolve) => setTimeout(() => { window.location.reload(); resolve() }, 1500))}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}
    />
  )
}
