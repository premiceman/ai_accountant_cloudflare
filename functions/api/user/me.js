import { json } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';

export const onRequest = requireUser(async (context) => {
  const u = context.user;
  return json({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role || 'user' });
});
