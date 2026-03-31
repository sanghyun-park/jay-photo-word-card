export const SIZE_PRESETS = [
  { id: '4x6-l', label: '4×6 가로', desc: '10×15cm', wr: 6, hr: 4 },
  { id: '4x6-p', label: '4×6 세로', desc: '10×15cm', wr: 4, hr: 6 },
  { id: '5x7-l', label: '5×7 가로', desc: '13×18cm', wr: 7, hr: 5 },
  { id: '5x7-p', label: '5×7 세로', desc: '13×18cm', wr: 5, hr: 7 },
  { id: '6x8-l', label: '6×8 가로', desc: '15×20cm', wr: 8, hr: 6 },
  { id: '6x8-p', label: '6×8 세로', desc: '15×20cm', wr: 6, hr: 8 },
  { id: '1x1',   label: '정사각형', desc: '1:1',      wr: 1, hr: 1 },
]

const MAX_PREVIEW = 400
const MAX_EXPORT  = 2400

export function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

function calcSize(presetId, maxDim) {
  const preset = SIZE_PRESETS.find(p => p.id === presetId) ?? SIZE_PRESETS[0]
  const { wr, hr } = preset
  if (wr >= hr) {
    return { w: maxDim, h: Math.round(maxDim * hr / wr) }
  } else {
    return { w: Math.round(maxDim * wr / hr), h: maxDim }
  }
}

export function getDisplaySize(presetId) { return calcSize(presetId, MAX_PREVIEW) }
export function getExportSize(presetId)  { return calcSize(presetId, MAX_EXPORT) }
