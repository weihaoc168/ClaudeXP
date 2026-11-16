import type { ThemeSetArgs } from 'claude-code'

import type { DeskScheme, DeskSettings, DeskWallpaper } from '../types'
import { makeColors } from './make-colors.js'

// Classic late-90s desktop color schemes. Light mode is the silver-chrome
// scheme; dark mode is a shared "after hours" scheme, a CRT left on at night.
const SCHEMES: Record<DeskScheme, { label: string; accent: string; s0: string; s1: string; s2: string }> = {
  standard: { label: 'Standard', accent: '#000080', s0: '#c0c0c0', s1: '#d4d0c8', s2: '#f2f1ec' },
  rose: { label: 'Rose', accent: '#800040', s0: '#cfb4b4', s1: '#ddc7c6', s2: '#f3e9e8' },
  slate: { label: 'Slate', accent: '#2f4f6f', s0: '#a9b8c6', s1: '#c0ccd7', s2: '#e6ecf1' },
  eggplant: { label: 'Eggplant', accent: '#4b2a6a', s0: '#b6aec2', s1: '#c9c2d3', s2: '#ece8f1' },
}

const SCHEME_KEYS = Object.keys(SCHEMES) as DeskScheme[]

export const SCHEME_OPTIONS = SCHEME_KEYS.map(value => ({ value, label: SCHEMES[value].label }))
export const accentOf = (scheme: DeskScheme): string => SCHEMES[scheme].accent
export const chromeOf = (scheme: DeskScheme): string => SCHEMES[scheme].s1

