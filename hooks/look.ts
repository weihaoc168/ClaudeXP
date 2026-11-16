import type { ThemeSetArgs } from 'claude-code'

import type { DeskScheme, DeskSettings, DeskWallpaper } from '../types'
import { makeColors } from './make-colors.js'

// Desktop color schemes in the spirit of the early-2000s look: cream window
// bodies with a blue, olive or silver accent. Light mode is this cream look;
// dark mode is a shared "after hours" scheme, a monitor left on at night.
const SCHEMES: Record<DeskScheme, { label: string; accent: string; s0: string; s1: string; s2: string }> = {
  standard: { label: 'Blue (default)', accent: '#0a4fd6', s0: '#ece9d8', s1: '#f1efe2', s2: '#fbfaf5' },
  rose: { label: 'Olive Green', accent: '#4f6b26', s0: '#e8ead8', s1: '#eff1e2', s2: '#fafbf5' },
  slate: { label: 'Silver', accent: '#4a5a80', s0: '#e3e3ea', s1: '#ececf1', s2: '#f8f8fb' },
  eggplant: { label: 'Royale', accent: '#1d3a9a', s0: '#e6e8f0', s1: '#eef0f6', s2: '#fafbfd' },
}

const SCHEME_KEYS = Object.keys(SCHEMES) as DeskScheme[]

export const SCHEME_OPTIONS = SCHEME_KEYS.map(value => ({ value, label: SCHEMES[value].label }))
export const accentOf = (scheme: DeskScheme): string => SCHEMES[scheme].accent
export const chromeOf = (scheme: DeskScheme): string => SCHEMES[scheme].s1

const build = (key: DeskScheme) => {
  const s = SCHEMES[key]
  return makeColors({
    label: `ClaudeXP - ${s.label}`,
    roles: { accent: s.accent, danger: '#b00000', success: '#007a00', warning: '#a87800', pro: '#800080' },
    light: {
      gray: {
        anchors: {
          'surface-0': s.s0,
          'surface-1': s.s1,
          'surface-2': s.s2,
          'text-primary': '#000000',
          'text-secondary': '#202020',
          'text-muted': '#0b1f8a',
        },
        // The quieter text steps (status rows, notices, hints) in navy blues
        // rather than grays, so they stay readable over the wallpaper.
        stops: { 250: '#2f4fc8', 300: '#2343b8', 350: '#1733a6', 450: '#081a78', 500: '#06156a' },
      },
    },
    dark: {
      roles: { accent: '#5f7fff' },
      gray: {
        anchors: {
          'surface-0': '#0e0f18',
          'surface-1': '#171826',
          'surface-2': '#1e2032',
          'surface-3': '#24263a',
          'text-primary': '#f2f2f2',
          'text-secondary': '#cfcfd6',
          'text-muted': '#a6a7b4',
        },
      },
    },
  })
}

const THEMES = {} as Record<DeskScheme, ReturnType<typeof build>>
for (const key of SCHEME_KEYS) {
  THEMES[key] = build(key)
}

export const blockingProblem = (scheme: DeskScheme): string | undefined =>
  THEMES[scheme].problems.find(line => line.startsWith("Desktop won't paint"))

export const allProblems = (): string[] => SCHEME_KEYS.flatMap(k => THEMES[k].problems.map(p => `${k}: ${p}`))

export const lookFor = (s: DeskSettings): ThemeSetArgs => ({
  colors: THEMES[s.scheme].theme,
  // Every wallpaper is a live scene drawn by the mod. The glass takes the app's
  // own panel color (dark in dark mode): thick enough, and frosted, that text
  // reads over the bright sky, thin enough that the meadow still shows.
  backdrop: { scene: 'desktopxp', glass: { blur: 6, opacity: 0.5 } },
})

// ---------- the desktop scene: original pixel-art icons and a taskbar ----------

export const WALLPAPERS: { value: DeskWallpaper; label: string; color: string }[] = [
  { value: 'meadow', label: 'Green Meadow', color: '#4a9a2a' },
  { value: 'teal', label: 'Teal (classic)', color: '#008080' },
  { value: 'navy', label: 'Midnight', color: '#000058' },
  { value: 'olive', label: 'Olive', color: '#5e5e22' },
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'clouds', label: 'Clouds', color: '#3a78c8' },
]

