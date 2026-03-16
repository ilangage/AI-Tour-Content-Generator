'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GeneratorHeader } from './generator-header'
import { CsvUploadCard } from './csv-upload-card'
import { ItineraryInputCard } from './itinerary-input-card'
import { StatusAlert } from './status-alert'
import { JsonPreviewWorkspace } from './json-preview-workspace'
import { DraftsPanel } from './drafts-panel'
import type { GenerationUiState, ApiSuccessResponse, ApiErrorResponse } from './types'
import type { Tour } from '@/lib/schema/tour-schema'
import type { SavedTourDraft } from '@/lib/types/draft'
import type { RegeneratableTourSection } from '@/lib/types/section'
import type { SectionValue } from './section-editor'
import { mergeRegeneratedSection } from '@/lib/tour/merge-regenerated-section'
import { RegenerateSectionDialog } from './regenerate-section-dialog'
import {
  canExportTour,
  downloadTourJson,
  copyTourJsonToClipboard,
} from '@/lib/export/download-tour-json'

const API_ENDPOINT = '/api/tour/generate'
const REGENERATE_SECTION_API = '/api/tour/regenerate-section'
const DRAFTS_API = '/api/tour/drafts'
const FORM_FIELD_CSV = 'csv'
const FORM_FIELD_ITINERARY = 'itinerary'

const INITIAL_STATE: GenerationUiState = {
  isLoading: false,
  error: null,
  result: null,
  repaired: false,
  warnings: [],
  activeTab: 'preview',
  validationErrors: null,
}

