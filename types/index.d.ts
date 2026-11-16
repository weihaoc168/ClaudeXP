export type DeskScheme = 'standard' | 'rose' | 'slate' | 'eggplant'
export type DeskWallpaper = 'meadow' | 'teal' | 'navy' | 'black' | 'olive' | 'clouds'
export type DeskZoom = '100' | '80' | '65' | '50'
export type DeskSettings = { scheme: DeskScheme; wallpaper: DeskWallpaper; zoom: DeskZoom; icons: boolean; taskbar: boolean; startup: boolean }
export type DeskCall = { id: string; tool: string; isDone: boolean; isError: boolean }
export type DeskMenu = 'file' | 'edit' | 'view'
export type DeskMonitorView = { bars: boolean; log: boolean }
export type DeskTab = 'background' | 'appearance' | 'effects'

declare module 'claude-code' {
  interface PluginState {
    claudexp: {
      settings: Shaped<DeskSettings>
      draft: Shaped<DeskSettings | null>
      tab: DeskTab
      calls: Shaped<DeskCall[]>
      isStartOpen: boolean
      monitorMenu: DeskMenu | null
      monitorView: Shaped<DeskMonitorView>
    }
  }
}
