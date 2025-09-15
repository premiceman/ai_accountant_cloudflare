import { json } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';

export const onRequest = requireUser(async () => {
  const now = new Date();
  const year = now.getFullYear();
  const byMonth = Array.from({length: 12}, (_,i)=>({ month: i+1, income: 0, expenses: 0, net: 0 }));
  return json({ year, totals: { income: 0, expenses: 0, net: 0 }, byMonth, categories: [] });
});