export function TourGeneratorWorkspace() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [itineraryText, setItineraryText] = useState('')
  const [state, setState] = useState<GenerationUiState>(INITIAL_STATE)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [draftListRefresh, setDraftListRefresh] = useState(0)
  const [editingSection, setEditingSection] = useState<RegeneratableTourSection | null>(null)
  const [regeneratingSection, setRegeneratingSection] = useState<RegeneratableTourSection | null>(null)
  const [sectionRegenerateError, setSectionRegenerateError] = useState<string | null>(null)
  const [sectionRegenerateLoading, setSectionRegenerateLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!copySuccess) return
    const t = setTimeout(() => setCopySuccess(false), 2000)
    return () => clearTimeout(t)
  }, [copySuccess])

  useEffect(() => {
    if (!downloadSuccess) return
    const t = setTimeout(() => setDownloadSuccess(false), 2000)
    return () => clearTimeout(t)
  }, [downloadSuccess])

  useEffect(() => {
    if (!copyError && !downloadError) return
    const t = setTimeout(() => {
      setCopyError(null)
      setDownloadError(null)
    }, 4000)
    return () => clearTimeout(t)
  }, [copyError, downloadError])

  const runGeneration = useCallback(async () => {
    if (!csvFile) {
      setState((s) => ({ ...s, error: 'Please upload a keyword research CSV file.', validationErrors: null }))
      return
    }
    const trimmed = itineraryText.trim()
    if (!trimmed) {
      setState((s) => ({ ...s, error: 'Please enter raw tour itinerary details.', validationErrors: null }))
      return
    }

    setState((s) => ({
      ...s,
      isLoading: true,
      error: null,
      result: null,
      repaired: false,
      warnings: [],
      validationErrors: null,
    }))
    setCurrentDraftId(null)

    try {
      const formData = new FormData()
      formData.append(FORM_FIELD_CSV, csvFile)
      formData.append(FORM_FIELD_ITINERARY, trimmed)

      const res = await fetch(API_ENDPOINT, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        const err = data as ApiErrorResponse
        const validationErrors = err.details?.validationErrors ?? null
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err.error ?? 'Generation failed',
          validationErrors,
          result: null,
        }))
        return
      }

      const success = data as ApiSuccessResponse
      if (success.data == null) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'No data in response.',
          result: null,
        }))
        return
      }

      setState((s) => ({
        ...s,
        isLoading: false,
        error: null,
        result: success.data as Tour,
        repaired: success.repaired ?? false,
        warnings: success.warnings ?? [],
        validationErrors: null,
        activeTab: 'preview',
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Something went wrong.',
        result: null,
        validationErrors: null,
      }))
    }
  }, [csvFile, itineraryText])

  const reset = useCallback(() => {
    setCsvFile(null)
    setItineraryText('')
    setState(INITIAL_STATE)
    setCurrentDraftId(null)
    formRef.current?.reset()
  }, [])

  const buildDraftPayload = useCallback(() => {
    if (!state.result) return null
    return {
      title: state.result.title,
      destination: state.result.destination,
      data: state.result,
      repaired: state.repaired,
      warnings: state.warnings,
      sourceItinerary: itineraryText.trim() || undefined,
      keywordSummary: undefined as string | undefined,
    }
  }, [state.result, state.repaired, state.warnings, itineraryText])

  const saveDraft = useCallback(async () => {
    const payload = buildDraftPayload()
    if (!payload) return
    try {
      const res = await fetch(DRAFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      const draft = (await res.json()) as SavedTourDraft
      setCurrentDraftId(draft.id)
      setDraftListRefresh((n) => n + 1)
    } catch {
      setState((s) => ({ ...s, error: 'Failed to save draft.' }))
    }
  }, [buildDraftPayload])

  const updateDraft = useCallback(async () => {
    if (!currentDraftId) return
    const payload = buildDraftPayload()
    if (!payload) return
    try {
      const res = await fetch(`${DRAFTS_API}/${currentDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Update failed')
      setDraftListRefresh((n) => n + 1)
    } catch {
      setState((s) => ({ ...s, error: 'Failed to update draft.' }))
    }
  }, [currentDraftId, buildDraftPayload])

  const saveAsNew = useCallback(async () => {
    const payload = buildDraftPayload()
    if (!payload) return
    try {
      const res = await fetch(DRAFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      const draft = (await res.json()) as SavedTourDraft
      setCurrentDraftId(draft.id)
      setDraftListRefresh((n) => n + 1)
    } catch {
      setState((s) => ({ ...s, error: 'Failed to save draft.' }))
    }
  }, [buildDraftPayload])

  const openDraft = useCallback((draft: SavedTourDraft) => {
    setState((s) => ({
      ...s,
      error: null,
      result: draft.data,
      repaired: draft.repaired ?? false,
      warnings: draft.warnings ?? [],
      validationErrors: null,
      activeTab: 'preview',
    }))
    setItineraryText(draft.sourceItinerary ?? '')
    setCurrentDraftId(draft.id)
  }, [])

  const duplicateDraft = useCallback(async (draft: SavedTourDraft) => {
    try {
      const res = await fetch(DRAFTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          destination: draft.destination,
          data: draft.data,
          repaired: draft.repaired,
          warnings: draft.warnings,
          sourceItinerary: draft.sourceItinerary,
          keywordSummary: draft.keywordSummary,
        }),
      })
      if (!res.ok) throw new Error('Duplicate failed')
      const created = (await res.json()) as SavedTourDraft
      setDraftListRefresh((n) => n + 1)
      openDraft(created)
    } catch {
      setState((s) => ({ ...s, error: 'Failed to duplicate draft.' }))
    }
  }, [openDraft])

  const onDraftDeleted = useCallback((deletedId: string) => {
    if (currentDraftId === deletedId) setCurrentDraftId(null)
  }, [currentDraftId])

  const copyJson = useCallback(async () => {
    setCopyError(null)
    const result = await copyTourJsonToClipboard(state.result)
    if (result.success) {
      setCopySuccess(true)
    } else {
      setCopyError(result.message)
    }
  }, [state.result])

  const downloadJson = useCallback(() => {
    setDownloadError(null)
    const result = downloadTourJson(state.result)
    if (result.success) {
      setDownloadSuccess(true)
    } else {
      setDownloadError(result.message)
    }
  }, [state.result])

  const canExport = canExportTour(state.result)

  const handleEditSection = useCallback((section: RegeneratableTourSection) => {
    setEditingSection(section)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingSection(null)
  }, [])

  const handleSaveSection = useCallback((section: RegeneratableTourSection, value: SectionValue) => {
    if (!state.result) return
    const merged = mergeRegeneratedSection(state.result, section, value)
    if (merged.ok) {
      setState((s) => ({ ...s, result: merged.tour }))
      setEditingSection(null)
    }
  }, [state.result])

  const handleStartRegenerate = useCallback((section: RegeneratableTourSection) => {
    setRegeneratingSection(section)
    setSectionRegenerateError(null)
  }, [])

  const handleConfirmRegenerate = useCallback(async (instruction: string) => {
    if (!regeneratingSection || !state.result) return
    setSectionRegenerateLoading(true)
    setSectionRegenerateError(null)
    try {
      const res = await fetch(REGENERATE_SECTION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: regeneratingSection,
          currentTour: state.result,
          sourceItinerary: itineraryText.trim() || undefined,
          instruction: instruction || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSectionRegenerateError(data.error ?? 'Regeneration failed')
        return
      }
      if (data.data) {
        setState((s) => ({ ...s, result: data.data as Tour }))
        setRegeneratingSection(null)
      }
    } catch {
      setSectionRegenerateError('Something went wrong.')
    } finally {
      setSectionRegenerateLoading(false)
    }
  }, [regeneratingSection, state.result, itineraryText])

  const handleCloseRegenerateDialog = useCallback(() => {
    setRegeneratingSection(null)
    setSectionRegenerateError(null)
  }, [])

  const statusType =
    state.isLoading
      ? 'loading'
      : state.error
        ? 'error'
        : state.result
          ? state.repaired
            ? 'repaired'
            : 'success'
          : 'idle'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GeneratorHeader
        onGenerate={runGeneration}
        onReset={reset}
        onCopyJson={copyJson}
        onDownloadJson={downloadJson}
        onSaveDraft={saveDraft}
        onUpdateDraft={updateDraft}
        onSaveAsNew={saveAsNew}
        isLoading={state.isLoading}
        hasResult={state.result != null}
        hasCurrentDraft={currentDraftId != null}
        result={state.result}
        canExport={canExport}
        copySuccess={copySuccess}
        copyError={copyError}
        downloadSuccess={downloadSuccess}
        downloadError={downloadError}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: inputs, workflow, drafts */}
          <div className="lg:col-span-2 space-y-4">
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); runGeneration(); }}>
              <CsvUploadCard
                file={csvFile}
                onFileChange={(f) => {
                  setCsvFile(f)
                  setState((s) => ({ ...s, error: null }))
                }}
                disabled={state.isLoading}
              />
            </form>
            <ItineraryInputCard
              value={itineraryText}
              onChange={(v) => {
                setItineraryText(v)
                setState((s) => ({ ...s, error: null }))
              }}
              disabled={state.isLoading}
            />
            <StatusAlert
              status={statusType}
              errorMessage={state.error}
              validationErrors={state.validationErrors}
              repaired={state.repaired}
              warnings={state.warnings}
            />
            <DraftsPanel
              onOpenDraft={openDraft}
              onDuplicateDraft={duplicateDraft}
              onDraftDeleted={onDraftDeleted}
              refreshTrigger={draftListRefresh}
            />
          </div>

          {/* Right: JSON preview workspace */}
          <div className="lg:col-span-3">
            <JsonPreviewWorkspace
              result={state.result}
              activeTab={state.activeTab}
              onTabChange={(tab) => setState((s) => ({ ...s, activeTab: tab }))}
              repaired={state.repaired}
              warnings={state.warnings}
              validationErrors={state.validationErrors}
              editingSection={editingSection}
              regeneratingSection={regeneratingSection}
              onEditSection={handleEditSection}
              onRegenerateSection={handleStartRegenerate}
              onSaveSection={handleSaveSection}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>
      </main>

      <RegenerateSectionDialog
        open={regeneratingSection != null}
        section={regeneratingSection}
        onClose={handleCloseRegenerateDialog}
        onConfirm={handleConfirmRegenerate}
        isLoading={sectionRegenerateLoading}
        error={sectionRegenerateError}
      />
    </div>
  )
}
