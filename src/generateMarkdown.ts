import type { ModelData } from './types'


export function generateMarkdown(data: ModelData): string {
  const ps = data.printSettings
  const materialDisplay =
    ps.material === 'Other' && ps.customMaterial
      ? ps.customMaterial
      : ps.material

  // Files table
  const filesRows = data.files
    .filter(f => f.filename || f.description)
    .map(f => `| \`${f.filename || '—'}\` | ${f.description || '—'} |`)
    .join('\n')

  // BOM section
  let bomSection: string
  if (data.noBOM) {
    bomSection = '*No hardware required — print-in-place / friction fit.*'
  } else {
    const bomRows = data.bom
      .filter(r => r.qty || r.part || r.notes)
      .map(r => `| ${r.qty || '—'} | ${r.part || '—'} | ${r.notes || '—'} |`)
      .join('\n')
    bomSection = `| Qty | Part | Notes |\n|-----|------|-------|\n${bomRows || '| — | — | — |'}`
  }

  // Assembly steps
  const assemblyList = data.assemblySteps
    .filter(s => s.trim())
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n')

  // Post-processing section
  let postProcessingBlock = ''
  if (data.includePostProcessing) {
    const items = data.postProcessing
      .filter(p => p.trim())
      .map(p => `- ${p}`)
      .join('\n')
    postProcessingBlock = `## Post-Processing

${items || '- N/A'}

---

`
  }

  // Print settings notes
  const printNotesLine =
    ps.notes && ps.notes.trim()
      ? `\n**Notes on print settings:** ${ps.notes.trim()}\n`
      : ''

  // Changelog table
  const changelogRows = data.changelog
    .filter(r => r.version || r.date || r.notes)
    .map(r => `| ${r.version || '—'} | ${r.date || '—'} | ${r.notes || '—'} |`)
    .join('\n')

  return `${data.overview || ''}

---

## Files

| File | Description |
|------|-------------|
${filesRows || '| — | — |'}

---

## Print Settings

| Setting | Recommended Value |
|---------|-------------------|
| Material | ${materialDisplay} |
| Nozzle | ${ps.nozzle} |
| Layer Height | ${ps.layerHeight} mm |
| Infill | ${ps.infill}% |
| Infill Pattern | ${ps.infillPattern} |
| Perimeters / Walls | ${ps.perimeters} |
| Top / Bottom Layers | ${ps.topBottomLayers} |
| Supports | ${ps.supports} |
| Support Interface | ${ps.supportInterface ? 'Yes' : 'No'} |
| Brim | ${ps.brim} |
| Print Orientation | ${ps.orientation} |
${printNotesLine}
---

## Bill of Materials (Non-Printed Parts)

${bomSection}

---

## Assembly

${assemblyList || '1. No assembly required.'}

---

${postProcessingBlock}## Compatibility

${data.compatibility || ''}

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
${changelogRows || '| v1.0 | — | Initial release |'}

---

## About Excit3d

This model is part of the **Excit3d** open-source hardware library. We design and test parts for high-performance FDM machines — and sell the hardware to go with them.

- **Shop:** excit3d.shop
- **Discord:** discord.gg/G8Q7yUadBy
- **Contact:** support@excit3d.shop

If you print this, drop a make in the gallery — we love seeing builds in the wild.

---

<!--
PRINTABLES UPLOAD FORM CHECKLIST
=================================
[ ] Model name:    ${data.title || ''}
[ ] Summary:       ${data.summary || ''}
[ ] Main category: ${data.category || ''}
[ ] Tags:          ${data.tags || ''}
[ ] License:       ${data.license}
[ ] Model origin:  ${data.modelOrigin === 'original' ? 'Original model' : data.modelOrigin === 'remix' ? 'Remix / variation' : 'Reupload'}
[ ] AI used:       ${data.aiUsed === true ? 'Yes — AI-assisted' : data.aiUsed === false ? 'No — fully human-made' : '(not answered)'}
${data.contentWarning ? '[ ] Content warning: nudity/violence/profanity/disturbing content\n' : ''}${data.contentWarningPolitical ? '[ ] Content warning: political content\n' : ''}[ ] Upload STL/3MF/STEP files
[ ] Upload cover photo
[ ] Paste description (use "Copy for Printables" button)
-->
`
}
