import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  FiBookmark, FiEdit3, FiFeather, FiHeart, FiHome, FiLogOut,
  FiMail, FiMessageCircle, FiPhone, FiSearch, FiSend, FiShare2, FiUser, FiX,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { clearUser, getUser } from './auth.js'
import './App.css'

const MAX_LENGTH = 500

function readPosts(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value)
      ? value.filter((post) => typeof post.id === 'string' && typeof post.text === 'string' && !Number.isNaN(Date.parse(post.createdAt)))
      : []
  } catch {
    return []
  }
}

function displayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Foydalanuvchi'
}

function Avatar({ user, small = false }) {
  const initials = displayName(user).split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return <span className={`matn-avatar ${small ? 'matn-avatar-small' : ''}`} aria-hidden="true">{initials}</span>
}

function SideItem({ icon: Icon, children, active, onClick }) {
  return (
    <button type="button" className={`matn-side-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon aria-hidden="true" /> <span>{children}</span>
    </button>
  )
}

function PostCard({ post, user, onLike, onSave, onDelete, onShare, index, reduceMotion }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const date = new Intl.DateTimeFormat('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(post.createdAt))
  return (
    <motion.article
      className="matn-post"
      initial={reduceMotion || index > 5 ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.18, delay: 0 } }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.045, 0.2), ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="matn-post-head">
        <Avatar user={user} />
        <div className="matn-author">
          <strong>{displayName(user)}</strong>
          <span>@{user.username || 'foydalanuvchi'} · {date}</span>
        </div>
        <button type="button" className="matn-icon-button matn-delete" onClick={() => setConfirmDelete(true)} aria-label="Yozuvni o‘chirish"><FiX aria-hidden="true" /></button>
      </div>
      <p className="matn-post-text">{post.text}</p>
      {confirmDelete && <div className="matn-delete-confirm" role="group" aria-label="Yozuvni o‘chirishni tasdiqlash"><span>Bu matn o‘chirilsinmi?</span><div><button type="button" onClick={() => setConfirmDelete(false)}>Bekor qilish</button><button type="button" onClick={() => onDelete(post.id)}>O‘chirish</button></div></div>}
      <div className="matn-post-actions">
        <button type="button" className={post.liked ? 'is-selected' : ''} onClick={() => onLike(post.id)} aria-pressed={Boolean(post.liked)}><FiHeart aria-hidden="true" /> <span>{post.liked ? 'Yoqdi' : 'Yoqtirish'}</span></button>
        <button type="button" onClick={() => toast.info('Izohlar hali qo‘shilmagan')}><FiMessageCircle aria-hidden="true" /> <span>Izoh</span></button>
        <button type="button" onClick={() => onShare(post)}><FiShare2 aria-hidden="true" /> <span>Ulashish</span></button>
        <button type="button" className={`matn-save ${post.saved ? 'is-selected' : ''}`} onClick={() => onSave(post.id)} aria-label={post.saved ? 'Saqlanganlardan olish' : 'Saqlash'} aria-pressed={Boolean(post.saved)}><FiBookmark aria-hidden="true" /><span>{post.saved ? 'Saqlandi' : 'Saqlash'}</span></button>
      </div>
    </motion.article>
  )
}

function ProfileContent({ user, posts, savedCount, query, onNewPost, renderPosts, reduceMotion }) {
  const [tab, setTab] = useState('posts')
  const matches = posts.filter((post) => (tab !== 'saved' || post.saved) && post.text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))

  return (
    <motion.div className="matn-content" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="matn-page-intro"><div><span className="matn-eyebrow">SIZNING SAHIFANGIZ</span><h1>Profil</h1><p>Matnlaringiz va o‘zingiz haqingizdagi ma’lumotlar.</p></div></div>
      <section className="matn-profile-card" aria-label="Profil ma’lumotlari">
        <div className="matn-profile-cover" />
        <div className="matn-profile-body">
          <div className="matn-profile-top">
            <div className="matn-profile-identity"><Avatar user={user} /><div><span className="matn-profile-badge">Matn muallifi</span><h2>{displayName(user)}</h2><p>@{user.username || 'foydalanuvchi'}</p></div></div>
            <button type="button" className="matn-primary matn-profile-write" onClick={onNewPost}><FiEdit3 aria-hidden="true" /> Yangi matn yozish</button>
          </div>
          <p className="matn-profile-description">Fikrlar, kuzatishlar va yozuvlaringiz uchun shaxsiy sahifa.</p>
          <div className="matn-profile-stats"><div><strong>{posts.length}</strong><span>Yozilgan matn</span></div><div><strong>{savedCount}</strong><span>Saqlangan matn</span></div></div>
        </div>
      </section>
      {(user.email || user.phone) && <section className="matn-profile-info" aria-label="Akkaunt ma’lumotlari"><h2>Akkaunt ma’lumotlari</h2><div className="matn-profile-details">
        {user.email && <div><FiMail aria-hidden="true" /><span><small>Email</small>{user.email}</span></div>}
        {user.phone && <div><FiPhone aria-hidden="true" /><span><small>Telefon</small>{user.phone}</span></div>}
      </div></section>}
      <div className="matn-profile-tabs" role="tablist" aria-label="Profil matnlari">
        <button id="profile-posts-tab" type="button" role="tab" aria-controls="profile-posts-panel" aria-selected={tab === 'posts'} className={tab === 'posts' ? 'is-active' : ''} onClick={() => setTab('posts')}><FiEdit3 aria-hidden="true" /> Matnlarim <span>{posts.length}</span></button>
        <button id="profile-saved-tab" type="button" role="tab" aria-controls="profile-posts-panel" aria-selected={tab === 'saved'} className={tab === 'saved' ? 'is-active' : ''} onClick={() => setTab('saved')}><FiBookmark aria-hidden="true" /> Saqlanganlar <span>{savedCount}</span></button>
      </div>
      <div className="matn-feed-heading"><h2>{tab === 'saved' ? 'Saqlangan matnlar' : 'Matnlarim'}</h2><span>{matches.length} ta</span></div>
      <div id="profile-posts-panel" role="tabpanel" aria-labelledby={tab === 'saved' ? 'profile-saved-tab' : 'profile-posts-tab'} className="matn-feed" aria-live="polite">
        {matches.length ? renderPosts(matches) : <div className="matn-empty"><span>{tab === 'saved' ? <FiBookmark aria-hidden="true" /> : <FiEdit3 aria-hidden="true" />}</span><h3>{query ? 'Matn topilmadi' : tab === 'saved' ? 'Saqlangan matn yo‘q' : 'Hali matn yozilmagan'}</h3><p>{query ? 'Boshqa so‘z bilan qidirib ko‘ring.' : tab === 'saved' ? 'Matndagi saqlash tugmasini bosganingizda u shu yerda chiqadi.' : 'Birinchi matningizni yozing. U profilingizda ham ko‘rinadi.'}</p>{!query && tab === 'posts' && <button type="button" onClick={onNewPost}>Yangi matn yozish</button>}</div>}
      </div>
      <p className="matn-local-note">Profilingizdagi matnlar hozircha faqat ushbu brauzerda saqlanadi.</p>
    </motion.div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const location = useLocation()
  const isProfile = location.pathname === '/profile'
  const user = getUser()
  const storageKey = `matn:posts:${user?._id}`
  const [posts, setPosts] = useState(() => readPosts(storageKey))
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('home')
  const [focusPending, setFocusPending] = useState(false)
  const composerRef = useRef(null)

  useEffect(() => {
    if (focusPending && !isProfile && composerRef.current) {
      composerRef.current.focus()
      composerRef.current.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
      setFocusPending(false)
    }
  }, [focusPending, isProfile])

  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return posts.filter((post) => (view !== 'saved' || post.saved) && post.text.toLocaleLowerCase().includes(needle))
  }, [posts, view, query])

  const savePosts = (next) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setPosts(next)
      return true
    } catch {
      toast.error('Brauzer xotirasiga yozib bo‘lmadi')
      return false
    }
  }

  const publish = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    const next = [{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), liked: false, saved: false }, ...posts]
    if (savePosts(next)) {
      setDraft('')
      setQuery('')
      setView('home')
      toast.success('Matn qo‘shildi')
    }
  }

  const toggle = (id, field) => savePosts(posts.map((post) => post.id === id ? { ...post, [field]: !post[field] } : post))
  const remove = (id) => {
    if (savePosts(posts.filter((post) => post.id !== id))) toast.success('Matn o‘chirildi')
  }
  const share = async (post) => {
    try {
      await navigator.clipboard.writeText(post.text)
      toast.success('Matn nusxalandi')
    } catch {
      toast.error('Matnni nusxalab bo‘lmadi')
    }
  }
  const focusComposer = () => {
    setView('home')
    if (isProfile) navigate('/')
    setFocusPending(true)
  }
  const goToFeed = (nextView) => {
    navigate('/')
    setView(nextView)
    if (nextView !== 'search') setQuery('')
  }
  const logout = () => {
    clearUser()
    navigate('/login', { replace: true })
  }

  if (!user) return <Navigate to="/login" replace />

  const renderPosts = (items) => items.map((post, index) => <PostCard key={post.id} post={post} user={user} index={index} reduceMotion={reduceMotion} onLike={(id) => toggle(id, 'liked')} onSave={(id) => toggle(id, 'saved')} onDelete={remove} onShare={share} />)

  return (
    <div className="matn-app">
      <a className="matn-skip-link" href="#main-content">Asosiy qismga o‘tish</a>
      <aside className="matn-sidebar">
        <div>
          <div className="matn-brand"><span className="matn-brand-mark"><FiFeather aria-hidden="true" /></span><span>Matn</span></div>
          <nav className="matn-side-nav" aria-label="Asosiy menyu">
            <SideItem icon={FiHome} active={!isProfile && view === 'home'} onClick={() => goToFeed('home')}>Bosh sahifa</SideItem>
            <SideItem icon={FiSearch} active={!isProfile && view === 'search'} onClick={() => { goToFeed('search'); document.getElementById('matn-search')?.focus() }}>Qidiruv</SideItem>
            <SideItem icon={FiBookmark} active={!isProfile && view === 'saved'} onClick={() => goToFeed('saved')}>Saqlanganlar</SideItem>
            <SideItem icon={FiUser} active={isProfile} onClick={() => { setQuery(''); navigate('/profile') }}>Profil</SideItem>
          </nav>
          <button type="button" className="matn-primary matn-new-button" onClick={focusComposer}><FiEdit3 aria-hidden="true" /> Yangi matn yozish</button>
        </div>
        <div className="matn-account"><Avatar user={user} small /><div><strong>{displayName(user)}</strong><span>@{user.username || 'foydalanuvchi'}</span></div><button type="button" onClick={logout} aria-label="Chiqish" title="Chiqish"><FiLogOut /></button></div>
      </aside>

      <div className="matn-workspace">
        <header className="matn-topbar">
          <label className="matn-top-search"><FiSearch aria-hidden="true" /><input id="matn-search" name="search" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => { if (!isProfile) setView('search') }} placeholder="Matnlar bo‘ylab tezkor qidiruv…" aria-label="Matnlar bo‘ylab qidirish" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Qidiruvni tozalash"><FiX aria-hidden="true" /></button>}</label>
          <div className="matn-top-actions"><span className="matn-live"><i /> Faqat matn</span><button type="button" className="matn-avatar-link" onClick={() => { setQuery(''); navigate('/profile') }} aria-label="Profilni ochish"><Avatar user={user} small /></button></div>
        </header>

        <main id="main-content" tabIndex="-1" className="matn-main">
          {isProfile ? <ProfileContent user={user} posts={posts} savedCount={posts.filter((post) => post.saved).length} query={query} onNewPost={focusComposer} renderPosts={renderPosts} reduceMotion={reduceMotion} /> : <motion.div key={view} className="matn-content" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <div className="matn-page-intro"><div><span className="matn-eyebrow">TAFAKKUR MAYDONI</span><h1>{view === 'saved' ? 'Saqlangan matnlar' : view === 'search' ? 'Matnlardan qidirish' : 'Fikrlar oqimi'}</h1><p>{view === 'saved' ? 'Keyinroq o‘qish uchun ajratgan matnlaringiz.' : view === 'search' ? 'Shu brauzerda saqlangan matnlarni qidiring.' : 'Fikringizni yozing, matnlaringizni bir joyda saqlang.'}</p></div><span className="matn-count">{posts.length} ta matn</span></div>

            {view === 'home' && <section className="matn-composer" aria-label="Yangi matn yozish"><form onSubmit={publish}><div className="matn-composer-head"><Avatar user={user} small /><div><strong>{displayName(user)}</strong><span>Yangi fikr ulashing</span></div></div><label htmlFor="matn-draft" className="sr-only">Yangi matn</label><textarea id="matn-draft" name="post" autoComplete="off" ref={composerRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={MAX_LENGTH} placeholder="Bugun qanday fikrdasiz? Matningizni shu yerga yozing…" rows={5} /><div className="matn-composer-foot"><span>{draft.length} / {MAX_LENGTH} · Faqat shu brauzerda saqlanadi</span><button type="submit" className="matn-primary" disabled={!draft.trim()}>Ulashish <FiSend aria-hidden="true" /></button></div></form></section>}

            <div className="matn-feed-heading"><h2>{view === 'saved' ? 'Saqlanganlar' : view === 'search' ? 'Qidiruv natijalari' : 'Matnlarim'}</h2><span>{visiblePosts.length} ta</span></div>
            <div className="matn-feed" aria-live="polite">
              {visiblePosts.length ? renderPosts(visiblePosts) : <div className="matn-empty"><span><FiEdit3 aria-hidden="true" /></span><h3>{query ? 'Matn topilmadi' : view === 'saved' ? 'Saqlangan matn yo‘q' : 'Hali matn yozilmagan'}</h3><p>{query ? 'Boshqa so‘z bilan qidirib ko‘ring.' : view === 'saved' ? 'Matn yonidagi saqlash tugmasini bosing.' : 'Birinchi fikringizni yozing. U shu brauzerda saqlanadi.'}</p>{view === 'home' && !query && <button type="button" onClick={focusComposer}>Yozishni boshlash</button>}</div>}
            </div>
            <p className="matn-local-note">Postlar hozircha faqat ushbu brauzerda saqlanadi va boshqa foydalanuvchilarga ko‘rinmaydi.</p>
          </motion.div>}
        </main>
      </div>

      <nav className="matn-mobile-nav" aria-label="Mobil menyu"><button type="button" onClick={() => goToFeed('home')} aria-label="Bosh sahifa" aria-current={!isProfile && view === 'home' ? 'page' : undefined}><FiHome /></button><button type="button" onClick={() => { goToFeed('search'); document.getElementById('matn-search')?.focus() }} aria-label="Qidiruv"><FiSearch /></button><button type="button" onClick={focusComposer} aria-label="Yangi matn"><FiEdit3 /></button><button type="button" onClick={() => goToFeed('saved')} aria-label="Saqlanganlar" aria-current={!isProfile && view === 'saved' ? 'page' : undefined}><FiBookmark /></button><button type="button" onClick={() => { setQuery(''); navigate('/profile') }} aria-label="Profil" aria-current={isProfile ? 'page' : undefined}><FiUser /></button></nav>
    </div>
  )
}
