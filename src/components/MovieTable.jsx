import { useState } from 'react';
import { updateMovie, deleteMovie } from '../movies';

export default function MovieTable({ movies, loading, q, setQ, page, setPage, totalPages, reload }) {
  const [deleting, setDeleting] = useState(null);

  async function toggleFeatured(m) {
    try {
      await updateMovie(m.id, { featured: !m.featured });
      reload();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remove(m) {
    if (!confirm(`Delete ${m.code} — ${m.title}? This removes the DB row (the storage-channel message stays).`)) return;
    setDeleting(m.id);
    try {
      await deleteMovie(m.id);
      reload();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    reload();
  }

  return (
    <div>
      <form className="card" onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Search by title or code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="primary">Search</button>
        {q && (
          <button type="button" onClick={() => { setQ(''); setPage(1); setTimeout(reload, 0); }}>Clear</button>
        )}
      </form>

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : movies.rows.length === 0 ? (
          <p className="muted">No movies found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Year</th>
                <th>Quality</th>
                <th>Downloads</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movies.rows.map((m) => (
                <tr key={m.id}>
                  <td><code>{m.code}</code></td>
                  <td>{m.title}</td>
                  <td>{m.year || '—'}</td>
                  <td>{m.quality || '—'}</td>
                  <td>{m.downloads}</td>
                  <td>
                    <button
                      className="small"
                      onClick={() => toggleFeatured(m)}
                      style={m.featured ? { color: 'var(--ok)', borderColor: 'var(--ok)' } : {}}
                    >
                      {m.featured ? '★ Featured' : '☆ Off'}
                    </button>
                  </td>
                  <td className="row-actions">
                    <button
                      className="small danger"
                      disabled={deleting === m.id}
                      onClick={() => remove(m)}
                    >
                      {deleting === m.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>◀ Prev</button>
          <span className="muted">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ▶</button>
        </div>
      </div>
    </div>
  );
}
