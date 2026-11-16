import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { DeskCall, DeskMenu, DeskMonitorView, DeskScheme, DeskSettings, DeskTab, DeskWallpaper, DeskZoom } from '../types'
import {
  SCHEME_OPTIONS,
  WALLPAPERS,
  ZOOMS,
  accentOf,
  allProblems,
  blockingProblem,
  iconSvg,
  lookFor,
  previewSvg,
  sceneSvg,
} from './look'

const DISPLAY = 'display-properties'
const MONITOR = 'system-monitor'
const STORE_KEY = 'settings-v2'

const DEFAULTS: DeskSettings = { scheme: 'standard', wallpaper: 'meadow', zoom: '65', icons: true, taskbar: true, startup: true }

const settings = atom({ plugin: 'claudexp', key: 'settings' } as const, DEFAULTS, { shape: 'settings-3' })
const draft = atom({ plugin: 'claudexp', key: 'draft' } as const, null, { shape: 'draft-3' })
const tab = atom({ plugin: 'claudexp', key: 'tab' } as const, 'background' as DeskTab)
const calls = atom({ plugin: 'claudexp', key: 'calls' } as const, [], { shape: 'calls-1' })
const isStartOpen = atom({ plugin: 'claudexp', key: 'isStartOpen' } as const, false)
const monitorMenu = atom({ plugin: 'claudexp', key: 'monitorMenu' } as const, null as DeskMenu | null)
const monitorView = atom({ plugin: 'claudexp', key: 'monitorView' } as const, { bars: true, log: true } as DeskMonitorView, { shape: 'view-1' })

// Classic window chrome colors, fixed so the windows read the same in both modes.
const SILVER = '#c0c0c0'
const SHADOW = '#808080'
const WHITE = '#ffffff'
const INK = '#000000'
const NAVY = '#000080'

// A Win98 push button drawn by the mod: black text on silver, navy when
// active. The app's own button styles go pale in dark mode on these boxes.
type WinButtonArgs = { id: string; label: string; isActive?: boolean; onPress: () => unknown }
const winButton = (ui: ReturnType<EngineInterface['ui']['resolve']>, a: WinButtonArgs) => {
  const { Box, Text, Button } = ui
  return (
    <Box key={a.id} backgroundColor={a.isActive ? NAVY : SILVER} borderStyle="single" borderColor={a.isActive ? NAVY : SHADOW} paddingX={1}>
      <Button key={`${a.id}-b`} plain label={a.label} onPress={a.onPress}>
        <Text color={a.isActive ? WHITE : INK} weight={a.isActive ? 'bold' : undefined}>
          {a.label}
        </Text>
      </Button>
    </Box>
  )
}

// Which surface last asked for the backdrop, for /win98-check.
let lastBackdrop: string | undefined

const sanitize = (raw: unknown): DeskSettings => {
  const v = (raw ?? {}) as Partial<DeskSettings>
  const schemes: DeskScheme[] = ['standard', 'rose', 'slate', 'eggplant']
  const walls: DeskWallpaper[] = ['meadow', 'teal', 'navy', 'black', 'olive', 'clouds']
  return {
    scheme: schemes.includes(v.scheme as DeskScheme) ? (v.scheme as DeskScheme) : DEFAULTS.scheme,
    wallpaper: walls.includes(v.wallpaper as DeskWallpaper) ? (v.wallpaper as DeskWallpaper) : DEFAULTS.wallpaper,
    zoom: (['100', '80', '65', '50'] as DeskZoom[]).includes(v.zoom as DeskZoom) ? (v.zoom as DeskZoom) : DEFAULTS.zoom,
    icons: typeof v.icons === 'boolean' ? v.icons : DEFAULTS.icons,
    taskbar: typeof v.taskbar === 'boolean' ? v.taskbar : DEFAULTS.taskbar,
    startup: typeof v.startup === 'boolean' ? v.startup : DEFAULTS.startup,
  }
}

const applyLook = async ($: EngineInterface, s: DeskSettings): Promise<void> => {
  const unpainted = blockingProblem(s.scheme)
  if (unpainted !== undefined) {
    $.ui.toast(`ClaudeXp: ${unpainted}`)
  }
  const set = await $.theme.set(lookFor(s))
  $.ui.status(set.isDrawn ? `ClaudeXp - Ready (${s.wallpaper})` : `ClaudeXp: ${set.reason}`)
}