export const wallColor = (w: DeskWallpaper): string => WALLPAPERS.find(x => x.value === w)?.color ?? '#008080'

// A raised (or sunken) 3D bevel, the signature of the era's chrome.
const bevel = (x: number, y: number, w: number, h: number, sunken = false, fill = '#c0c0c0'): string => {
  const hi = sunken ? '#808080' : '#ffffff'
  const lo = sunken ? '#ffffff' : '#808080'
  const outer = sunken ? '#ffffff' : '#000000'
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>
<path d="M${x + 0.5} ${y + h - 1}V${y + 0.5}H${x + w - 1}" stroke="${hi}" fill="none"/>
<path d="M${x + 1.5} ${y + h - 1.5}H${x + w - 1.5}V${y + 1.5}" stroke="${lo}" fill="none"/>
<path d="M${x} ${y + h - 0.5}H${x + w - 0.5}V${y}" stroke="${outer}" fill="none"/>`
}

// 32x32 icons in a smooth, glossy early-2000s style: soft gradients, rounded
// corners and a light highlight. Origin at 0,0. All original art.
const XG = `<defs>
<linearGradient id="xiScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb8ff"/><stop offset=".55" stop-color="#1f6fe0"/><stop offset="1" stop-color="#0a3fa8"/></linearGradient>
<linearGradient id="xiCase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f6f0"/><stop offset="1" stop-color="#c9c5b5"/></linearGradient>
<linearGradient id="xiFolder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset=".6" stop-color="#f6c443"/><stop offset="1" stop-color="#d99a16"/></linearGradient>
<linearGradient id="xiBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d95ff"/><stop offset=".5" stop-color="#0a5ae8"/><stop offset="1" stop-color="#0646c4"/></linearGradient>
<linearGradient id="xiSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fb3c8"/><stop offset=".45" stop-color="#eef3f8"/><stop offset="1" stop-color="#8aa0b8"/></linearGradient>
<radialGradient id="xiGlobe" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".45" stop-color="#3a8ef0"/><stop offset="1" stop-color="#0b3f9e"/></radialGradient>
<linearGradient id="xiMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8ae6"/><stop offset=".55" stop-color="#9cc8f4"/><stop offset=".56" stop-color="#6fc23a"/><stop offset="1" stop-color="#2f8a1c"/></linearGradient>
</defs>`

export const ICONS: Record<string, string> = {
  computer: `${XG}<rect x="3" y="2.5" width="26" height="19" rx="2.5" fill="url(#xiCase)" stroke="#7a7666"/><rect x="5.5" y="5" width="21" height="14" rx="1" fill="url(#xiScreen)"/><path d="M6 5.5h20l-8 7H6z" fill="#fff" opacity=".22"/><path d="M12 21.5h8l1.5 4h-11z" fill="#bdb8a6"/><rect x="7" y="25" width="18" height="4" rx="2" fill="url(#xiCase)" stroke="#7a7666"/>`,
  bin: `${XG}<ellipse cx="16" cy="7" rx="10" ry="3" fill="#dfe7ef" stroke="#5f7590"/><path d="M6.5 8l2 19.5q.3 2 3 2h9q2.7 0 3-2l2-19.5" fill="url(#xiSteel)" stroke="#5f7590"/><path d="M11 11l.8 15M16 11v15M21 11l-.8 15" stroke="#6f86a2" stroke-width="1.2" stroke-linecap="round"/><path d="M8.5 9.5q7.5 2.5 15 0" stroke="#fff" opacity=".7" fill="none"/>`,
  folder: `${XG}<path d="M2.5 8.5q0-2 2-2h7l2.5 3h13q2 0 2 2V25q0 2-2 2h-22.5q-2 0-2-2z" fill="#d99a16"/><rect x="6" y="8" width="18" height="10" rx="1" fill="#fff" stroke="#c8c2b0"/><path d="M8 11h12M8 13.5h9" stroke="#9aa6c0"/><path d="M2.5 14q0-2 2-2h23q2 0 2 2V25q0 2-2 2h-23q-2 0-2-2z" fill="url(#xiFolder)" stroke="#b07a0e"/><path d="M4 13.5h24" stroke="#fff6c8" opacity=".9"/>`,
  terminal: `${XG}<rect x="2" y="4" width="28" height="24" rx="3" fill="#ece9d8" stroke="#0831d9"/><path d="M2 9V7q0-3 3-3h22q3 0 3 3v2z" fill="url(#xiBar)"/><rect x="25" y="5" width="3.5" height="3" rx=".8" fill="#e0502a" stroke="#fff" stroke-width=".5"/><rect x="4" y="11" width="24" height="15" rx="1.5" fill="#101418"/><path d="M6.5 14.5l3 2-3 2" stroke="#e07a4a" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect class="blink" x="11" y="17.5" width="5" height="1.8" rx=".6" fill="#e07a4a"/>`,
  network: `${XG}<rect x="2" y="3" width="13" height="10" rx="1.5" fill="url(#xiCase)" stroke="#7a7666"/><rect x="3.8" y="4.8" width="9.4" height="6.4" rx=".6" fill="url(#xiScreen)"/><rect x="17" y="3" width="13" height="10" rx="1.5" fill="url(#xiCase)" stroke="#7a7666"/><rect x="18.8" y="4.8" width="9.4" height="6.4" rx=".6" fill="url(#xiScreen)"/><path d="M8.5 13v5h15v-5M16 18v5" stroke="#3a7a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="16" cy="25.5" r="4" fill="#5fbf55" stroke="#2f7a28"/><circle cx="14.8" cy="24.3" r="1.2" fill="#fff" opacity=".7"/>`,
  globe: `${XG}<circle cx="16" cy="16" r="13" fill="url(#xiGlobe)" stroke="#0b3f9e"/><path d="M9 9c3 0 5 2 4 5s1 5 3 6-1 5-3 6M20 5.5c-1.5 2.5.5 4 3 5s2.5 4 .5 6 0 4 2.5 4" fill="none" stroke="#5fbf55" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="11.5" cy="9.5" rx="5" ry="3" fill="#fff" opacity=".35"/>`,
  display: `${XG}<rect x="3" y="3" width="26" height="19" rx="2.5" fill="url(#xiCase)" stroke="#7a7666"/><rect x="5.5" y="5.5" width="21" height="14" rx="1" fill="url(#xiMeadow)"/><path d="M6 5.5h20l-8 7H6z" fill="#fff" opacity=".18"/><path d="M12 22h8l1.5 4h-11z" fill="#bdb8a6"/><rect x="8" y="25.5" width="16" height="3.5" rx="1.7" fill="url(#xiCase)" stroke="#7a7666"/>`,
  monitor: `${XG}<rect x="3" y="3" width="26" height="24" rx="3" fill="#0d1a2e" stroke="#0831d9"/><path d="M5.5 9.5h21M5.5 15h21M5.5 20.5h21" stroke="#1d3a5e"/><path d="M5.5 22l5-6 4 3 5-9 3 4 3.5-5" stroke="#5fe05a" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 5q12 0 24 0" stroke="#fff" opacity=".25"/>`,
  spark: `<path d="M16 2l2.5 9.5L28 9l-7.5 6.5L28 22l-9.5-2.5L16 30l-2.5-10.5L4 22l7.5-6.5L4 9l9.5 2.5z" fill="#e07a4a" stroke="#7a2e10" stroke-width=".8"/>`,
}

