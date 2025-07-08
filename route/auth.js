const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

// SpotifyログインURL生成
router.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email user-library-read user-library-modify streaming';
  const state = Math.random().toString(36).substring(7);
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state
    });
  res.redirect(authUrl);
});

// コールバックでトークン取得
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams({
    code,
    redirect_uri,
    grant_type: 'authorization_code'
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    const data = await response.json();
    res.redirect(`${process.env.FRONTEND_URI}?access_token=${data.access_token}&refresh_token=${data.refresh_token}`);
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.status(500).send('Failed to get tokens');
  }
});

// リフレッシュトークン
router.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(500).send('Failed to refresh token');
  }
});

module.exports = router;
