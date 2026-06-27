export default function Stats({ stats }) {
  return (
    <div>
      <div className="grid">
        <div className="card stat">
          <div className="label">Total Movies</div>
          <div className="value">{stats.total}</div>
        </div>
        <div className="card stat">
          <div className="label">Total Downloads</div>
          <div className="value">{stats.downloads}</div>
        </div>
        <div className="card stat">
          <div className="label">Featured</div>
          <div className="value">{stats.featured}</div>
        </div>
      </div>

      <div className="card">
        <h3>🏆 Top 5 by downloads</h3>
        {stats.top && stats.top.length ? (
          <table>
            <thead>
              <tr><th>#</th><th>Code</th><th>Title</th><th>Downloads</th></tr>
            </thead>
            <tbody>
              {stats.top.map((t, i) => (
                <tr key={t.code}>
                  <td>{i + 1}</td>
                  <td><code>{t.code}</code></td>
                  <td>{t.title}</td>
                  <td>{t.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No movies yet.</p>
        )}
      </div>
    </div>
  );
}