const iconAt = (name: string, x: number, y: number, label: string, selected = false): string => {
  const w = label.length * 6.2 + 6
  return `<g transform="translate(${x},${y})"><g transform="translate(22,0)">${ICONS[name]}</g>
<rect x="${38 - w / 2}" y="36" width="${w}" height="14" fill="${selected ? '#316ac5' : 'none'}" ${selected ? 'stroke="#9fb9e8" stroke-dasharray="1 1"' : ''}/>
<text x="38" y="47" text-anchor="middle" fill="#fff" stroke="#000" stroke-opacity=".55" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round" font-family="sans-serif" font-size="11">${label}</text></g>`
}

const SKY = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f5fb8"/><stop offset="1" stop-color="#8ec0f0"/></linearGradient>`

const cloud = (x: number, y: number, k: number): string =>
  `<g transform="translate(${x},${y}) scale(${k})"><ellipse rx="100" ry="28"/><ellipse cx="-45" cy="-16" rx="50" ry="28"/><ellipse cx="35" cy="-24" rx="60" ry="34"/></g>`

// An original rolling-meadow landscape: deep blue sky, soft drifting clouds,
// one sunlit grassy hill in front of a darker one. Drawn in a 1600x1000 box
// that slices to fill any screen. Prefix keeps ids unique per document.
// The meadow drawn in a 1600x1000 box. With a bleed, the sky, hills and grass
// carry on that far past every edge, so the art can be zoomed out and still
// fill the window. Gradients are in user space so they don't stretch with it.
const meadowArt = (p: string, isAnimated: boolean, bleed = 0): string => {
  const x0 = -40 - bleed
  const x1 = 1640 + bleed
  const top = -bleed
  const foot = 1000 + bleed
  const hill = `M${x0} ${foot}V700C200 600 520 520 820 540C1120 560 1380 650 1640 760C1900 870 2300 960 2700 1000L${x1} 1000V${foot}z`
  return `<defs>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000"><stop offset="0" stop-color="#0b4fc4"/><stop offset=".45" stop-color="#3f8ae6"/><stop offset=".75" stop-color="#9cc8f4"/><stop offset="1" stop-color="#d8ecfb"/></linearGradient>
<linearGradient id="${p}back" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="1000"><stop offset="0" stop-color="#3f8f3a"/><stop offset="1" stop-color="#1f5e1f"/></linearGradient>
<radialGradient id="${p}hill" gradientUnits="userSpaceOnUse" cx="598" cy="606" r="1512" gradientTransform="translate(598 606) scale(1 .2857) translate(-598 -606)"><stop offset="0" stop-color="#9fdc4a"/><stop offset=".35" stop-color="#5fb52c"/><stop offset=".75" stop-color="#2f8a1c"/><stop offset="1" stop-color="#1c6014"/></radialGradient>
<linearGradient id="${p}shade" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="1640" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#002000" stop-opacity=".35"/></linearGradient>
<radialGradient id="${p}sun" gradientUnits="userSpaceOnUse" cx="320" cy="50" r="960" gradientTransform="translate(320 50) scale(1 .625) translate(-320 -50)"><stop offset="0" stop-color="#fffbe0" stop-opacity=".55"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
<filter id="${p}soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="${p}grass" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .08" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .35  0 0 0 0 .05  0 0 0 .5 -.12"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" fill="url(#${p}sky)"/>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" fill="url(#${p}sun)"/>
<g fill="#fff" ${isAnimated ? 'class="drift"' : ''} filter="url(#${p}soft)" opacity=".92">
<ellipse cx="300" cy="170" rx="170" ry="38"/><ellipse cx="380" cy="140" rx="110" ry="46"/>
<ellipse cx="980" cy="110" rx="220" ry="40"/><ellipse cx="1060" cy="80" rx="120" ry="44"/><ellipse cx="900" cy="95" rx="90" ry="34"/>
<ellipse cx="1420" cy="250" rx="160" ry="32"/><ellipse cx="1480" cy="225" rx="80" ry="30"/>
<ellipse cx="640" cy="330" rx="140" ry="26"/><ellipse cx="160" cy="420" rx="120" ry="22" opacity=".7"/>
</g>
<path d="M${x0} 640L0 640C260 560 520 560 760 610S1250 560 1600 600C1900 634 2300 640 2700 640L${x1} 640V${foot}H${x0}z" fill="url(#${p}back)"/>
<path d="${hill}" fill="url(#${p}hill)"/>
<path d="${hill}" fill="url(#${p}shade)"/>
<path d="${hill}" fill="#fff" filter="url(#${p}grass)"/>
<path d="M120 690C320 600 560 555 800 560" stroke="#d9f59a" stroke-width="6" stroke-opacity=".35" fill="none" filter="url(#${p}soft)"/>`
}

