import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Update the license in the database
    const { data, error } = await supabase
      .from('licenses')
      .update({ current_users: 0 })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error resetting user count:', error);
    return res.status(500).json({ error: 'Failed to reset user count' });
  }
} 