import { useState } from 'react'
import type { ModelData, PrintSettings, FileRow, BOMRow, ChangelogRow } from '../types'

interface Props {
  data: ModelData
  onChange: (data: ModelData) => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-rajdhani text-xs px-2 py-0.5 rounded transition-colors ml-2"
      style={{ color: copied ? '#b46ef5' : '#4a4260', border: '1px solid #2a1d42', background: copied ? '#3d2b63' : 'transparent' }}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  )
}

export default function FormPanel({ data, onChange }: Props) {
  function update<K extends keyof ModelData>(key: K, value: ModelData[K]) {
    onChange({ ...data, [key]: value })
  }

  function updatePS<K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) {
    onChange({ ...data, printSettings: { ...data.printSettings, [key]: value } })
  }

  // Files
  function updateFile(index: number, field: keyof FileRow, value: string) {
    const files = data.files.map((f, i) => i === index ? { ...f, [field]: value } : f)
    update('files', files)
  }
  function addFile() { update('files', [...data.files, { filename: '', description: '' }]) }
  function removeFile(index: number) { update('files', data.files.filter((_, i) => i !== index)) }

  // BOM
  function updateBOM(index: number, field: keyof BOMRow, value: string) {
    const bom = data.bom.map((r, i) => i === index ? { ...r, [field]: value } : r)
    update('bom', bom)
  }
  function addBOM() { update('bom', [...data.bom, { qty: '', part: '', notes: '' }]) }
  function removeBOM(index: number) { update('bom', data.bom.filter((_, i) => i !== index)) }

  // Assembly
  function updateStep(index: number, value: string) {
    const steps = data.assemblySteps.map((s, i) => i === index ? value : s)
    update('assemblySteps', steps)
  }
  function addStep() { update('assemblySteps', [...data.assemblySteps, '']) }
  function removeStep(index: number) { update('assemblySteps', data.assemblySteps.filter((_, i) => i !== index)) }

  // Post-processing
  function updatePost(index: number, value: string) {
    const items = data.postProcessing.map((p, i) => i === index ? value : p)
    update('postProcessing', items)
  }
  function addPost() { update('postProcessing', [...data.postProcessing, '']) }
  function removePost(index: number) { update('postProcessing', data.postProcessing.filter((_, i) => i !== index)) }

  // Changelog
  function updateChangelog(index: number, field: keyof ChangelogRow, value: string) {
    const changelog = data.changelog.map((r, i) => i === index ? { ...r, [field]: value } : r)
    update('changelog', changelog)
  }
  function addChangelog() { update('changelog', [...data.changelog, { version: '', date: '', notes: '' }]) }
  function removeChangelog(index: number) { update('changelog', data.changelog.filter((_, i) => i !== index)) }

  return (
    <div className="p-4 space-y-4">

      {/* 1. Title & Summary */}
      <div className="section-card">
        <h2 className="section-heading">Title &amp; Summary</h2>
        <div className="mb-3">
          <label className="label">Title <CopyButton text={data.title} /></label>
          <input
            className="input"
            type="text"
            placeholder="My Awesome 3D Part"
            value={data.title}
            onChange={e => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Summary <CopyButton text={data.summary} /></label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="2–3 sentence summary for Printables upload form..."
            value={data.summary}
            onChange={e => update('summary', e.target.value)}
          />
        </div>
      </div>

      {/* 2. Overview */}
      <div className="section-card">
        <h2 className="section-heading">Overview</h2>
        <textarea
          className="textarea"
          rows={5}
          placeholder="Detailed description of the model, its purpose, design choices..."
          value={data.overview}
          onChange={e => update('overview', e.target.value)}
        />
      </div>

      {/* 3. Files */}
      <div className="section-card">
        <h2 className="section-heading">Files</h2>
        <div className="space-y-2 mb-3">
          {data.files.map((file, i) => (
            <div key={i} className="flex gap-2 items-center" style={{ opacity: 1, transition: 'opacity 0.2s' }}>
              <input
                className="input"
                style={{ width: '40%', flexShrink: 0 }}
                type="text"
                placeholder="filename.stl"
                value={file.filename}
                onChange={e => updateFile(i, 'filename', e.target.value)}
              />
              <input
                className="input flex-1"
                type="text"
                placeholder="Description"
                value={file.description}
                onChange={e => updateFile(i, 'description', e.target.value)}
              />
              {data.files.length > 1 && (
                <button className="btn-danger flex-shrink-0" onClick={() => removeFile(i)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        <button className="btn-ghost" onClick={addFile}>+ Add File</button>
        <p className="text-ash text-xs mt-2 font-body">Add a .step or .f3d source file if possible</p>
      </div>

      {/* 4. Print Settings */}
      <div className="section-card">
        <h2 className="section-heading">Print Settings</h2>

        {/* Voron preset */}
        <label className="flex items-center gap-2 mb-3 cursor-pointer w-fit">
          <input
            type="checkbox"
            className="accent-spark w-4 h-4"
            checked={
              data.printSettings.material === 'ABS or ASA' &&
              data.printSettings.nozzle === '0.4 mm' &&
              data.printSettings.layerHeight === '0.2' &&
              data.printSettings.infill === '40' &&
              data.printSettings.infillPattern === 'Grid' &&
              data.printSettings.perimeters === '4' &&
              data.printSettings.topBottomLayers === '5' &&
              data.printSettings.supports === 'None' &&
              data.printSettings.supportInterface === false &&
              data.printSettings.brim === 'No' &&
              data.printSettings.notes === 'Use standard Voron print settings'
            }
            onChange={e => {
              if (e.target.checked) {
                onChange({
                  ...data,
                  printSettings: {
                    ...data.printSettings,
                    material: 'ABS or ASA',
                    customMaterial: '',
                    nozzle: '0.4 mm',
                    layerHeight: '0.2',
                    infill: '40',
                    infillPattern: 'Grid',
                    perimeters: '4',
                    topBottomLayers: '5',
                    supports: 'None',
                    supportInterface: false,
                    brim: 'No',
                    orientation: 'As exported',
                    notes: 'Use standard Voron print settings',
                  },
                })
              }
            }}
          />
          <span className="font-rajdhani text-sm text-ash">
            Use standard <span className="text-spark font-semibold">Voron</span> print settings
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="label">Material</label>
            <select
              className="input"
              value={data.printSettings.material}
              onChange={e => updatePS('material', e.target.value)}
            >
              {['PLA','PETG','ABS','ASA','ABS or ASA','TPU','Nylon','PC','Other'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {data.printSettings.material === 'Other' && (
            <div>
              <label className="label">Custom Material</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. PA-CF"
                value={data.printSettings.customMaterial}
                onChange={e => updatePS('customMaterial', e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="label">Nozzle</label>
            <select
              className="input"
              value={data.printSettings.nozzle}
              onChange={e => updatePS('nozzle', e.target.value)}
            >
              {['0.25 mm','0.4 mm','0.6 mm','0.8 mm'].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Layer Height</label>
            <select
              className="input"
              value={data.printSettings.layerHeight}
              onChange={e => updatePS('layerHeight', e.target.value)}
            >
              {['0.1','0.15','0.2','0.25','0.3'].map(lh => (
                <option key={lh} value={lh}>{lh} mm</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Infill %</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              value={data.printSettings.infill}
              onChange={e => updatePS('infill', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Infill Pattern</label>
            <select
              className="input"
              value={data.printSettings.infillPattern}
              onChange={e => updatePS('infillPattern', e.target.value)}
            >
              {['Gyroid','Grid','Honeycomb','Lightning','Cubic','Adaptive Cubic'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Perimeters / Walls</label>
            <input
              className="input"
              type="number"
              min={1}
              value={data.printSettings.perimeters}
              onChange={e => updatePS('perimeters', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Top / Bottom Layers</label>
            <input
              className="input"
              type="number"
              min={1}
              value={data.printSettings.topBottomLayers}
              onChange={e => updatePS('topBottomLayers', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Supports</label>
            <select
              className="input"
              value={data.printSettings.supports}
              onChange={e => updatePS('supports', e.target.value)}
            >
              {[
                'None',
                'Enforcers only',
                'Required — everywhere',
                'Required — touching build plate',
              ].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Brim</label>
            <select
              className="input"
              value={data.printSettings.brim}
              onChange={e => updatePS('brim', e.target.value)}
            >
              {['No','3 mm','5 mm','8 mm'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="label">Print Orientation</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Flat on widest face, no rotation needed"
              value={data.printSettings.orientation}
              onChange={e => updatePS('orientation', e.target.value)}
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input
              id="supportInterface"
              type="checkbox"
              className="accent-spark w-4 h-4"
              checked={data.printSettings.supportInterface}
              onChange={e => updatePS('supportInterface', e.target.checked)}
            />
            <label htmlFor="supportInterface" className="text-ash text-sm font-rajdhani cursor-pointer">
              Support Interface Layers
            </label>
          </div>

          <div className="col-span-2">
            <label className="label">Print Notes</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Any additional notes about print settings..."
              value={data.printSettings.notes}
              onChange={e => updatePS('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 5. Bill of Materials */}
      <div className="section-card">
        <h2 className="section-heading">Bill of Materials</h2>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            className="accent-spark w-4 h-4"
            checked={data.noBOM}
            onChange={e => update('noBOM', e.target.checked)}
          />
          <span className="text-ash text-sm font-rajdhani">No hardware required (print-in-place / friction fit)</span>
        </label>

        {!data.noBOM && (
          <>
            <div className="space-y-2 mb-3">
              {data.bom.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="input"
                    style={{ width: '70px', flexShrink: 0 }}
                    type="text"
                    placeholder="Qty"
                    value={row.qty}
                    onChange={e => updateBOM(i, 'qty', e.target.value)}
                  />
                  <input
                    className="input flex-1"
                    type="text"
                    placeholder="Part name"
                    value={row.part}
                    onChange={e => updateBOM(i, 'part', e.target.value)}
                  />
                  <input
                    className="input flex-1"
                    type="text"
                    placeholder="Notes"
                    value={row.notes}
                    onChange={e => updateBOM(i, 'notes', e.target.value)}
                  />
                  {data.bom.length > 1 && (
                    <button className="btn-danger flex-shrink-0" onClick={() => removeBOM(i)} title="Remove">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn-ghost" onClick={addBOM}>+ Add Part</button>
          </>
        )}
      </div>

      {/* 6. Assembly */}
      <div className="section-card">
        <h2 className="section-heading">Assembly</h2>
        <div className="space-y-2 mb-3">
          {data.assemblySteps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-spark font-rajdhani font-semibold text-sm mt-2.5 flex-shrink-0 w-5 text-right">
                {i + 1}.
              </span>
              <textarea
                className="textarea flex-1"
                rows={3}
                placeholder={`Step ${i + 1} instructions...`}
                value={step}
                onChange={e => updateStep(i, e.target.value)}
              />
              {data.assemblySteps.length > 1 && (
                <button className="btn-danger flex-shrink-0 mt-2" onClick={() => removeStep(i)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        <button className="btn-ghost" onClick={addStep}>+ Add Step</button>
      </div>

      {/* 7. Post-Processing */}
      <div className="section-card">
        <h2 className="section-heading">Post-Processing</h2>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            className="accent-spark w-4 h-4"
            checked={data.includePostProcessing}
            onChange={e => update('includePostProcessing', e.target.checked)}
          />
          <span className="text-ash text-sm font-rajdhani">Include post-processing section</span>
        </label>

        {data.includePostProcessing && (
          <>
            <div className="space-y-2 mb-3">
              {data.postProcessing.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="input flex-1"
                    type="text"
                    placeholder="Post-processing step..."
                    value={item}
                    onChange={e => updatePost(i, e.target.value)}
                  />
                  {data.postProcessing.length > 1 && (
                    <button className="btn-danger flex-shrink-0" onClick={() => removePost(i)} title="Remove">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn-ghost" onClick={addPost}>+ Add Item</button>
          </>
        )}
      </div>

      {/* 8. Compatibility */}
      <div className="section-card">
        <h2 className="section-heading">Compatibility</h2>
        <textarea
          className="textarea"
          rows={3}
          placeholder="List compatible printers, versions, or configurations..."
          value={data.compatibility}
          onChange={e => update('compatibility', e.target.value)}
        />
      </div>

      {/* 9. Changelog */}
      <div className="section-card">
        <h2 className="section-heading">Changelog</h2>
        <div className="space-y-2 mb-3">
          {data.changelog.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className="input"
                style={{ width: '80px', flexShrink: 0 }}
                type="text"
                placeholder="v1.0"
                value={row.version}
                onChange={e => updateChangelog(i, 'version', e.target.value)}
              />
              <input
                className="input"
                style={{ width: '130px', flexShrink: 0 }}
                type="date"
                value={row.date}
                onChange={e => updateChangelog(i, 'date', e.target.value)}
              />
              <input
                className="input flex-1"
                type="text"
                placeholder="What changed"
                value={row.notes}
                onChange={e => updateChangelog(i, 'notes', e.target.value)}
              />
              {data.changelog.length > 1 && (
                <button className="btn-danger flex-shrink-0" onClick={() => removeChangelog(i)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
        <button className="btn-ghost" onClick={addChangelog}>+ Add Version</button>
      </div>

      {/* 10. Metadata */}
      <div className="section-card">
        <h2 className="section-heading">Printables Upload Form Fields</h2>

        {/* Callout explaining the split */}
        <div className="mb-4 px-3 py-2.5 rounded border border-dusk bg-shadow/40 text-xs font-body leading-relaxed">
          <span className="text-spark font-semibold">These fields are filled directly in the Printables upload form</span>
          <span className="text-ash"> — they live above the description box and are </span>
          <span className="text-ghost">not</span>
          <span className="text-ash"> part of the text you paste. Use </span>
          <span className="text-ghost font-semibold">Copy for Printables</span>
          <span className="text-ash"> only for the description body.</span>
        </div>

        {/* Model name + summary reminder */}
        <div className="mb-3 px-3 py-2 rounded bg-abyss border border-shadow text-xs text-ash font-body">
          <span className="text-ghost">Model name</span> and <span className="text-ghost">Summary</span> are also separate upload form fields — copy them from the Title and Summary you filled in above.
        </div>

        <div className="mb-3">
          <label className="label">Tags <span className="text-slate normal-case">(space-separated on Printables)</span><CopyButton text={data.tags} /></label>
          <input
            className="input"
            type="text"
            placeholder="voron toolhead PETG functional"
            value={data.tags}
            onChange={e => update('tags', e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="label">Main Category</label>
          <select
            className="input"
            value={data.category}
            onChange={e => update('category', e.target.value)}
          >
            {[
              '3D Printers > Parts & Upgrades',
              '3D Printers > Parts & Upgrades > Voron',
              '3D Printers > Parts & Upgrades > Bambu Lab',
              '3D Printers > Parts & Upgrades > RatRig',
              '3D Printers > Parts & Upgrades > Creality',
              '3D Printers > Parts & Upgrades > Sovol',
              '3D Printers > Parts & Upgrades > Prusa',
              'Hobby & Makers > Tools',
              'Gadgets',
              'Household',
              'Other',
            ].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="label">License</label>
          <select
            className="input"
            value={data.license}
            onChange={e => update('license', e.target.value)}
          >
            {['CC BY-NC-SA 4.0','CC BY-SA 4.0','CC BY 4.0','CC0 1.0','GPL-3.0'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="label">Model Origin</label>
          <select
            className="input"
            value={data.modelOrigin}
            onChange={e => update('modelOrigin', e.target.value as ModelData['modelOrigin'])}
          >
            <option value="original">Original model — I made it</option>
            <option value="remix">Remix / variation of another model</option>
            <option value="reupload">Reupload from another website</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="label">Was AI used to create this model?</label>
          <div className="flex gap-4 mt-1">
            {([['yes', true], ['no', false], ['unset', null]] as const).map(([label, val]) => (
              <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  className="accent-spark"
                  name="aiUsed"
                  checked={data.aiUsed === val}
                  onChange={() => update('aiUsed', val)}
                />
                <span className="text-ash text-sm capitalize font-body">{label === 'unset' ? 'not answered' : label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Content Warnings</label>
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-spark w-4 h-4"
                checked={data.contentWarning}
                onChange={e => update('contentWarning', e.target.checked)}
              />
              <span className="text-ash text-sm font-body">Nudity, violence, profanity, or other potentially disturbing content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-spark w-4 h-4"
                checked={data.contentWarningPolitical}
                onChange={e => update('contentWarningPolitical', e.target.checked)}
              />
              <span className="text-ash text-sm font-body">Political content</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  )
}
