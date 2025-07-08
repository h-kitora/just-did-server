const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// ログイン済みユーザー用の曲取得API
router.get('/', async (req, res) => {
  const access_token = req.query.access_token;
  const keyword = req.query.task || 'リラックスできる音楽';

  if (!access_token) {
    return res.status(400).send('Missing access_token');
  }

  try {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=playlist&limit=10`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const searchData = await searchRes.json();
    const playlists = searchData.playlists?.items || [];
    if (playlists.length === 0) {
      return res.status(404).send('No playlists found');
    }

    const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];
    const tracksUrl = `https://api.spotify.com/v1/playlists/${randomPlaylist.id}/tracks`;
    const tracksRes = await fetch(tracksUrl, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const tracksData = await tracksRes.json();
    const tracks = tracksData.items
      .filter(i => i.track)
      .map(i => ({
        title: i.track.name,
        artist: i.track.artists.map(a => a.name).join(', '),
        url: i.track.external_urls.spotify,
        imageUrl: i.track.album.images?.[0]?.url || '',
        trackId: i.track.id
      }));

    if (tracks.length === 0) {
      return res.status(404).send('No tracks found');
    }

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    res.json(randomTrack);
  } catch (err) {
    console.error('Error fetching full track:', err);
    res.status(500).send('Failed to fetch full track');
  }
});

module.exports = router;
