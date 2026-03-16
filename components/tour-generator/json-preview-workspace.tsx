'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PreviewTab } from './preview-tab'
import { RawJsonTab } from './raw-json-tab'
import { ValidationTab } from './validation-tab'
import type { Tour } from '@/lib/schema/tour-schema'
import type { PreviewTabId } from './types'
import type { RegeneratableTourSection } from '@/lib/types/section'
import type { SectionValue } from './section-editor'
import { FileJson, ListChecks, LayoutTemplate } from 'lucide-react'

interface JsonPreviewWorkspaceProps {
  result: Tour | null
  activeTab: PreviewTabId
  onTabChange: (tab: PreviewTabId) => void
  repaired?: boolean
  warnings?: string[]
  validationErrors?: Array<{ path: string; message: string }> | null
  editingSection?: RegeneratableTourSection | null
  regeneratingSection?: RegeneratableTourSection | null
  onEditSection?: (section: RegeneratableTourSection) => void
  onRegenerateSection?: (section: RegeneratableTourSection) => void
  onSaveSection?: (section: RegeneratableTourSection, value: SectionValue) => void
  onCancelEdit?: () => void
}

export function JsonPreviewWorkspace({
  result,
  activeTab,
  onTabChange,
  repaired = false,
  warnings = [],
  validationErrors = null,
  editingSection = null,
  regeneratingSection = null,
  onEditSection,
  onRegenerateSection,
  onSaveSection,
  onCancelEdit,
}: JsonPreviewWorkspaceProps) {
  const jsonString = result ? JSON.stringify(result, null, 2) : ''

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col min-h-0">
      <CardHeader className="pb-3 shrink-0">
        <h2 className="text-sm font-medium text-foreground">Output</h2>
        <p className="text-xs text-muted-foreground">
          Preview, raw JSON, and validation status.
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col pt-0">
        {!result ? (
          <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center min-h-[320px]">
            <p className="text-sm text-muted-foreground">
              Generate a tour to see output here.
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as PreviewTabId)}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="w-full grid grid-cols-3 shrink-0 mb-3">
              <TabsTrigger value="preview" className="gap-1.5">
                <LayoutTemplate className="size-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="raw-json" className="gap-1.5">
                <FileJson className="size-3.5" />
                Raw JSON
              </TabsTrigger>
              <TabsTrigger value="validation" className="gap-1.5">
                <ListChecks className="size-3.5" />
                Validation
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
              <PreviewTab
                tour={result}
                editingSection={editingSection ?? null}
                regeneratingSection={regeneratingSection ?? null}
                onEditSection={onEditSection ?? (() => {})}
                onRegenerateSection={onRegenerateSection ?? (() => {})}
                onSaveSection={onSaveSection ?? (() => {})}
                onCancelEdit={onCancelEdit ?? (() => {})}
                sectionActionsEnabled={Boolean(onEditSection && onRegenerateSection && onSaveSection && onCancelEdit)}
              />
            </TabsContent>
            <TabsContent value="raw-json" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
              <RawJsonTab jsonString={jsonString} />
            </TabsContent>
            <TabsContent value="validation" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
              <ValidationTab
                isValid={true}
                repaired={repaired}
                warnings={warnings}
                validationErrors={validationErrors}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
