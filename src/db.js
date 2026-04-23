import { supabase } from './supabase';

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const getAppContent = async () => {
  const { data, error } = await supabase.from('app_content').select('*');
  if (error) throw error;
  return data.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
};

export const adminGetStats = async () => {
  const [users, posts, reports, events] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('account_type', 'in', '("official")'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_welcome', false),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('*', { count: 'exact', head: true }),
  ]);
  return { users: users.count || 0, posts: posts.count || 0, reports: reports.count || 0, events: events.count || 0 };
};

export const adminGetUsers = async ({ page = 0, search = '', limit = 20 } = {}) => {
  let q = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, account_type, admin_role, activated, wallet, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, page * limit + limit - 1);
  if (search) q = q.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

export const adminUpdateUser = async (userId, updates) => {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

export const adminGetReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reporter_id(username, display_name), posts(id, caption, image_url, user_id)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
};

export const adminResolveReport = async (reportId, action, resolvedBy) => {
  const { error } = await supabase
    .from('reports')
    .update({ status: 'resolved', action_taken: action, resolved_at: new Date().toISOString(), resolved_by: resolvedBy })
    .eq('id', reportId);
  if (error) throw error;
};

export const adminDeletePost = async (postId) => {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
};

export const adminUpdateAppContent = async (key, value) => {
  const { error } = await supabase.from('app_content').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
};

export const adminGetAllEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, profiles(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
};

export const adminDeleteEvent = async (eventId) => {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
};
