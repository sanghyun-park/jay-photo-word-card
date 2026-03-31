import { useState, useEffect } from 'react'
import CardPreview from './components/CardPreview'
import CardEditor from './components/CardEditor'
import { getDisplaySize, getExportSize, hexToRgba } from './constants'
import styles from './App.module.css'

const DEFAULT_SETTINGS = {
  fontSize: '36px',
  textPosition: 'bottom',
  textColor: '#ffffff',
  bgColor: '#000000',
  bgOpacity: 0.55,
  sizePreset: '4x6-l',
  cropX: 50,
  cropY: 50,
}

const STORAGE_KEY = 'jay-photo-card-settings'
const PERSIST_KEYS = ['fontSize', 'textPosition', 'textColor', 'bgColor', 'bgOpacity', 'sizePreset']

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    const parsed = JSON.parse(saved)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function App() {
  const [image, setImage] = useState(null)
  const [word, setWord] = useState('')
  const [settings, setSettings] = useState(loadSettings)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const toSave = Object.fromEntries(PERSIST_KEYS.map(k => [k, settings[k]]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }, PERSIST_KEYS.map(k => settings[k])) // eslint-disable-line react-hooks/exhaustive-deps

  function handleImageChange(img) {
    setImage(img)
    setSettings(s => ({ ...s, cropX: 50, cropY: 50 }))
  }

  function handleSettingsChange(next) {
    if (next.sizePreset !== settings.sizePreset) {
      setSettings({ ...next, cropX: 50, cropY: 50 })
    } else {
      setSettings(next)
    }
  }

  function handleCropChange(x, y) {
    setSettings(s => ({ ...s, cropX: x, cropY: y }))
  }

  async function handleExport() {
    if (!image) return
    setExporting(true)
    try {
      const { w: cw, h: ch } = getExportSize(settings.sizePreset)

      // 이미지 로드
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image
      })

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')

      // ── 크롭 위치 계산 (CSS object-fit: cover 동일 로직) ──────────────
      const { cropX = 50, cropY = 50 } = settings
      const natW = img.naturalWidth
      const natH = img.naturalHeight
      const coverScale = Math.max(cw / natW, ch / natH)
      const scaledW = natW * coverScale
      const scaledH = natH * coverScale
      const offsetX = (cropX / 100) * (scaledW - cw)  // px, 캔버스 좌표
      const offsetY = (cropY / 100) * (scaledH - ch)

      // drawImage 소스 좌표: 자연 이미지 픽셀 단위
      const sx = offsetX / coverScale
      const sy = offsetY / coverScale
      const sw = cw / coverScale
      const sh = ch / coverScale
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)

      // ── 텍스트 오버레이 ───────────────────────────────────────────────
      if (word) {
        const { textPosition, textColor, bgColor, bgOpacity, fontSize } = settings
        const { w: dw } = getDisplaySize(settings.sizePreset)
        const textScale = cw / dw
        const fontSizePx = parseInt(fontSize) * textScale
        const padding = 12 * textScale

        ctx.font = `bold ${fontSizePx}px "Noto Sans KR", "Malgun Gothic", "Segoe UI", sans-serif`
        const lineH = fontSizePx * 1.3
        const barH = lineH + padding * 2

        const barY = textPosition === 'top'    ? 0
                   : textPosition === 'middle' ? (ch - barH) / 2
                   : ch - barH

        // 배경 바
        ctx.fillStyle = hexToRgba(bgColor, bgOpacity)
        ctx.fillRect(0, barY, cw, barH)

        // 텍스트
        ctx.fillStyle = textColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(word, cw / 2, barY + barH / 2)
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${word || '낱말카드'}.jpg`
      a.click()
    } catch (err) {
      console.error('내보내기 실패:', err)
      alert('내보내기에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🃏 준규의 낱말 카드 생성기</h1>
        <p className={styles.subtitle}>이미지를 업로드하고 단어를 입력하여 낱말 카드를 만들어보세요</p>
      </header>

      <main className={styles.main}>
        <CardEditor
          image={image}
          word={word}
          settings={settings}
          onImageChange={handleImageChange}
          onWordChange={setWord}
          onSettingsChange={handleSettingsChange}
        />

        <div className={styles.previewArea}>
          <div className={styles.previewWrapper}>
            <CardPreview
              image={image}
              word={word}
              settings={settings}
              onCropChange={handleCropChange}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.exportBtn}
              onClick={handleExport}
              disabled={exporting || !image}
            >
              {exporting ? '내보내는 중...' : '⬇ JPG로 내보내기'}
            </button>
            {!image && (
              <p className={styles.hint}>이미지를 업로드하면 내보내기가 활성화됩니다</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
