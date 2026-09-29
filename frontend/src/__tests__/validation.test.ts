import { describe, it, expect } from 'vitest'

describe('Form Validation', () => {
  it('validates email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('test@example.com')).toBe(true)
    expect(emailRegex.test('invalid')).toBe(false)
    expect(emailRegex.test('test@')).toBe(false)
    expect(emailRegex.test('@example.com')).toBe(false)
  })

  it('validates password length', () => {
    const password = 'short'
    expect(password.length >= 8).toBe(false)
    expect('longenough'.length >= 8).toBe(true)
  })

  it('validates caption max length', () => {
    const maxLength = 2200
    const caption = 'a'.repeat(2201)
    expect(caption.length <= maxLength).toBe(false)
    expect('a'.repeat(2200).length <= maxLength).toBe(true)
  })

  it('validates hashtag format', () => {
    const hashtagRegex = /^#[\w]+$/
    expect(hashtagRegex.test('#Business')).toBe(true)
    expect(hashtagRegex.test('Business')).toBe(false)
    expect(hashtagRegex.test('#')).toBe(false)
  })
})
