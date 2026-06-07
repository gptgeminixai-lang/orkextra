# SFVIP Web Player

Browser-based IPTV player inspired by the SFVIP desktop project in this folder.

## Run

Open `index.html` directly for local files and demo streams.

For real IPTV playlists, EPG imports, HLS streams that need browser CORS support, and the Capy AI chat widget, run the included local server:

```powershell
$env:CAPY_API_KEY="capy_xxxx"
# Optional: $env:CAPY_MODEL="gpt-5.4"
node .\web-player\server.js --port=4173
```

Then open:

```text
http://127.0.0.1:4173/web-player/
```

## Feature Map

- Saved profiles for M3U URL import, M3U file import, Xtream-style account import, and MAG/MAC portal accounts.
- Profile switching with a single live-channel list for the selected credentials.
- Live channel playback by clicking a channel.
- Floating Capy AI assistant through the local server-side `/api/capy/chat` proxy.
- HLS, MPEG-TS, MP4 and audio playback, fullscreen, picture-in-picture, volume, mute, keyboard controls, and local media file playback.
- XMLTV EPG import with a guide view and current/up-next program display.
- Smart playlists by type, group, search text, favorites, rating, and HD quality.
- Recording scheduler, live browser capture when supported, and captured file download.
- Subtitle upload, SRT-to-VTT conversion, subtitle URL support, and channel-linked automatic subtitles.
- Parental PIN controls with lock/unlock per channel.
- Theme/accent customization, video filters, audio output selection, and equalizer presets.
