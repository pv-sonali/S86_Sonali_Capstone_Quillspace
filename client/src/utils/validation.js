/**
 * Shared client-side validation utilities (#37)
 * Single source of truth for validation rules — prevents duplication across Login/Signup/EditProfile
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateUsername = (username) => {
  return (
    username.length >= 3 &&
    username.length <= 20 &&
    /^[a-zA-Z0-9_-]*$/.test(username)
  )
}

export const validatePassword = (password) => {
  return password.length >= 8 // Must match backend (#2)
}

export const validateUrl = (url) => {
  if (!url) return true // optional field
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
