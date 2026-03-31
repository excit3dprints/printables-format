export interface FileRow { filename: string; description: string }
export interface BOMRow { qty: string; part: string; notes: string }
export interface ChangelogRow { version: string; date: string; notes: string }

export interface PrintSettings {
  material: string;
  customMaterial: string;
  nozzle: string;
  layerHeight: string;
  infill: string;
  infillPattern: string;
  perimeters: string;
  topBottomLayers: string;
  supports: string;
  supportInterface: boolean;
  brim: string;
  orientation: string;
  notes: string;
}

export interface ModelData {
  title: string;
  summary: string;
  overview: string;
  files: FileRow[];
  printSettings: PrintSettings;
  bom: BOMRow[];
  noBOM: boolean;
  assemblySteps: string[];
  includePostProcessing: boolean;
  postProcessing: string[];
  compatibility: string;
  changelog: ChangelogRow[];
  license: string;
  tags: string;
  category: string;
}
