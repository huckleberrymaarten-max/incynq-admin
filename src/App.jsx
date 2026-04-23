import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { logoutUser, getProfile } from './db'
import AdminScreen from './screens/AdminScreen'
import C from './theme'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sendingLink, setSendingLink] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getProfile(session.user.id)
          .then(profile => {
            const ADMIN_TYPES = ['admin', 'super_admin', 'moderator', 'support', 'finance', 'content_editor']
            if (!ADMIN_TYPES.includes(profile.account_type)) {
              setError('Access denied — admin account required')
              supabase.auth.signOut()
              setLoading(false)
              return
            }
            setCurrentUser({
              id: session.user.id,
              username: profile.username,
              displayName: profile.display_name,
              accountType: profile.account_type,
              adminRole: profile.admin_role,
            })
          })
          .catch(() => {
            supabase.auth.signOut()
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
      }
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfile(session.user.id)
        const ADMIN_TYPES = ['admin', 'super_admin', 'moderator', 'support', 'finance', 'content_editor']
        if (!ADMIN_TYPES.includes(profile.account_type)) {
          setError('Access denied — admin account required')
          supabase.auth.signOut()
          return
        }
        setCurrentUser({
          id: session.user.id,
          username: profile.username,
          displayName: profile.display_name,
          accountType: profile.account_type,
          adminRole: profile.admin_role,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSendingLink(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })
      if (error) throw error
      setSuccess('Check your email for the login link!')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send login link')
    } finally {
      setSendingLink(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
          <div style={{ fontSize: 14, color: C.muted }}>Loading…</div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8 }}>InCynq Admin</h1>
            <div style={{ fontSize: 14, color: C.muted }}>Staff access only</div>
          </div>

          <form onSubmit={handleSendMagicLink} style={{ background: C.card, borderRadius: 16, padding: '24px 20px', border: `1px solid ${C.border}` }}>
            {error && (
              <div style={{ padding: '10px 14px', background: '#ff446611', border: '1px solid #ff446633', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#ff6644', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: '10px 14px', background: '#00e5a011', border: '1px solid #00e5a033', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#00e5a0', textAlign: 'center' }}>
                ✓ {success}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>ADMIN EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@incynq.app"
                required
                autoFocus
              />
            </div>

            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              We'll send you a secure login link — no password needed.
            </div>

            <button
              type="submit"
              disabled={sendingLink}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                background: sendingLink ? C.border : `linear-gradient(135deg, ${C.sky}, ${C.peach})`,
                color: sendingLink ? C.muted : '#040f14',
                fontWeight: 800,
                fontSize: 14,
              }}>
              {sendingLink ? '⏳ Sending link…' : 'Send Login Link →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: C.muted }}>
            InCynq · admin.incynq.app
          </div>
        </div>
      </div>
    )
  }

  return <AdminScreen currentUser={currentUser} onLogout={() => logoutUser()} />
}
