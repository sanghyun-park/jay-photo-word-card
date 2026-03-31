import { useRef } from 'react'
import { SIZE_PRESETS } from '../constants'
import styles from './CardEditor.module.css'

export default function CardEditor({ image, word, settings, onImageChange, onWordChange, onSettingsChange }) {
  const fileInputRef = useRef(null)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onImageChange(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  function set(key, value) {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className={styles.editor}>
      {/* 이미지 업로드 */}
      <section className={styles.section}>
        <label className={styles.label}>이미지</label>
        <div
          className={styles.dropzone}
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {image ? (
            <img src={image} alt="업로드된 이미지" className={styles.thumb} />
          ) : (
            <>
              <span className={styles.dropIcon}>📁</span>
              <span>클릭하거나 이미지를 드래그하세요</span>
              <span className={styles.dropHint}>JPG, PNG, WebP 지원</span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {image && (
          <button className={styles.clearBtn} onClick={() => onImageChange(null)}>
            이미지 제거
          </button>
        )}
      </section>

      {/* 단어 입력 */}
      <section className={styles.section}>
        <label className={styles.label} htmlFor="word-input">단어</label>
        <input
          id="word-input"
          type="text"
          className={styles.input}
          placeholder="단어를 입력하세요"
          value={word}
          onChange={(e) => onWordChange(e.target.value)}
        />
      </section>

      {/* 카드 크기 */}
      <section className={styles.section}>
        <label className={styles.label}>카드 크기</label>
        <div className={styles.presetGrid}>
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.id}
              className={`${styles.presetBtn} ${settings.sizePreset === p.id ? styles.active : ''}`}
              onClick={() => set('sizePreset', p.id)}
            >
              <span className={styles.presetLabel}>{p.label}</span>
              <span className={styles.presetDesc}>{p.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 텍스트 위치 */}
      <section className={styles.section}>
        <label className={styles.label}>텍스트 위치</label>
        <div className={styles.btnGroup}>
          {['top', 'middle', 'bottom'].map((pos) => (
            <button
              key={pos}
              className={`${styles.posBtn} ${settings.textPosition === pos ? styles.active : ''}`}
              onClick={() => set('textPosition', pos)}
            >
              {pos === 'top' ? '위' : pos === 'middle' ? '가운데' : '아래'}
            </button>
          ))}
        </div>
      </section>

      {/* 글자 크기 */}
      <section className={styles.section}>
        <label className={styles.label}>글자 크기: <strong>{parseInt(settings.fontSize)}px</strong></label>
        <input
          type="range"
          min={16}
          max={80}
          value={parseInt(settings.fontSize)}
          onChange={(e) => set('fontSize', `${e.target.value}px`)}
          className={styles.slider}
        />
      </section>

      {/* 텍스트 색상 */}
      <section className={styles.section}>
        <label className={styles.label}>텍스트 색상</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => set('textColor', e.target.value)}
            className={styles.colorPicker}
          />
          <span>{settings.textColor}</span>
        </div>
      </section>

      {/* 배경 색상 */}
      <section className={styles.section}>
        <label className={styles.label}>배경 색상</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => set('bgColor', e.target.value)}
            className={styles.colorPicker}
          />
          <span>{settings.bgColor}</span>
        </div>
      </section>

      {/* 배경 투명도 */}
      <section className={styles.section}>
        <label className={styles.label}>배경 투명도: <strong>{Math.round(settings.bgOpacity * 100)}%</strong></label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.bgOpacity}
          onChange={(e) => set('bgOpacity', parseFloat(e.target.value))}
          className={styles.slider}
        />
      </section>
    </div>
  )
}