export const ZOOMS = [
  { value: '100', label: '100% (fill)' },
  { value: '80', label: '80%' },
  { value: '65', label: '65%' },
  { value: '50', label: '50% (whole picture)' },
] as const

const zoomOf = (s: DeskSettings): number => Number(s.zoom) / 100

// The scene is one 1600x1000 box that slices to fill any window, as the
// backdrop needs. Icons pin to the top-left and the taskbar to the bottom:
// @media rules (which read the scene's own box) shift them by however much
// the slice crops off that edge at the window's shape.
const W = 1600
const H = 1000

const edgeRules = (): string => {
  const rules: string[] = []
  // Wider than 16:10: top and bottom are cropped by (H - W/ar) / 2.
  for (const ar of [1.7, 1.8, 1.9, 2.0, 2.2, 2.4, 2.8, 3.4]) {
    const crop = Math.ceil((H - W / ar) / 2)
    rules.push(
      `@media (max-aspect-ratio:${Math.round(ar * 100)}/100) and (min-aspect-ratio:1600/1000){.pin-t{transform:translateY(${crop}px)}.pin-b{transform:translateY(-${crop}px)}}`,
    )
  }
  // Narrower than 16:10: left and right are cropped by (W - H*ar) / 2.
  for (const ar of [1.5, 1.4, 1.3, 1.2, 1.0, 0.8, 0.6, 0.45]) {
    const crop = Math.ceil((W - H * ar) / 2)
    rules.push(
      `@media (min-aspect-ratio:${Math.round(ar * 100)}/100) and (max-aspect-ratio:1600/1000){.pin-l{transform:translateX(${crop}px)}.pin-r{transform:translateX(-${crop}px)}}`,
    )
  }
  // Later rules win, so put the tightest band last.
  return rules.reverse().join('')
}