const build = (key: DeskScheme) => {
  const s = SCHEMES[key]
  return makeColors({
    label: `ClaudeXp - ${s.label}`,
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
  backdrop: { scene: 'desktop98', glass: { blur: 6, opacity: 0.5 } },
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

// 32x32 icons drawn from plain shapes, origin at 0,0. All original art.
export const ICONS: Record<string, string> = {
  computer: `<rect x="3" y="2" width="26" height="20" fill="#d8d0b8" stroke="#000"/><rect x="6" y="5" width="20" height="14" fill="#1060a0"/><path d="M8 7h8M8 9h12" stroke="#7fd0ff"/><rect x="11" y="22" width="10" height="3" fill="#a89f88"/><rect x="5" y="25" width="22" height="5" fill="#d8d0b8" stroke="#000"/><rect x="20" y="27" width="4" height="1" fill="#2a2"/>`,
  bin: `<path d="M8 8h16l-2 21H10z" fill="#e8e8e8" stroke="#000"/><path d="M11 11l1 16M16 11v16M21 11l-1 16" stroke="#808080"/><rect x="6" y="5" width="20" height="3" fill="#c0c0c0" stroke="#000"/><path d="M13 5V3h6v2" stroke="#000" fill="none"/>`,
  folder: `<path d="M2 8h10l2 3h16v17H2z" fill="#f0c840" stroke="#000"/><rect x="6" y="5" width="16" height="9" fill="#fff" stroke="#808080"/><path d="M8 8h11M8 10h9" stroke="#808080"/><path d="M2 13h28v15H2z" fill="#f0c840" stroke="#000"/>`,
  terminal: `<rect x="2" y="4" width="28" height="24" fill="#c0c0c0" stroke="#000"/><rect x="3" y="5" width="26" height="4" fill="#000080"/><rect x="25" y="5.5" width="3" height="3" fill="#c0c0c0"/><rect x="4" y="11" width="24" height="15" fill="#000"/><path d="M6 14l3 2-3 2" stroke="#e07a4a" stroke-width="1.5" fill="none"/><rect class="blink" x="11" y="17" width="5" height="2" fill="#e07a4a"/>`,
  network: `<rect x="2" y="3" width="12" height="9" fill="#d8d0b8" stroke="#000"/><rect x="4" y="5" width="8" height="5" fill="#1060a0"/><rect x="18" y="3" width="12" height="9" fill="#d8d0b8" stroke="#000"/><rect x="20" y="5" width="8" height="5" fill="#1060a0"/><path d="M8 12v6h16v-6M16 18v6" stroke="#000" fill="none"/><rect x="11" y="24" width="10" height="5" fill="#c0c0c0" stroke="#000"/>`,
  globe: `<circle cx="16" cy="16" r="13" fill="#2a6ad8" stroke="#000"/><path d="M8 9c4 1 5 4 3 7s1 6 3 9M20 5c-2 3 0 5 3 6s4 4 2 8" fill="none" stroke="#3a3" stroke-width="3"/><ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="#9cf" stroke-opacity=".5"/>`,
  display: `<rect x="3" y="3" width="26" height="19" fill="#c0c0c0" stroke="#000"/><rect x="5" y="5" width="22" height="15" fill="#008080"/><rect x="8" y="8" width="10" height="7" fill="#c0c0c0"/><rect x="8" y="8" width="10" height="2" fill="#000080"/><rect x="12" y="22" width="8" height="4" fill="#808080"/><rect x="7" y="26" width="18" height="3" fill="#c0c0c0" stroke="#000"/><path d="M24 2l2 4 4 1-4 1-2 4-2-4-4-1 4-1z" fill="#ffd84a"/>`,
  monitor: `<rect x="3" y="3" width="26" height="24" fill="#000" stroke="#808080"/><path d="M5 9h22M5 15h22M5 21h22" stroke="#063"/><path d="M5 22l5-6 4 3 5-9 4 5 4-4" stroke="#0f0" fill="none"/>`,
  spark: `<path d="M16 2l2.5 9.5L28 9l-7.5 6.5L28 22l-9.5-2.5L16 30l-2.5-10.5L4 22l7.5-6.5L4 9l9.5 2.5z" fill="#e07a4a" stroke="#7a2e10" stroke-width=".8"/>`,
}

const iconAt = (name: string, x: number, y: number, label: string, selected = false): string => {
  const w = label.length * 6.2 + 6
  return `<g transform="translate(${x},${y})"><g transform="translate(22,0)">${ICONS[name]}</g>
<rect x="${38 - w / 2}" y="36" width="${w}" height="14" fill="${selected ? '#000080' : 'none'}" ${selected ? 'stroke="#ffff80" stroke-dasharray="1 1"' : ''}/>
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
<rect x="-1000" y="-34" width="${W + 2000}" height="34" fill="#c0c0c0"/><rect x="-1000" y="-34" width="${W + 2000}" height="1" fill="#dfdfdf"/><rect x="-1000" y="-33" width="${W + 2000}" height="1" fill="#fff"/>
<g class="pin-l"><g transform="translate(2,-31) scale(1.15)">
<g>${bevel(0, 0, 60, 24)}<g transform="translate(4,4) scale(.5)">${ICONS.spark}</g><text x="23" y="16" font-family="sans-serif" font-weight="bold" font-size="12">Start</text></g>
<rect x="66" y="1" width="1" height="22" fill="#808080"/><rect x="67" y="1" width="1" height="22" fill="#fff"/>
<g transform="translate(74,3) scale(.56)">${ICONS.globe}</g><g transform="translate(94,3) scale(.56)">${ICONS.folder}</g><g transform="translate(114,3) scale(.56)">${ICONS.terminal}</g>
<g transform="translate(140,0)">${bevel(0, 0, 170, 24, true, '#e8e8e8')}<g transform="translate(5,4) scale(.5)">${ICONS.terminal}</g><text x="26" y="16" font-family="sans-serif" font-weight="bold" font-size="11">Claude Code</text></g>
</g></g>
<g class="pin-r"><g transform="translate(${W - 104},-31) scale(1.15)">${bevel(0, 0, 88, 24, true)}
<path d="M8 9h3l4-4v14l-4-4H8z" fill="#ffd84a" stroke="#000" stroke-width=".7"/><g transform="translate(20,5) scale(.44)">${ICONS.network}</g>
<text x="40" y="16" font-family="sans-serif" font-size="11">Ready<tspan class="blink">_</tspan></text></g></g>
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
    ? '<rect x="32" y="108" width="136" height="8" fill="#c0c0c0"/><rect x="33" y="109" width="16" height="6" fill="#d4d0c8" stroke="#000" stroke-width=".5"/>'
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
<rect x="70" y="34" width="70" height="46" fill="${chromeOf(s.scheme)}" stroke="#000"/><rect x="71" y="35" width="68" height="8" fill="${accentOf(s.scheme)}"/>
<rect x="74" y="50" width="62" height="24" fill="#fff" stroke="#808080"/>
${bar}
<rect x="150" y="122" width="8" height="3" fill="#2a2"/>
<rect x="80" y="130" width="40" height="12" fill="#b8b098" stroke="#000"/><rect x="60" y="142" width="80" height="10" rx="2" fill="#d8d0b8" stroke="#000"/></svg>`
}

export const iconSvg = (name: string, size = 20): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">${ICONS[name] ?? ''}</svg>`
