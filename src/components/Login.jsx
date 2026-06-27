import { useState } from 'react';
import { supabase } from '../supabase';

// Supabase Auth login (email + password). Admin users are created in the
// Supabase dashboard (Authentication → Users). On success the auth state
// listener in App.jsx picks up the new session automatically.
export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onLoggedIn?.();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card login" onSubmit={submit}>
      <h2>🔐 Dashboard Login</h2>
      <p className="muted">Sign in with your admin account (created in Supabase → Authentication).</p>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          placeholder="admin@example.com"
        />
      </div>
      <div className="field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <button className="primary" style={{ width: '100%' }} disabled={busy || !email || !password}>
        {busy ? 'Logging in…' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