export const sceneSvg = (s: DeskSettings): string => {
  const ground =
    s.wallpaper === 'meadow'
      ? `<g transform="translate(800 500) scale(${zoomOf(s)}) translate(-800 -500)">${meadowArt('m', true, 4000)}</g>`
      : s.wallpaper === 'clouds'
        ? `<defs>${SKY}</defs><rect width="${W}" height="${H}" fill="url(#sky)"/>
<g class="drift" fill="#fff" fill-opacity=".85">${cloud(220, 140, 0.9)}${cloud(900, 90, 1.2)}${cloud(1450, 300, 1)}${cloud(620, 560, 1.4)}${cloud(1250, 760, 1.1)}</g>`
        : `<rect width="${W}" height="${H}" fill="${wallColor(s.wallpaper)}"/>`
  const icons = s.icons
    ? `<g class="pin-t"><g class="pin-l"><g transform="translate(6,8) scale(1.15)">${[
        iconAt('computer', 0, 0, 'My Computer'),
        iconAt('folder', 0, 70, 'My Documents'),
        iconAt('globe', 0, 140, 'The Internet'),
        iconAt('network', 0, 210, 'Network'),
        iconAt('bin', 0, 280, 'Recycle Bin'),
        iconAt('terminal', 0, 350, 'Claude Code', true),
      ].join('\n')}</g></g></g>`
    : ''
  const taskbar = s.taskbar
    ? `<g class="pin-b"><g transform="translate(0,${H})">
<defs>
<linearGradient id="tbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a81f3"/><stop offset=".08" stop-color="#2a6ee8"/><stop offset=".5" stop-color="#245edb"/><stop offset=".92" stop-color="#1f50c4"/><stop offset="1" stop-color="#1941a5"/></linearGradient>
<linearGradient id="tstart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf55"/><stop offset=".15" stop-color="#3f9f36"/><stop offset=".85" stop-color="#2f8a28"/><stop offset="1" stop-color="#2a7520"/></linearGradient>
<linearGradient id="ttray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c9cf0"/><stop offset=".5" stop-color="#0f8ae0"/><stop offset="1" stop-color="#0d6fc4"/></linearGradient>
<linearGradient id="ttask" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5fc9"/><stop offset=".5" stop-color="#1e4fb4"/><stop offset="1" stop-color="#1a47a6"/></linearGradient>
</defs>
<rect x="-1000" y="-34" width="${W + 2000}" height="34" fill="url(#tbar)"/>
<g class="pin-l"><g transform="translate(0,-34) scale(1.15)">
<path d="M0 0H82Q96 0 96 14.8Q96 29.6 82 29.6H0z" fill="url(#tstart)"/>
<path d="M0 1H81Q93 1 94 9" stroke="#9be08f" stroke-opacity=".7" fill="none"/>
<g transform="translate(7,5) scale(.6)">${ICONS.spark}</g>
<text x="30" y="20.5" font-family="Trebuchet MS, Tahoma, sans-serif" font-style="italic" font-weight="bold" font-size="16" fill="#fff" stroke="#1b5a14" stroke-opacity=".6" stroke-width="1.6" paint-order="stroke">start</text>
<g transform="translate(104,6) scale(.56)">${ICONS.globe}</g><g transform="translate(124,6) scale(.56)">${ICONS.folder}</g><g transform="translate(144,6) scale(.56)">${ICONS.terminal}</g>
<g transform="translate(170,3)"><rect width="170" height="23.6" rx="3" fill="url(#ttask)" stroke="#0f3a8f"/><rect x="1" y="1" width="168" height="1" fill="#6a9cf0" opacity=".7"/><g transform="translate(5,4) scale(.5)">${ICONS.terminal}</g><text x="26" y="16" font-family="Tahoma, sans-serif" font-size="11" fill="#fff">Claude Code</text></g>
</g></g>
<g class="pin-r"><g transform="translate(${W - 112},-34) scale(1.15)">
<rect width="100" height="29.6" fill="url(#ttray)"/><rect width="1" height="29.6" fill="#0a4fa8"/><rect x="1" width="1" height="29.6" fill="#5cc0ff" opacity=".7"/>
<path d="M10 11h3l4-4v14l-4-4h-3z" fill="#ffd84a" stroke="#1a3a6a" stroke-width=".7"/><g transform="translate(22,7) scale(.44)">${ICONS.network}</g>
<text x="44" y="19" font-family="Tahoma, sans-serif" font-size="11" fill="#fff">Ready<tspan class="blink">_</tspan></text></g></g>
</g></g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>.blink{animation:b 1.1s steps(1) infinite}@keyframes b{50%{opacity:0}}.drift{animation:d 90s linear infinite alternate}@keyframes d{to{transform:translateX(120px)}}${edgeRules()}</style>
${ground}
${icons}
${taskbar}
</svg>`
}

