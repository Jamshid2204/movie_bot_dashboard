// Movie data access for the dashboard (browser). All calls go through the
// Supabase anon key; Row-Level Security enforces that writes require an
// authenticated session (the admin logs in via Supabase Auth).
import { supabase, TABLE, STORAGE_CHANNEL_ID } from './supabase';

/**
 * Parse the "where is the file?" input. Accepts either:
 *  - a full Telegram link:  https://t.me/c/1234567890/42  -> channel_id parsed from link
 *  - a bare message id (number) -> uses VITE_STORAGE_CHANNEL_ID
 * Returns { channel_id, message_id } or throws on invalid input.
 */
export function resolveLocation(linkOrId) {
  const raw = String(linkOrId ?? '').trim();
  if (!raw) throw new Error('A channel message link or message id is required');

  if (/^\d+$/.test(raw)) {
    if (!STORAGE_CHANNEL_ID) throw new Error('VITE_STORAGE_CHANNEL_ID is required when using a bare message id');
    return { channel_id: STORAGE_CHANNEL_ID, message_id: Number(raw) };
  }

  let m = /t\.me\/c\/(\d+)\/(\d+)/.exec(raw);
  if (m) return { channel_id: `-100${m[1]}`, message_id: Number(m[2]) };

  m = /t\.me\/(?:\+[^/]+|[^/]+)\/(\d+)/.exec(raw);
  if (m) {
    if (!STORAGE_CHANNEL_ID) throw new Error('Cannot derive channel id from this link; set VITE_STORAGE_CHANNEL_ID');
    return { channel_id: STORAGE_CHANNEL_ID, message_id: Number(m[1]) };
  }

  throw new Error('Unrecognized link format. Use https://t.me/c/<id>/<msgId> or a message id.');
}

export async function listMovies({ q = '', page = 1, pageSize = 25 } = {}) {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });
  if (q.trim()) {
    const pattern = `%${q.trim()}%`;
    query = query.or(`title.ilike.${pattern},code.ilike.${pattern}`);
  }
  const from = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: data || [], total: count || 0 };
}

export async function createMovie(input) {
  const { channel_id, message_id } = resolveLocation(input.linkOrId);
  // Generate the next MOV-XXXX code atomically via RPC.
  const { data: code, error: codeErr } = await supabase.rpc('next_movie_code');
  if (codeErr) throw codeErr;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      code,
      title: input.title.trim(),
      year: input.year ? Number(input.year) : null,
      genre: input.genre || null,
      quality: input.quality || null,
      language: input.language || null,
      channel_id,
      message_id,
      featured: !!input.featured,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMovie(id, fields) {
  const patch = { ...fields };
  if ('featured' in patch) patch.featured = !!patch.featured;
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteMovie(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function getStats() {
  const { count: total, error: tErr } = await supabase
    .from(TABLE).select('id', { count: 'exact', head: true });
  if (tErr) throw tErr;

  const { data: dlRows, error: dlErr } = await supabase.from(TABLE).select('downloads');
  const downloads = dlErr ? 0 : (dlRows || []).reduce((s, r) => s + (r.downloads || 0), 0);

  const { count: featured, error: fErr } = await supabase
    .from(TABLE).select('id', { count: 'exact', head: true }).eq('featured', true);

  const { data: top, error: topErr } = await supabase
    .from(TABLE).select('code, title, downloads').order('downloads', { ascending: false }).limit(5);

  return {
    total: total || 0,
    downloads,
    featured: fErr ? 0 : featured || 0,
    top: topErr ? [] : top || [],
  };
}
