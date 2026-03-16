'use client'

import type { Tour } from '@/lib/schema/tour-schema'
import type { RegeneratableTourSection } from '@/lib/types/section'
import type { SectionValue } from './section-editor'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EditableSectionCard } from './editable-section-card'
import { cn } from '@/lib/utils'
import { SeoChecklist } from './seo-checklist'

export function getSectionValue(tour: Tour, section: RegeneratableTourSection): SectionValue {
  switch (section) {
    case 'title':
      return tour.title
    case 'description':
      return tour.description
    case 'highlights':
      return tour.highlights ?? []
    case 'included':
      return tour.included ?? []
    case 'itinerary':
      return tour.itinerary ?? []
    case 'blogTips':
      if (typeof tour.blogTips === 'string') return tour.blogTips
      return tour.blogTips ?? []
    case 'faqs':
      return tour.faqs ?? []
    case 'metaTitle':
      return (tour as Tour & { metaTitle?: string }).metaTitle ?? ''
    case 'metaDescription':
      return (tour as Tour & { metaDescription?: string }).metaDescription ?? ''
    default:
      return ''
  }
}

interface PreviewTabProps {
  tour: Tour
  primaryKeyword?: string
  editingSection: RegeneratableTourSection | null
  regeneratingSection: RegeneratableTourSection | null
  onEditSection: (section: RegeneratableTourSection) => void
  onRegenerateSection: (section: RegeneratableTourSection) => void
  onSaveSection: (section: RegeneratableTourSection, value: SectionValue) => void
  onCancelEdit: () => void
  sectionActionsEnabled?: boolean
}