// A miniature monitor showing the wallpaper, for the Display Properties preview.
export const previewSvg = (s: DeskSettings): string => {
  const fill = s.wallpaper === 'clouds' ? 'url(#sky)' : wallColor(s.wallpaper)
  const icons = s.icons
    ? `<g transform="translate(36,20) scale(.4)">${ICONS.computer}</g><g transform="translate(36,38) scale(.4)">${ICONS.folder}</g><g transform="translate(36,56) scale(.4)">${ICONS.bin}</g>`
    : ''
  const bar = s.taskbar
    ? '<rect x="32" y="108" width="136" height="8" fill="#245edb"/><path d="M32 108h16q4 0 4 4t-4 4H32z" fill="#3c9a2f"/><rect x="152" y="108" width="16" height="8" fill="#0f8ae0"/>'
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 156" width="200" height="156">
<defs>${SKY}</defs>
<rect x="20" y="6" width="160" height="124" rx="4" fill="#d8d0b8" stroke="#000"/>
${
    s.wallpaper === 'meadow'
      ? `<svg x="32" y="16" width="136" height="100" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${meadowArt('p', false)}</svg><rect x="32" y="16" width="136" height="100" fill="none" stroke="#606060"/>`
      : `<rect x="32" y="16" width="136" height="100" fill="${fill}" stroke="#606060"/>`
  }
${icons}
<rect x="70" y="34" width="70" height="46" rx="3" fill="${chromeOf(s.scheme)}" stroke="#0831d9"/><path d="M70 42v-5q0-3 3-3h64q3 0 3 3v5z" fill="${accentOf(s.scheme)}"/><rect x="131" y="35.5" width="6" height="5" rx="1" fill="#e0502a"/>
<rect x="74" y="50" width="62" height="24" fill="#fff" stroke="#808080"/>
${bar}
<rect x="150" y="122" width="8" height="3" fill="#2a2"/>
<rect x="80" y="130" width="40" height="12" fill="#b8b098" stroke="#000"/><rect x="60" y="142" width="80" height="10" rx="2" fill="#d8d0b8" stroke="#000"/></svg>`
}

export const iconSvg = (name: string, size = 20): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">${ICONS[name] ?? ''}</svg>`
