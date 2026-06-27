import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { listMovies, getStats } from './movies';
import Login from './components/Login.jsx';
import Stats from './components/Stats.jsx';
import MovieTable from './components/MovieTable.jsx';
import AddMovieForm from './components/AddMovieForm.jsx';

// Simple tab-based SPA: Movies | Add Movie | Stats.
// Auth state is owned by Supabase (session in localStorage). We subscribe to
// auth changes so login/logout anywhere updates the UI.
export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState('movies');
  const [movies, setMovies] = useState({ rows: [], total: 0 });
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    // Restore existing session on load.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    // Subscribe to future auth changes.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function load() {
    if (!session) return;
    setLoading(true);
    try {
      const [m, s] = await Promise.all([
        listMovies({ page, pageSize, q }),
        getStats(),
      ]);
      setMovies(m);
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page]);

  async function onLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  // Don't flash the login screen before we've checked for an existing session.
  if (!authReady) return <div className="app"><p className="muted">Loading…</p></div>;

  if (!session) {
    return (
      <div className="app">
        <Login onLoggedIn={() => { /* onAuthStateChange updates `session` */ }} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(movies.total / pageSize));

  return (
    <div className="app">
      <div className="topbar">
        <h1>🎬 Movie Bot Dashboard</h1>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button className={tab === 'movies' ? 'primary' : ''} onClick={() => setTab('movies')}>Movies</button>
        <button className={tab === 'add' ? 'primary' : ''} onClick={() => setTab('add')}>Add Movie</button>
        <button className={tab === 'stats' ? 'primary' : ''} onClick={() => setTab('stats')}>Stats</button>
      </div>

      {tab === 'movies' && (
        <MovieTable
          movies={movies}
          loading={loading}
          q={q}
          setQ={setQ}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          reload={load}
        />
      )}
      {tab === 'add' && (
        <AddMovieForm
          onCreated={() => {
            setTab('movies');
            setPage(1);
            load();
          }}
        />
      )}
      {tab === 'stats' && stats && <Stats stats={stats} />}
    </div>
  );
}
