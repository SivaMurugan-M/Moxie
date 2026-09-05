import React, { useState, useRef, useEffect } from 'react'
import { AppIcon, ArrowDownIcon, CheckIcon } from '../../icons'

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  prefixIcon = null,
  height = '38px',
  minWidth = '130px',
  width = null,
  align = 'left', // 'left' | 'right'
  name = '',
  id = null,
  disabled = false,
  style = {},
  buttonStyle = {},
  menuStyle = {},
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Normalize options array into [{ value, label, icon }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        icon: opt.icon || null
      }
    }
    return {
      value: opt,
      label: String(opt),
      icon: null
    }
  })

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div
      ref={dropdownRef}
      id={id}
      className={`custom-select-container ${className}`.trim()}
      style={{
        position: 'relative',
        display: width === '100%' ? 'block' : 'inline-block',
        width: width || (minWidth ? 'auto' : undefined),
        minWidth: width === '100%' ? undefined : minWidth,
        ...style
      }}
    >
      {name && <input type="hidden" name={name} value={value || ''} />}
      <button
        type="button"
        disabled={disabled}
        className="custom-select-button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          height: height,
          background: disabled ? 'var(--card-soft, #f8fafc)' : 'var(--input-bg, #ffffff)',
          border: isOpen ? '1px solid var(--purple, #6366f1)' : '1px solid var(--input-border, #cbd5e1)',
          borderRadius: '8px',
          padding: '0 12px',
          fontSize: '12.5px',
          fontWeight: '600',
          color: disabled ? 'var(--muted, #94a3b8)' : 'var(--ink, #0f172a)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease',
          outline: 'none',
          ...buttonStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          {prefixIcon && <AppIcon icon={prefixIcon} size={15} color="#6366f1" style={{ flexShrink: 0 }} />}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: selectedOption ? 'var(--ink, #0f172a)' : 'var(--ink-secondary, #64748b)',
              fontWeight: selectedOption ? '600' : '400'
            }}
          >
            {displayLabel}
          </span>
        </div>

        <AppIcon
          icon={ArrowDownIcon}
          size={13}
          color="var(--ink-secondary, #64748b)"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '4px'
          }}
        />
      </button>

      {isOpen && (
        <div
          className="custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: align === 'right' ? 'auto' : 0,
            right: align === 'right' ? 0 : 'auto',
            minWidth: '100%',
            maxWidth: '340px',
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'var(--card, #ffffff)',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.10)',
            padding: '5px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            ...menuStyle
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(value) === String(opt.value)
            return (
              <button
                key={String(opt.value)}
                type="button"
                className={`custom-select-option ${isSelected ? 'selected' : ''}`.trim()}
                onClick={() => {
                  if (onChange) {
                    onChange({ target: { name, value: opt.value } }, opt.value)
                  }
                  setIsOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: '100%',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--purple, #6366f1)' : 'var(--ink, #1e293b)',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--card-soft, #f8fafc)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  {opt.icon && <AppIcon icon={opt.icon} size={14} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                </div>
                {isSelected && <AppIcon icon={CheckIcon} size={13} color="var(--purple, #6366f1)" style={{ flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
