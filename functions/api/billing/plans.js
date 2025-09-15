import { json } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';
export const onRequest = requireUser(async () => {
  return json({ plans: [
    { id: 'free', name: 'Free', price: 0, currency: 'GBP', features: ['Basics'] },
    { id: 'pro', name: 'Pro', price: 19, currency: 'GBP', features: ['Docs', 'Summary'] },
    { id: 'team', name: 'Team', price: 49, currency: 'GBP', features: ['Multi-user'] },
  ]});
});

//test