const commit = async ($: EngineInterface, s: DeskSettings): Promise<void> => {
  await update($, settings, () => s)
  await $.store.set(STORE_KEY, s)
  await applyLook($, s)
}

const openDisplay = async ($: EngineInterface, which?: DeskTab): Promise<void> => {
  const current = await read($, settings)
  await update($, draft, () => current)
  if (which !== undefined) {
    await update($, tab, () => which)
  }
  await $.ui.open({ id: DISPLAY, title: 'Display Properties' })
}

const openMonitor = async ($: EngineInterface): Promise<void> => {
  await $.ui.open({ id: MONITOR, title: 'System Monitor' })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = sanitize(await $.store.get(STORE_KEY))
    await update($, settings, () => stored)
    await applyLook($, stored)

    await $.command.register({ name: 'display', description: 'ClaudeXp: open Display Properties (wallpaper, color scheme, effects)' })
    await $.command.register({ name: 'sysmon', description: 'ClaudeXp: open the System Monitor window' })
    await $.command.register({ name: 'startmenu', description: 'ClaudeXp: toggle the Start menu above the prompt' })
    await $.command.register({ name: 'win98-check', description: 'ClaudeXp: show which screens this session draws on and whether the theme reached them' })

    if (stored.startup) {
      void openMonitor($)
    }
    return next(e)
  })

  // ---------------- commands ----------------

  on('command.run', { command: 'display' }, async $ => {
    await openDisplay($)
    return { text: 'Display Properties opened.' }
  })

  on('command.run', { command: 'sysmon' }, async $ => {
    await openMonitor($)
    return { text: 'System Monitor opened.' }
  })

  on('command.run', { command: 'startmenu' }, async $ => {
    await update($, isStartOpen, v => !v)
    return { text: 'Start menu toggled.' }
  })

  on('command.run', { command: 'win98-check' }, async $ => {
    const surfaces = await $.session.surfaces()
    const s = await read($, settings)
    const set = await $.theme.set(lookFor(s))
    return {
      text: [
        `Screens attached: ${surfaces.length === 0 ? 'none' : surfaces.join(', ')}`,
        `Theme: ${set.isDrawn ? 'accepted by an attached app' : `not drawn (${set.reason})`}`,
        `Backdrop last drawn on: ${lastBackdrop ?? 'nothing yet this load'}`,
        `Color contrast notes: ${allProblems().length}`,
      ].join('\n'),
    }
  })

  // ---------------- tool calls feed the System Monitor ----------------

  on('tool.call', async ($, e, next) => {
    const call: DeskCall = { id: e.tool_use_id, tool: e.tool, isDone: false, isError: false }
    await update($, calls, list => [...list, call].slice(-100))
    try {
      const ran = await next(e)
      const isError = typeof ran === 'object' && ran !== null && 'isError' in ran && Boolean((ran as { isError?: unknown }).isError)
      await update($, calls, list => list.map(c => (c.id === call.id ? { ...c, isDone: true, isError } : c)))
      return ran
    } catch (err) {
      await update($, calls, list => list.map(c => (c.id === call.id ? { ...c, isDone: true, isError: true } : c)))
      throw err
    }
  })

  // ---------------- the desktop backdrop ----------------

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    if (!('Svg' in ui)) {
      return next(e)
    }
    const { Svg } = ui
    const s = await read($, settings)
    lastBackdrop = e.surface
    $.ui.status(`ClaudeXp - Ready (${s.wallpaper}, scene drawn on ${e.surface})`)
    return <Svg source={sceneSvg(s)} alt="A retro desktop with pixel icons and a taskbar" isInteractive />
  })

  // ---------------- Start menu band above the prompt ----------------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    const { Box, Button, Text } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const isOpen = await read($, isStartOpen)
    const s = await read($, settings)
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const icon = (name: string) => (isGraphic ? <Svg source={iconSvg(name, 16)} alt="" width={16} height={16} /> : null)

    const item = (key: string, name: string, label: string, run: () => Promise<void> | void) => (
      <Box key={`row-${key}`} flexDirection="row" alignItems="center" gap="xs" paddingX={1} hover={{ backgroundColor: accentOf(s.scheme) }}>
        {icon(name)}
        <Button
          key={key}
          plain
          label={label}
          onPress={async () => {
            await update($, isStartOpen, () => false)
            await run()
          }}
        />
      </Box>
    )

    return (
      <Box flexDirection="column">
        {isOpen && (
          <Box flexDirection="row" borderStyle="single" borderColor={INK} backgroundColor={SILVER}>
            <Box backgroundColor={accentOf(s.scheme)} paddingX={1} justifyContent="flex-end">
              <Text color={WHITE} weight="bold">
                ClaudeXp
              </Text>
            </Box>
            <Box flexDirection="column" paddingY={1} flexGrow={1}>
              {item('sm-monitor', 'monitor', 'System Monitor', () => openMonitor($))}
              {item('sm-display', 'display', 'Display Properties...', () => openDisplay($, 'background'))}
              {item('sm-scheme', 'folder', 'Appearance...', () => openDisplay($, 'appearance'))}
              {item('sm-effects', 'computer', 'Effects...', () => openDisplay($, 'effects'))}
              {item('sm-shutdown', 'bin', 'Shut Down windows...', async () => {
                await $.ui.close({ id: DISPLAY })
                await $.ui.close({ id: MONITOR })
                $.ui.toast('It is now safe to keep working.')
              })}
            </Box>
          </Box>
        )}
        <Box flexDirection="row" alignItems="center" gap="xs">
          {icon('spark')}
          <Button key="start" label={isOpen ? 'Start ▾' : 'Start'} variant={isOpen ? 'primary' : 'secondary'} onPress={() => update($, isStartOpen, v => !v)} />
          <Button key="qs-monitor" label="System Monitor" dimColor onPress={() => openMonitor($)} />
          <Button key="qs-display" label="Display" dimColor onPress={() => openDisplay($)} />
        </Box>
      </Box>
    )
  })

  // ---------------- System Monitor window ----------------

  on('ui.render', { component: 'Pane', requestId: MONITOR }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const list = await read($, calls)
    const s = await read($, settings)
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const running = list.filter(c => !c.isDone).length
    const failed = list.filter(c => c.isError).length
    const room = Math.max(3, (e.viewport?.rows ?? 24) - 10)
    const counts = new Map<string, number>()
    for (const c of list) counts.set(c.tool, (counts.get(c.tool) ?? 0) + 1)
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const max = top[0]?.[1] ?? 1
    const menu = await read($, monitorMenu)
    const view = await read($, monitorView)
    const summary = [
      `ClaudeXp System Monitor: ${list.length} calls, ${running} running, ${failed} errors`,
      ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tool, n]) => `${tool}: ${n}`),
    ].join('\n')
    const menuButton = (key: DeskMenu, label: string) => (
      winButton(ui, { id: `menu-${key}`, label: label, isActive: menu === key, onPress: () => update($, monitorMenu, cur => (cur === key ? null : key)) })
    )
    // A menu item runs its action, then closes the menu (a toggle keeps it open).
    const item = (key: string, label: string, run: (press: { surface: typeof e.surface }) => unknown, keepOpen = false) => (
      <Button
        key={key}
        plain
        label={label}
        onPress={async press => {
          if (!keepOpen) await update($, monitorMenu, () => null)
          await run(press)
        }}
      >
        <Text color={INK}>{label}</Text>
      </Button>
    )

    return (
      <Box flexDirection="column" borderStyle="single" borderColor={INK} backgroundColor={SILVER}>
        <Box flexDirection="row" backgroundColor={accentOf(s.scheme)} paddingX={1} alignItems="center" gap="xs">
          {isGraphic && <Svg source={iconSvg('monitor', 16)} alt="" width={16} height={16} />}
          <Box flexGrow={1}>
            <Text color={WHITE} weight="bold">
              System Monitor
            </Text>
          </Box>
          <Button key="mon-close" plain label="✕" onPress={() => $.ui.close({ id: MONITOR })} />
        </Box>
        <Box flexDirection="row" paddingX={1} gap={1} alignItems="center">
          {menuButton('file', 'File')}
          {menuButton('edit', 'Edit')}
          {menuButton('view', 'View')}
          <Box flexGrow={1} />
          {winButton(ui, { id: "mon-clear", label: "Clear", onPress: () => update($, calls, () => []) })}
        </Box>
        {menu !== null && (
          <Box flexDirection="column" marginX={1} padding={1} backgroundColor={WHITE} borderStyle="single" borderColor={INK} gap="xs">
            {menu === 'file' && [
              item('m-clear', 'Clear log', () => update($, calls, () => [])),
              item('m-close', 'Close', () => $.ui.close({ id: MONITOR })),
            ]}
            {menu === 'edit' && [
              item('m-copy', 'Copy summary', async press => {
                const r = await $.ui.copy({ text: summary, surface: press.surface })
                $.ui.toast(r.isCopied ? 'System Monitor summary copied.' : 'Could not copy the summary.')
              }),
            ]}
            {menu === 'view' && [
              item('m-bars', `${view.bars ? '[x]' : '[ ]'} Usage bars`, () => update($, monitorView, v => ({ ...v, bars: !v.bars })), true),
              item('m-log', `${view.log ? '[x]' : '[ ]'} Call log`, () => update($, monitorView, v => ({ ...v, log: !v.log })), true),
              item('m-display', 'Display Properties...', () => openDisplay($)),
            ]}
          </Box>
        )}
        {view.bars && (
        <Box flexDirection="column" margin={1} padding={1} backgroundColor={WHITE} borderStyle="single" borderColor={SHADOW}>
          <Text color={INK} weight="bold">
            Tool usage
          </Text>
          {top.length === 0 && <Text color={SHADOW}>No tool calls yet.</Text>}
          {top.map(([tool, n]) => (
            <Box key={`bar-${tool}`} flexDirection="row" gap={1} alignItems="center">
              <Box width={14}>
                <Text color={INK} wrap="truncate">
                  {tool}
                </Text>
              </Box>
              {/* Drawn by hand, not with Progress: its label takes the app's own
                  text color, which goes near-white in dark mode on this white box. */}
              <Box flexGrow={1} flexDirection="row" borderStyle="single" borderColor={SHADOW}>
                <Box flexGrow={n} backgroundColor={accentOf(s.scheme)}>
                  <Text color={accentOf(s.scheme)}> </Text>
                </Box>
                {n < max && (
                  <Box flexGrow={max - n} backgroundColor={WHITE}>
                    <Text color={WHITE}> </Text>
                  </Box>
                )}
              </Box>
              <Box width={4}>
                <Text color={NAVY} weight="bold">
                  {`${n}`}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
        )}
        {view.log && (
        <Box flexDirection="column" marginX={1} paddingX={1} backgroundColor={WHITE} borderStyle="single" borderColor={SHADOW}>
          {list.slice(-room).map(c => (
            <Text key={`c-${c.id}`} color={c.isError ? '#b00000' : c.isDone ? '#404040' : INK} wrap="truncate">
              {c.isDone ? (c.isError ? '[!!]' : '[ok]') : '[..]'} {c.tool}
            </Text>
          ))}
        </Box>
        )}
        <Box flexDirection="row" paddingX={1} gap={2} borderStyle="single" borderColor={SHADOW}>
          <Text color={INK}>{list.length} calls</Text>
          <Text color={INK}>{running} running</Text>
          <Text color={failed > 0 ? '#b00000' : INK}>{failed} errors</Text>
        </Box>
      </Box>
    )
  })

  // ---------------- Display Properties window (the settings) ----------------

  on('ui.render', { component: 'Pane', requestId: DISPLAY }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button, Select } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const saved = await read($, settings)
    const d = (await read($, draft)) ?? saved
    const t = await read($, tab)
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const isDirty = JSON.stringify(d) !== JSON.stringify(saved)

    const setDraft = (patch: Partial<DeskSettings>) => update($, draft, cur => ({ ...(cur ?? saved), ...patch }))
    const tabButton = (key: DeskTab, label: string) => (
      winButton(ui, { id: `tab-${key}`, label: label, isActive: t === key, onPress: () => update($, tab, () => key) })
    )
    const check = (key: string, label: string, value: boolean, patch: (v: boolean) => Partial<DeskSettings>) => (
      <Button key={key} plain label={`${value ? '[x]' : '[ ]'} ${label}`} onPress={() => setDraft(patch(!value))}>
        <Text color={INK}>{`${value ? '[x]' : '[ ]'} ${label}`}</Text>
      </Button>
    )

    const body =
      t === 'background' ? (
        <Box flexDirection="column" gap={1}>
          <Text color={INK}>Wallpaper</Text>
          <Select
            key="wallpaper"
            label="Pattern:"
            options={WALLPAPERS.map(w => ({ value: w.value, label: w.label }))}
            value={d.wallpaper}
            onSelect={v => setDraft({ wallpaper: v as DeskWallpaper })}
          />
          <Select
            key="zoom"
            label="Meadow size:"
            options={ZOOMS.map(z => ({ value: z.value, label: z.label }))}
            value={d.zoom}
            onSelect={v => setDraft({ zoom: v as DeskZoom })}
          />
        </Box>
      ) : t === 'appearance' ? (
        <Box flexDirection="column" gap={1}>
          <Text color={INK}>Scheme</Text>
          <Select key="scheme" label="Scheme:" options={SCHEME_OPTIONS} value={d.scheme} onSelect={v => setDraft({ scheme: v as DeskScheme })} />
          <Box flexDirection="column" borderStyle="single" borderColor={SHADOW}>
            <Box backgroundColor={accentOf(d.scheme)} paddingX={1}>
              <Text color={WHITE} weight="bold">
                Active Window
              </Text>
            </Box>
            <Box paddingX={1} backgroundColor={WHITE}>
              <Text color={INK}>Window Text</Text>
            </Box>
          </Box>
          <Text color={SHADOW} size="caption">
            Dark mode uses the shared "After Hours" scheme.
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column" gap={1}>
          <Text color={INK}>Visual effects</Text>
          {check('fx-icons', 'Show desktop icons', d.icons, v => ({ icons: v }))}
          {check('fx-taskbar', 'Show taskbar', d.taskbar, v => ({ taskbar: v }))}
          {check('fx-startup', 'Open System Monitor at startup', d.startup, v => ({ startup: v }))}
        </Box>
      )

    return (
      <Box flexDirection="column" borderStyle="single" borderColor={INK} backgroundColor={SILVER}>
        <Box flexDirection="row" backgroundColor={accentOf(saved.scheme)} paddingX={1} alignItems="center" gap="xs">
          {isGraphic && <Svg source={iconSvg('display', 16)} alt="" width={16} height={16} />}
          <Box flexGrow={1}>
            <Text color={WHITE} weight="bold">
              Display Properties
            </Text>
          </Box>
          <Button key="dp-x" plain label="✕" onPress={() => $.ui.close({ id: DISPLAY })} />
        </Box>
        <Box flexDirection="row" paddingX={1} paddingTop={1} gap="xs">
          {tabButton('background', 'Background')}
          {tabButton('appearance', 'Appearance')}
          {tabButton('effects', 'Effects')}
        </Box>
        <Box flexDirection="column" margin={1} padding={1} borderStyle="single" borderColor={SHADOW} gap={1}>
          {isGraphic && (
            <Box justifyContent="center">
              <Svg source={previewSvg(d)} alt="Preview of the desktop with these settings" width={200} height={156} />
            </Box>
          )}
          {body}
        </Box>
        <Box flexDirection="row" justifyContent="flex-end" gap="xs" paddingX={1} paddingBottom={1}>
          <Button
            key="dp-ok"
            label="OK"
            variant="primary"
            onPress={async () => {
              await commit($, d)
              await $.ui.close({ id: DISPLAY })
            }}
          />
          <Button
            key="dp-cancel"
            label="Cancel"
            onPress={async () => {
              await update($, draft, () => null)
              await $.ui.close({ id: DISPLAY })
            }}
          />
          <Button key="dp-apply" label="Apply" dimColor={!isDirty} onPress={() => commit($, d)} />
        </Box>
      </Box>
    )
  })
}
