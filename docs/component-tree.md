# Component Tree (MVP)

## Global shell

```txt
AppRoot
└─ Providers
   ├─ AuthProvider
   ├─ QueryProvider
   ├─ ToastProvider
   └─ ThemeProvider
└─ AppLayout
   ├─ SidebarNav
   ├─ Topbar
   └─ MainContent
```

## Onboarding flow

```txt
OnboardingPage
├─ ResumeUploadCard
│  ├─ ResumeDropzone
│  └─ ParseStatusBadge
├─ ParsedProfileReviewPanel
│  ├─ ProfileFieldRow (confidence + editable)
│  ├─ MissingInfoAlert
│  └─ AcceptExtractedFactsButton
└─ ProfileCompletionForm
   ├─ PreferencesSection
   ├─ TargetRolesSection
   └─ SaveProfileButton
```

## Job intake + parsing

```txt
JobCreatePage
├─ JobSourceSelector (text | url)
├─ JobTextInput
├─ JobUrlInput
└─ ParseJobButton

JobDetailsPage
├─ ParsedJobSummaryCard
├─ RequirementsEditor
├─ ResponsibilitiesEditor
├─ SkillsBreakdownEditor
└─ SaveJobButton
```

## Fit analysis

```txt
JobAnalysisPage
├─ MatchScoreCard
├─ RecommendationBadge
├─ MustHaveComparisonTable
├─ NiceToHaveComparisonTable
├─ StrengthsList
├─ GapList
└─ ReasoningPanel
```

## Application generation + review

```txt
JobApplicationPage
├─ GenerationControlsCard
│  ├─ ToneSelector
│  ├─ SectionSelector
│  └─ GeneratePacketButton
└─ GenerationPreviewList

ReviewWorkspacePage
├─ FactsUsedPanel
├─ ParsedJobPanel
├─ ConfidenceWarningsPanel
├─ MissingDataWarningsPanel
├─ EditableSectionList
│  └─ EditableSectionCard
│     ├─ SectionHeader (confidence badge)
│     ├─ InlineEditor
│     ├─ RegenerateSectionButton
│     └─ FactSourcesPopover
├─ DraftHistoryPanel
└─ ApprovePacketButton
```

## Saved workflow

```txt
ApplicationsListPage
├─ ApplicationFilters
├─ ApplicationTable
└─ EmptyState

ApplicationDetailsPage
├─ ApplicationHeader
├─ AnswerSectionTabs
├─ EditableSectionList
├─ VersionTimeline
└─ ExportActions
```