export function PreviewTab({
  tour,
  primaryKeyword,
  editingSection,
  regeneratingSection,
  onEditSection,
  onRegenerateSection,
  onSaveSection,
  onCancelEdit,
  sectionActionsEnabled = true,
}: PreviewTabProps) {
  return (
    <ScrollArea className="h-[420px] w-full rounded-md">
      <div className="space-y-6 pr-4">
        <SeoChecklist tour={tour} primaryKeyword={primaryKeyword} />
        <EditableSectionCard
          section="title"
          label="Title & destination"
          sectionActionsEnabled={sectionActionsEnabled}
          value={getSectionValue(tour, 'title')}
          isEditing={editingSection === 'title'}
          isRegenerating={regeneratingSection === 'title'}
          readContent={
            <>
              <p className="font-medium">{tour.title}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {tour.location}
                {tour.destination ? ` · ${tour.destination}` : ''} · {tour.duration}
              </p>
            </>
          }
          onEdit={() => onEditSection('title')}
          onRegenerate={() => onRegenerateSection('title')}
          onSaveSection={(v) => onSaveSection('title', v)}
          onCancelEdit={onCancelEdit}
        />

        <EditableSectionCard
          section="description"
          sectionActionsEnabled={sectionActionsEnabled}
          label="Description"
          value={getSectionValue(tour, 'description')}
          isEditing={editingSection === 'description'}
          isRegenerating={regeneratingSection === 'description'}
          readContent={<p className="whitespace-pre-wrap">{tour.description}</p>}
          onEdit={() => onEditSection('description')}
          onRegenerate={() => onRegenerateSection('description')}
          onSaveSection={(v) => onSaveSection('description', v)}
          onCancelEdit={onCancelEdit}
        />

        {tour.highlights && tour.highlights.length > 0 && (
          <EditableSectionCard
            section="highlights"
            label="Highlights"
            value={getSectionValue(tour, 'highlights')}
            isEditing={editingSection === 'highlights'}
            isRegenerating={regeneratingSection === 'highlights'}
            readContent={
              <ul className="list-disc list-inside space-y-1">
                {tour.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            }
            onEdit={() => onEditSection('highlights')}
            onRegenerate={() => onRegenerateSection('highlights')}
            onSaveSection={(v) => onSaveSection('highlights', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {tour.included && tour.included.length > 0 && (
          <EditableSectionCard
            section="included"
            label="Included"
            value={getSectionValue(tour, 'included')}
            isEditing={editingSection === 'included'}
            isRegenerating={regeneratingSection === 'included'}
            readContent={
              <ul className="list-disc list-inside space-y-1">
                {tour.included.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            }
            onEdit={() => onEditSection('included')}
            onRegenerate={() => onRegenerateSection('included')}
            onSaveSection={(v) => onSaveSection('included', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {tour.itinerary && tour.itinerary.length > 0 && (
          <EditableSectionCard
            section="itinerary"
            label="Itinerary"
            value={getSectionValue(tour, 'itinerary')}
            isEditing={editingSection === 'itinerary'}
            isRegenerating={regeneratingSection === 'itinerary'}
            readContent={
              <div className="space-y-4">
                {tour.itinerary.map((day, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                    <p className="font-medium text-foreground">
                      Day {day.day}: {day.title}
                    </p>
                    {day.activities?.length > 0 && (
                      <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                        {day.activities.map((a, j) => (
                          <li key={j}>{a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            }
            onEdit={() => onEditSection('itinerary')}
            onRegenerate={() => onRegenerateSection('itinerary')}
            onSaveSection={(v) => onSaveSection('itinerary', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {(tour as Tour & { metaTitle?: string }).metaTitle != null && (
          <EditableSectionCard
            section="metaTitle"
            label="Meta title"
            value={getSectionValue(tour, 'metaTitle')}
            isEditing={editingSection === 'metaTitle'}
            isRegenerating={regeneratingSection === 'metaTitle'}
            readContent={<p className="text-muted-foreground">{(tour as Tour & { metaTitle?: string }).metaTitle}</p>}
            onEdit={() => onEditSection('metaTitle')}
            onRegenerate={() => onRegenerateSection('metaTitle')}
            onSaveSection={(v) => onSaveSection('metaTitle', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {(tour as Tour & { metaDescription?: string }).metaDescription != null && (
          <EditableSectionCard
            section="metaDescription"
            label="Meta description"
            value={getSectionValue(tour, 'metaDescription')}
            isEditing={editingSection === 'metaDescription'}
            isRegenerating={regeneratingSection === 'metaDescription'}
            readContent={<p className="text-muted-foreground">{(tour as Tour & { metaDescription?: string }).metaDescription}</p>}
            onEdit={() => onEditSection('metaDescription')}
            onRegenerate={() => onRegenerateSection('metaDescription')}
            onSaveSection={(v) => onSaveSection('metaDescription', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {tour.faqs && tour.faqs.length > 0 && (
          <EditableSectionCard
            section="faqs"
            label="FAQs"
            value={getSectionValue(tour, 'faqs')}
            isEditing={editingSection === 'faqs'}
            isRegenerating={regeneratingSection === 'faqs'}
            readContent={
              <div className="space-y-3">
                {tour.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                    <p className="font-medium text-foreground text-sm">{faq.question}</p>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            }
            onEdit={() => onEditSection('faqs')}
            onRegenerate={() => onRegenerateSection('faqs')}
            onSaveSection={(v) => onSaveSection('faqs', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}

        {tour.blogTips != null && (typeof tour.blogTips === 'string' || (Array.isArray(tour.blogTips) && tour.blogTips.length > 0)) && (
          <EditableSectionCard
            section="blogTips"
            label="Blog tips"
            value={getSectionValue(tour, 'blogTips')}
            isEditing={editingSection === 'blogTips'}
            isRegenerating={regeneratingSection === 'blogTips'}
            readContent={
              typeof tour.blogTips === 'string' ? (
                <p className="whitespace-pre-wrap">{tour.blogTips}</p>
              ) : (
                <div className="space-y-2">
                  {(tour.blogTips as Array<{ title: string; content: string }>).map((t, i) => (
                    <div key={i} className="rounded border p-2">
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-muted-foreground text-sm">{t.content}</p>
                    </div>
                  ))}
                </div>
              )
            }
            onEdit={() => onEditSection('blogTips')}
            onRegenerate={() => onRegenerateSection('blogTips')}
            onSaveSection={(v) => onSaveSection('blogTips', v)}
            onCancelEdit={onCancelEdit}
            sectionActionsEnabled={sectionActionsEnabled}
          />
        )}
      </div>
    </ScrollArea>
  )
}
