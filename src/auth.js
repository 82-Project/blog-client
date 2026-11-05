const STORAGE_KEY = 'user'

export function saveUser(user, remember = true) {
  if (!user || typeof user !== 'object' || typeof user._id !== 'string') {
    throw new Error('Server foydalanuvchi ma\'lumotini qaytarmadi')
  }

  const { _id, firstName, lastName, username, email, phone, avatar } = user
  const storage = remember ? localStorage : sessionStorage
  const otherStorage = remember ? sessionStorage : localStorage

  storage.setItem(STORAGE_KEY, JSON.stringify({
    _id, firstName, lastName, username, email, phone, avatar,
  }))
  otherStorage.removeItem(STORAGE_KEY)
}

export function getUser() {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const user = JSON.parse(storage.getItem(STORAGE_KEY))
      if (typeof user?._id === 'string' && user._id) return user
    } catch {
      // Ignore malformed or older stored values.
    }
  }
  return null
}

export function hasUser() {
  return Boolean(getUser())
}

export function clearUser() {
  sessionStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_KEY)
}
