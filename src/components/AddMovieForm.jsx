import { useState } from 'react';
import { createMovie } from '../movies';

const EMPTY = {
  title: '',
  year: '',
  genre: '',
  quality: '',
  language: '',
  linkOrId: '',
  featured: false,
};

export default function AddMovieForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setCreated(null);
    try {
      const body = {
        title: form.title,
        year: form.year ? Number(form.year) : undefined,
        genre: form.genre || undefined,
        quality: form.quality || undefined,
        language: form.language || undefined,
        linkOrId: form.linkOrId,
        featured: form.featured,
      };
      const movie = await createMovie(body);
      setCreated(movie);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>➕ Add a movie</h3>
      <p className="muted">
        Upload the file to your storage channel in Telegram first, then paste its message link
        (e.g. <code>https://t.me/c/1234567890/42</code>) or just the message id below.
      </p>

      <div className="field">
        <label>Channel message link or message id *</label>
        <input
          value={form.linkOrId}
          onChange={(e) => set('linkOrId', e.target.value)}
          placeholder="https://t.me/c/1234567890/42"
          required
        />
      </div>

      <div className="field">
        <label>Title *</label>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
      </div>

      <div className="form-row">
        <div className="field">
          <label>Year</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => set('year', e.target.value)}
            placeholder="1999"
          />
        </div>
        <div className="field">
          <label>Genre</label>
          <select value={form.genre} onChange={(e) => set('genre', e.target.value)}>
            <option value="">—</option>
            <option>Action</option>
            <option>Adventure</option>
            <option>Comedy</option>
            <option>Horror</option>
            <option>Drama</option>
            <option>Thriller</option>
            <option>Sci-Fi</option>
            <option>Fantasy</option>
            <option>Romance</option>
            <option>Crime</option>
          </select>
        </div>
        <div className="field">
          <label>Quality</label>
          <select value={form.quality} onChange={(e) => set('quality', e.target.value)}>
            <option value="">—</option>
            <option>1080</option>
            <option>720</option>
            <option>480</option>
          </select>
        </div>
        <div className="field">
          <label>Language</label>
          <select value={form.language} onChange={(e) => set('language', e.target.value)}>
            <option value="">—</option>
            <option>uzb</option>
            <option>rus</option>
            <option>eng</option>
          </select>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          style={{ width: 'auto' }}
        />
        Featured (show in "Popular")
      </label>

      <div className="row-actions">
        <button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save movie'}</button>
        {created && <button type="button" onClick={onCreated}>Back to list</button>}
      </div>

      {created && (
        <div className="ok">
          ✅ Created <code>{created.code}</code> — {created.title}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </form>
  );
}
