import { Router } from 'express';
import { validateEmail, validatePhoneCN, validatePassword } from '../utils/validate';
import { success, badRequest, unauthorized, tooManyRequests } from '../utils/response';
import { getAdminClient, findUserByEmail, findUserByPhone, createUserForEmail, createUserForPhone, signInWithEmail } from '../services/supabase';
import { limiter } from '../middleware/rateLimiter';
import { logger } from '../logger';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return badRequest(res, 'invalid_params');
    }
    const isEmail = validateEmail(username);
    const isPhone = validatePhoneCN(username);
    if (!isEmail && !isPhone) return badRequest(res, 'invalid_username');
    if (!validatePassword(password)) return badRequest(res, 'weak_password');

    const key = `${req.ip}:${username}`;
    if (limiter.isLocked(key)) return tooManyRequests(res, 'too_many_attempts');

    const client = getAdminClient();
    let user: { id: string; email?: string; phone?: string } | null = null;
    if (isEmail) {
      const u = await findUserByEmail(client, username);
      user = u ? { id: u.id, email: u.email || undefined, phone: u.user_metadata?.phone } : null;
    } else {
      const u = await findUserByPhone(client, username);
      user = u ? { id: u.id, email: u.email || undefined, phone: username } : null;
    }

    if (user) {
      const email = user.email as string;
      const signed = await signInWithEmail(email, password);
      if (!signed) {
        limiter.recordFail(key);
        const locked = limiter.isLocked(key);
        if (locked) return tooManyRequests(res, 'too_many_attempts');
        return unauthorized(res, 'invalid_credentials');
      }
      limiter.reset(key);
      logger.info({ msg: 'login_success', username, ip: req.ip });
      return success(res, { token: signed.access_token, user });
    } else {
      if (isEmail) {
        const created = await createUserForEmail(client, username, password);
        const signed = await signInWithEmail(created.email as string, password);
        logger.info({ msg: 'register_success', username, ip: req.ip });
        return success(res, { token: signed?.access_token, user: { id: created.id, email: created.email } });
      } else {
        const created = await createUserForPhone(client, username, password);
        const signed = await signInWithEmail(created.email as string, password);
        logger.info({ msg: 'register_success', username, ip: req.ip });
        return success(res, { token: signed?.access_token, user: { id: created.id, email: created.email, phone: username } });
      }
    }
  } catch (err) {
    next(err);
  }
});

export default router;