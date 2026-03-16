import type { Tour } from '@/lib/schema/tour-schema'

function buildFallbackBlogTips(tour: Tour): { title: string; content: string } {
  const destination = tour.destination || tour.location || 'this tour'
  const duration = tour.duration || ''
  const firstDayTitle = tour.itinerary?.[0]?.title ?? ''

  const title =
    firstDayTitle && destination
      ? `Travel tips for ${destination}`
      : `Travel tips for ${destination}`

  const parts: string[] = []

  parts.push(
    `Planning a ${duration ? duration + ' ' : ''}trip to ${destination}? Aim to travel during the most comfortable season for sightseeing and outdoor activities, and build in enough time for the key stops in your itinerary${
      firstDayTitle ? `, starting with ${firstDayTitle}` : ''
    }.`
  )

  parts.push(
    `Pack light, breathable clothing, comfortable walking shoes, and any required items for temples or cultural sites (such as clothing that covers shoulders and knees). Allow extra time for transfers between stops, and keep your camera or phone ready for the best viewpoints and photography moments.`
  )

  return {
    title,
    content: parts.join('\n\n'),
  }
}

export function ensureBlogTips(tour: Tour): Tour {
  const current = (tour as Tour & { blogTips?: unknown }).blogTips

  // If already a valid object with non-empty fields, keep as-is.
  if (
    current &&
    typeof current === 'object' &&
    'title' in current &&
    'content' in current &&
    typeof (current as any).title === 'string' &&
    typeof (current as any).content === 'string' &&
    (current as any).title.trim() &&
    (current as any).content.trim()
  ) {
    return tour
  }

  const blogTips = buildFallbackBlogTips(tour)
  return {
    ...tour,
    blogTips,
  }
}

