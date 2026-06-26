const API_URL = process.env.NEXT_PUBLIC_API_URL 
  || "http://localhost:8001"

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData
  })
  if (!res.ok) throw new Error("Upload failed")
  return res.json()
}

export async function createIssue(data: {
  image_url: string
  description: string
  address: string
  lat?: number
  lng?: number
  citizen_id?: string
}) {
  const res = await fetch(`${API_URL}/api/issues`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Failed to create issue")
  return res.json()
}

export async function getIssue(id: string) {
  const res = await fetch(`${API_URL}/api/issues/${id}`)
  if (!res.ok) throw new Error("Issue not found")
  return res.json()
}

export async function getIssues(filters?: {
  category?: string
  status?: string
  limit?: number
}) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters || {})
        .filter(([_, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    )
  )
  const res = await fetch(`${API_URL}/api/issues?${params}`)
  if (!res.ok) throw new Error("Failed to fetch issues")
  return res.json()
}

export async function upvoteIssue(id: string, citizenId: string = "anonymous") {
  const res = await fetch(
    `${API_URL}/api/issues/${id}/upvote?citizen_id=${citizenId}`,
    { method: "POST" }
  )
  if (!res.ok) throw new Error("Upvote failed")
  return res.json()
}

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/api/leaderboard`)
  if (!res.ok) throw new Error("Failed to fetch leaderboard")
  return res.json()
}

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/api/dashboard/stats`)
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export async function downloadPDF(id: string) {
  const res = await fetch(
    `${API_URL}/api/issues/${id}/pdf`
  )
  if (!res.ok) throw new Error("PDF generation failed")
  return res.blob()
}
