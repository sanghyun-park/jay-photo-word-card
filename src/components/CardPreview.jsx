import { useRef, useState, useEffect } from 'react'
import { getDisplaySize, hexToRgba } from '../constants'

const POSITION_STYLES = {
  top:    { top: 0, bottom: 'auto' },
  middle: { top: '50%', transform: 'translateY(-50%)', bottom: 'auto' },
  bottom: { bottom: 0, top: 'auto' },
}

export default function CardPreview({ image, word, settings, onCropChange }) {
  const { fontSize, textPosition, textColor, bgColor, bgOpacity, sizePreset, cropX = 50, cropY = 50 } = settings
  const imgRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  const { w, h } = getDisplaySize(sizePreset)

  useEffect(() => {
    if (!dragging) return

    function onMove(clientX, clientY) {
      if (!dragStart.current || !imgRef.current) return
      const img = imgRef.current
      const natW = img.naturalWidth || w
      const natH = img.naturalHeight || h

      const scale = Math.max(w / natW, h / natH)
      const overflowX = natW * scale - w
      const overflowY = natH * scale - h

      const dx = clientX - dragStart.current.clientX
      const dy = clientY - dragStart.current.clientY

      const newX = overflowX > 0
        ? Math.max(0, Math.min(100, dragStart.current.cropX - (dx / overflowX) * 100))
        : 50
      const newY = overflowY > 0
        ? Math.max(0, Math.min(100, dragStart.current.cropY - (dy / overflowY) * 100))
        : 50

      onCropChange(newX, newY)
    }

    function handleMouseMove(e) { onMove(e.clientX, e.clientY) }
    function handleMouseUp()    { setDragging(false) }
    function handleTouchMove(e) { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }
    function handleTouchEnd()   { setDragging(false) }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup',   handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend',  handleTouchEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup',   handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend',  handleTouchEnd)
    }
  }, [dragging, w, h, onCropChange])

  function startDrag(clientX, clientY) {
    if (!image) return
    dragStart.current = { clientX, clientY, cropX, cropY }
    setDragging(true)
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        background: '#222',
        width: w,
        height: h,
        cursor: image ? (dragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
      }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY) }}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {image ? (
        <img
          ref={imgRef}
          src={image}
          alt="카드 이미지"
          draggable={false}
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${cropX}% ${cropY}%`,
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 16, flexDirection: 'column', gap: 8,
        }}>
          <span style={{ fontSize: 48 }}>🖼️</span>
          <span>이미지를 업로드하세요</span>
        </div>
      )}

      {word && (
        <div style={{
          position: 'absolute', left: 0, right: 0,
          padding: '12px 16px',
          backgroundColor: hexToRgba(bgColor, bgOpacity),
          pointerEvents: 'none',
          ...POSITION_STYLES[textPosition],
        }}>
          <p style={{
            fontSize, color: textColor, fontWeight: 'bold',
            textAlign: 'center', lineHeight: 1.3,
            letterSpacing: '0.02em', wordBreak: 'keep-all',
            margin: 0,
          }}>
            {word}
          </p>
        </div>
      )}

      {image && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(0,0,0,0.55)', color: 'white',
          fontSize: 11, padding: '3px 7px', borderRadius: 4,
          pointerEvents: 'none',
        }}>
          드래그로 위치 조정
        </div>
      )}
    </div>
  )
}
