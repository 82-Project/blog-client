import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  FiArrowRight,
  FiAtSign,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiFeather,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi'
import { toast } from 'react-toastify'

const API_URL = 'http://localhost:9000'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

const inputClass =
  'input h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-rose-500'

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['Juda zaif', 'Zaif', "O'rtacha", 'Yaxshi', 'Kuchli']
const strengthColors = [
  'bg-zinc-300 dark:bg-zinc-700',
  'bg-rose-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
]

function Field({ id, label, icon: Icon, error, optional, children }) {
  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-zinc-400">ixtiyoriy</span>
        )}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        {children}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </motion.div>
  )
}

const perks = [
  'Faqat matn — rasm va videosiz',
  "Fikrlaringizni do'stlar bilan ulashing",
  'Yoqtiring, izoh qoldiring, kuzating',
]

export default function Register() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (event) => {
    const { name } = event.target
    const value =
      name === 'username'
        ? event.target.value.toLowerCase().replace(/\s/g, '')
        : event.target.value
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const validate = () => {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'Ismingizni kiriting'
    if (!form.lastName.trim()) next.lastName = 'Familiyangizni kiriting'

    if (!form.username) {
      next.username = 'Foydalanuvchi nomini kiriting'
    } else if (!USERNAME_RE.test(form.username)) {
      next.username = "3–20 belgi: kichik harf, raqam, _ yoki ."
    }

    if (!form.email.trim()) {
      next.email = 'Emailni kiriting'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Email noto'g'ri formatda"
    }

    if (form.phone && !/^\+?\d{9,15}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      next.phone = "Telefon raqam noto'g'ri"
    }

    if (!form.password) {
      next.password = 'Parolni kiriting'
    } else if (form.password.length < 6) {
      next.password = 'Parol kamida 6 ta belgidan iborat'
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Parolni qayta kiriting'
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Parollar mos kelmadi'
    }
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message?.trim() || "Ro'yxatdan o'tishda xatolik")
        return
      }

      toast.success(data.message?.trim() || 'Akkaunt yaratildi!')
      navigate('/login')
    } catch {
      toast.error("Server bilan aloqa yo'q. Backend ishlayaptimi?")
    } finally {
      setLoading(false)
    }
  }

  const inputProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-zinc-950 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 top-1/4 size-[420px] rounded-full bg-rose-500/25 blur-[120px]" />
            <div className="absolute -left-20 bottom-0 size-[360px] rounded-full bg-pink-600/20 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.06),transparent_55%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-3"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg shadow-rose-500/25">
              <FiFeather className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Matn
            </span>
          </motion.div>

          <div className="relative max-w-md">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">
              Birinchi postingiz
              <br />
              <span className="bg-gradient-to-r from-rose-300 to-pink-500 bg-clip-text text-transparent">
                bir jumladan boshlanadi.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Bir daqiqada akkaunt oching va o'z fikrlaringizni yozishni
              boshlang.
            </p>

            <ul className="mt-10 space-y-4">
              {perks.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.35 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-3 text-[15px] text-white/75"
                >
                  <span className="grid size-6 place-items-center rounded-full border border-rose-400/30 bg-rose-500/15 text-rose-300">
                    <FiCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  {perk}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative flex items-center gap-2 text-xs text-white/35"
          >
            <span className="inline-block size-1.5 rounded-full bg-rose-400" />
            Faqat so'zlar. Ortiqcha shovqinsiz.
          </motion.div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-8">
          <motion.div
            variants={containerVariants}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="w-full max-w-md"
          >
            <motion.div
              variants={itemVariants}
              className="mb-8 flex items-center gap-2.5 lg:hidden"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                <FiFeather className="size-4" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Matn</span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-semibold tracking-tight">
                Akkaunt yaratish
              </h2>
              <p className="mt-2 text-[15px] text-zinc-500 dark:text-zinc-400">
                Ma'lumotlaringizni kiriting va yozishni boshlang.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="Ism"
                  icon={FiUser}
                  error={errors.firstName}
                >
                  <input
                    {...inputProps('firstName')}
                    type="text"
                    autoComplete="given-name"
                    placeholder="Sardor"
                    className={inputClass}
                  />
                </Field>
                <Field
                  id="lastName"
                  label="Familiya"
                  icon={FiUser}
                  error={errors.lastName}
                >
                  <input
                    {...inputProps('lastName')}
                    type="text"
                    autoComplete="family-name"
                    placeholder="Aliyev"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                id="username"
                label="Foydalanuvchi nomi"
                icon={FiAtSign}
                error={errors.username}
              >
                <input
                  {...inputProps('username')}
                  type="text"
                  autoComplete="username"
                  placeholder="sardor_01"
                  className={inputClass}
                />
              </Field>

              <Field id="email" label="Email" icon={FiMail} error={errors.email}>
                <input
                  {...inputProps('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="ism@misol.uz"
                  className={inputClass}
                />
              </Field>

              <Field
                id="phone"
                label="Telefon"
                icon={FiPhone}
                error={errors.phone}
                optional
              >
                <input
                  {...inputProps('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                />
              </Field>

              <Field
                id="password"
                label="Parol"
                icon={FiLock}
                error={errors.password}
              >
                <input
                  {...inputProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"
                  }
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  {showPassword ? (
                    <FiEyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <FiEye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </Field>

              {form.password && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="-mt-2 space-y-1.5"
                >
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          strength >= step
                            ? strengthColors[strength]
                            : 'bg-zinc-200 dark:bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Parol kuchi: {strengthLabels[strength]}
                  </p>
                </motion.div>
              )}

              <Field
                id="confirmPassword"
                label="Parolni tasdiqlang"
                icon={FiLock}
                error={errors.confirmPassword}
              >
                <input
                  {...inputProps('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass}
                />
              </Field>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="btn h-12 w-full rounded-xl border-0 bg-gradient-to-r from-rose-500 to-pink-600 text-[15px] font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-600 hover:to-pink-700 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    Ro'yxatdan o'tish
                    <FiArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
            >
              Akkauntingiz bormi?{' '}
              <Link
                to="/login"
                className="font-semibold text-rose-600 transition hover:text-rose-500 dark:text-rose-400"
              >
                Kirish
              </Link>
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mt-10 text-center text-[11px] text-zinc-400 dark:text-zinc-600"
            >
              © 2026 Matn. Faqat matn.
            </motion.p>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
