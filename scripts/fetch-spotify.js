// scripts/fetch-spotify.js
const { pushJson } = require("./utils/push-json.js");
require("dotenv").config(); // Load variables from .env file

// Read credentials securely from the environment
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });
  return response.json();
}

async function getNowPlaying(accessToken) {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 204) return { isPlaying: false };
  const song = await response.json();
  return {
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((a) => a.name).join(", "),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0]?.url,
    songUrl: song.item.external_urls.spotify,
  };
}

async function getRecentlyPlayed(accessToken) {
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  const song = data.items[0].track;
  return {
    isPlaying: false,
    title: song.name,
    artist: song.artists.map((a) => a.name).join(", "),
    album: song.album.name,
    albumImageUrl: song.album.images[0]?.url,
    songUrl: song.external_urls.spotify,
  };
}

async function main() {
  console.log("Fetching Spotify data...");
  const { access_token } = await getAccessToken();
  if (!access_token) {
    console.error("Could not get access token. Check your credentials.");
    return;
  }

  let songData = await getNowPlaying(access_token);

  if (!songData.isPlaying) {
    console.log("Nothing playing, getting last played track.");
    songData = await getRecentlyPlayed(access_token);
  }

  await pushJson("spotify-data.json", songData);
  // For now, just log the final data to the console.
  console.log("--- Spotify Data ---");
  console.log(JSON.stringify(songData, null, 2));
}

main();
