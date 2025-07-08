const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Client Credentials Flow でアクセストークン取得
const getAccessToken = async () => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams({ grant_type: 'client_credentials' });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
  const data = await response.json();
  return data.access_token;
};

// 未ログインユーザー用の曲取得API
router.get('/', async (req, res) => {
  const keyword = req.query.task || 'リラックスできる音楽';

  try {
    const token = await getAccessToken();
    if (!token) {
      return res.status(500).send('Failed to get access token');
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=playlist&limit=10`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    const playlists = searchData.playlists?.items || [];
    if (playlists.length === 0) {
      return res.status(404).send('No playlists found');
    }

    const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];
    const tracksUrl = `https://api.spotify.com/v1/playlists/${randomPlaylist.id}/tracks`;
    const tracksRes = await fetch(tracksUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tracksData = await tracksRes.json();
    const tracks = tracksData.items
      .filter(i => i.track && i.track.preview_url)
      .map(i => ({
        title: i.track.name,
        artist: i.track.artists.map(a => a.name).join(', '),
        url: i.track.external_urls.spotify,
        imageUrl: i.track.album.images?.[0]?.url || '',
        previewUrl: i.track.preview_url
      }));

    if (tracks.length === 0) {
      return res.status(404).send('No tracks with preview available');
    }

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    res.json(randomTrack);
  } catch (err) {
    console.error('Error fetching preview track:', err);
    res.status(500).send('Failed to fetch preview track');
  }
});

module.exports = router;
