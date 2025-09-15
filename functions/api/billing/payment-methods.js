import { json } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';
export const onRequest = requireUser(async () => json({ methods: [] }));
