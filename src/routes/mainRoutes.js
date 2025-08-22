import { Router } from 'express';
import crypto from 'crypto';
import { checkGameFree } from '../services/redis.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('home_page');
});

router.get('/full', (req, res) => {
  res.render('full');
});

router.get('/create', (req, res) => {
  const context = { "server": process.env.CLIENT_URL };
  res.render('create_game', context);
});

router.get('/create_game', (req, res) => {
  const code = crypto.randomBytes(15).toString('hex');
  res.json(code);
});

router.get('/join', (req, res) => {
  const context = { "server": process.env.CLIENT_URL };
  res.render('join_game', context);
});

router.post('/check_game', async (req, res) => {
  const status = await checkGameFree(req.body.key);
  res.json(status);
});

router.get('/game/:key', (req, res) => {
  const context = { "key": req.params.key, "server": process.env.CLIENT_URL };
  res.render('game', context);
});

export default router;