/**
 * Locked Tour Template schema for AI-generated content.
 * Reject extra fields, missing required fields, and wrong types.
 */

import { z } from 'zod'

/** Single itinerary day. */
export const itineraryDaySchema = z
  .object({
    day: z.number(),
    title: z.string(),
    activities: z.array(z.string()),
  })
  .strict()

/** Single map stop (coordinates + label). */
export const mapStopSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
    label: z.string(),
  })
  .strict()

/** Single FAQ item. */
export const faqItemSchema = z
  .object({
    question: z.string(),
    answer: z.string(),
  })
  .strict()

/** Single blog tip (title + content). */
export const blogTipSchema = z
  .object({
    title: z.string(),
    content: z.string(),
  })
  .strict()

/** Single "thing to do" item. */
export const thingToDoSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
  })
  .strict()

/** Full Tour document — locked template. */
export const tourSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    location: z.string(),
    destination: z.string(),
    duration: z.string(),
    price: z.string().optional(),
    rating: z.number().optional(),
    reviews: z.number().optional(),
    image: z.string().optional(),
    tag: z.string().optional(),
    maxTravelers: z.number().optional(),
    groupSize: z.string().optional(),
    description: z.string(),
    highlights: z.array(z.string()),
    included: z.array(z.string()).optional(),
    itinerary: z.array(itineraryDaySchema),
    mapStops: z.array(mapStopSchema).optional(),
    thingsToDo: z.array(thingToDoSchema).optional(),
    blogTips: z.union([z.string(), z.array(blogTipSchema)]).optional(),
    faqs: z.array(faqItemSchema),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  })
  .strict()

export type ItineraryDay = z.infer<typeof itineraryDaySchema>
export type MapStop = z.infer<typeof mapStopSchema>
export type FaqItem = z.infer<typeof faqItemSchema>
export type BlogTip = z.infer<typeof blogTipSchema>
export type ThingToDo = z.infer<typeof thingToDoSchema>
export type Tour = z.infer<typeof tourSchema>
