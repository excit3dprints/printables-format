import { useState } from 'react'
import type { ModelData } from './types'
import FormPanel from './components/FormPanel'
import PreviewPanel from './components/PreviewPanel'
import ModelViewer from './components/ModelViewer'

const today = new Date().toISOString().slice(0, 10)

const defaultData: ModelData = {
  title: '',
  summary: '',
  overview: '',
  files: [{ filename: '', description: '' }],
  printSettings: {
    material: 'PETG',
    customMaterial: '',
    nozzle: '0.4 mm',
    layerHeight: '0.2',
    infill: '40',
    infillPattern: 'Gyroid',
    perimeters: '4',
    topBottomLayers: '5',
    supports: 'None',
    supportInterface: false,
    brim: 'No',
    orientation: 'As exported',
    notes: '',
  },
  bom: [{ qty: '', part: '', notes: '' }],
  noBOM: false,
  assemblySteps: [''],
  includePostProcessing: false,
  postProcessing: [''],
  compatibility: '',
  changelog: [{ version: 'v1.0', date: today, notes: 'Initial release' }],
  license: 'CC BY-NC-SA 4.0',
  tags: '',
  category: '3D Printers > Parts & Upgrades',
}

type RightTab = 'preview' | 'viewer'

export default function App() {
  const [data, setData] = useState<ModelData>(defaultData)
  const [rightTab, setRightTab] = useState<RightTab>('preview')

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-void">
      {/* Header */}
      <header className="h-14 flex-shrink-0 bg-abyss border-b border-shadow flex items-center px-5 justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl tracking-widest text-ghost leading-none">
            EXCIT<span className="text-spark">3</span>D PRINTS
          </span>
          <div className="w-px h-6 bg-shadow" />
          <span className="font-rajdhani font-semibold text-sm text-ash tracking-wide uppercase">
            Printables Builder
          </span>
        </div>
        <span className="font-rajdhani text-sm text-slate tracking-wide">
          by Excit3d team
        </span>
      </header>

      {/* Main two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column — Form */}
        <div
          className="overflow-y-auto flex-shrink-0"
          style={{ width: '55%', borderRight: '1px solid #2a1d42' }}
        >
          <FormPanel data={data} onChange={setData} />
        </div>

        {/* Right column — Preview / Viewer */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex-shrink-0 bg-abyss border-b border-shadow flex gap-1 px-4 pt-3">
            <button
              onClick={() => setRightTab('preview')}
              className={`font-rajdhani font-semibold text-sm px-4 py-1.5 rounded-t transition-colors ${
                rightTab === 'preview'
                  ? 'bg-cavern text-ghost border border-b-0 border-shadow'
                  : 'text-ash hover:text-ghost'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setRightTab('viewer')}
              className={`font-rajdhani font-semibold text-sm px-4 py-1.5 rounded-t transition-colors ${
                rightTab === 'viewer'
                  ? 'bg-cavern text-ghost border border-b-0 border-shadow'
                  : 'text-ash hover:text-ghost'
              }`}
            >
              3D Viewer
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {rightTab === 'preview' ? (
              <div className="h-full overflow-y-auto">
                <PreviewPanel data={data} />
              </div>
            ) : (
              <div className="h-full">
                <ModelViewer />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
