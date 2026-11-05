import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  FiArrowRight,
  FiFeather,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiLock,
  FiMail,
  FiMessageCircle,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { saveUser } from '../auth.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
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

function FloatingPost({ className, delay = 0, children }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={
        reduce
          ? { opacity: 1, scale: 1 }
          : { opacity: 1, scale: 1, y: [0, -10, 0] }
      }
      transition={
        reduce
          ? { duration: 0.4 }
          : {
              opacity: { duration: 0.6, delay },
              scale: { duration: 0.6, delay },
              y: { duration: 6, delay, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      className={`absolute rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
    >
      {children}
    </motion.div>
  )
}

function PostCard({ initials, name, time, text }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-[11px] text-white/45">{time}</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-white/75">{text}</p>
      <div className="mt-3 flex items-center gap-4 text-white/40">
        <span className="flex items-center gap-1.5 text-[11px]">
          <FiHeart className="size-3.5" aria-hidden="true" /> Yoqdi
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <FiMessageCircle className="size-3.5" aria-hidden="true" /> Izoh
        </span>
      </div>
    </>
  )
}

export default function Login() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) {
      next.email = 'Emailni kiriting'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Email noto'g'ri formatda"
    }
    if (!form.password) {
      next.password = 'Parolni kiriting'
    } else if (form.password.length < 6) {
      next.password = 'Parol kamida 6 ta belgidan iborat'
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
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status !== 200) {
        toast.error(data.message?.trim() || 'Kirishda xatolik yuz berdi')
        return
      }

      if (typeof data.user?._id !== 'string' || !data.user._id) {
        toast.error("Server foydalanuvchi ma'lumotini qaytarmadi")
        return
      }

      saveUser(data.user, remember)
      toast.success(data.message?.trim() || 'Xush kelibsiz!')
      navigate('/')
    } catch {
      toast.error('Server bilan aloqa yo\'q. Backend ishlayaptimi?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-1/4 size-[420px] rounded-full bg-rose-500/25 blur-[120px]" />
            <div className="absolute -right-20 bottom-0 size-[360px] rounded-full bg-pink-600/20 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_55%)]" />
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
            <FloatingPost className="-top-44 left-0 w-60 -rotate-3" delay={0.5}>
              <PostCard
                initials="S"
                name="Sardor"
                time="hozir"
                text="Ba'zan eng yaxshi fikr oddiy bir jumlada tug'iladi."
              />
            </FloatingPost>
            <FloatingPost
              className="-top-16 left-56 w-56 rotate-3"
              delay={0.8}
            >
              <PostCard
                initials="M"
                name="Malika"
                time="2 daqiqa"
                text="Rasm yo'q. Faqat matn. Va shu yetarli."
              />
            </FloatingPost>

            <h1 className="relative mt-24 text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">
              Fikringni yoz,
              <br />
              <span className="bg-gradient-to-r from-rose-300 to-pink-500 bg-clip-text text-transparent">
                qolganini biz qilamiz.
              </span>
            </h1>
            <p className="relative mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Rasm yo'q, video yo'q — faqat matn. Instagram uslubidagi yangi
              avlod blogi.
            </p>
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
                Xush kelibsiz
              </h2>
              <p className="mt-2 text-[15px] text-zinc-500 dark:text-zinc-400">
                Akkauntga kirib, yozishni davom ettiring.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <div className="relative">
                  <FiMail
                    className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ism@misol.uz"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="input h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-rose-500"
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Parol
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-rose-600 transition hover:text-rose-500 dark:text-rose-400"
                  >
                    Parolni unutdingizmi?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock
                    className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    className="input h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-12 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                    }
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <FiEyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <FiEye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors.password}
                  </p>
                )}
              </motion.div>

              <motion.label
                variants={itemVariants}
                className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400"
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="checkbox checkbox-sm rounded-md border-zinc-300 [--input-color:var(--color-rose-500)] checked:bg-rose-500 checked:text-white dark:border-zinc-700"
                />
                Meni eslab qol
              </motion.label>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="btn h-12 w-full rounded-xl border-0 bg-gradient-to-r from-rose-500 to-pink-600 text-[15px] font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-600 hover:to-pink-700 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Kirilmoqda...
                  </>
                ) : (
                  <>
                    Kirish
                    <FiArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
            >
              Akkauntingiz yo'qmi?{' '}
              <Link
                to="/register"
                className="font-semibold text-rose-600 transition hover:text-rose-500 dark:text-rose-400"
              >
                Ro'yxatdan o'tish
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
