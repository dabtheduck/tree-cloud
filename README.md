# Tree Cloud — full working PWA (local-first)

Grow out of the spiral, one small thanks at a time. A gratitude journal that grows a pixel plant as you answer prompts. **No server, no cloud, no accounts.** All data lives in IndexedDB on the device that opened it — each person gets their own garden automatically.

## How it works
- **Grow tab** — 1) Check in 1–10 with tappable number buttons, 2) Pick a world (drawn scene cards: Rivers & Valleys / Desert / Outer Space), 3) A “You'll be growing…” preview, then Answer & Grow.
- Mood → plant: **1–3 Tree** (8 layers, starts as a stump), **4–6 Shrub** (6 layers), **7–10 Flower** (4 layers). One stage of growth per answer, with 8-bit WebAudio sounds + haptics. The plant's type is hidden until it blooms — mood + universe decides the exact species (30 plants: e.g. mood 8 = Agave in Desert, Bamboo in Rivers & Valleys, Moon Bamboo in Outer Space).
- Progress is a climb bar (%, marker, end label) to one end: Tree → Outer Space, Shrub → Clear Sky, Flower → Full Bloom. The background climbs from dark storm clouds/rain to clear sky and stars. Each of the 30 species has its own silhouette, palette and motion (flutter, ripple, twinkle, shiver, wobble, glow, bloom…).
- Prompt logic lives in `prompts.js` (easy to edit). Layer = a question kind: grounding yes/no (41 prompts, with a remark after the tap when its Yes/No/Both tag fits, and rotating gentle lines after a No), short (48 prompts, all “List …” statements, no question marks), open-ended (39 prompts — the repository of good things). Tree: 6 grounding, 1 short, 1 open. Shrub: 3 grounding, 2 short, 1 open. Flower: 1 grounding, 1 short, 2 open. Sessions never repeat a prompt, and no set of 6 grounding questions ever repeats. After a session: congratulations names the plant, Branches are shown, then “Do you feel better?” (Yes = “Let's go!! That's a win!”, No offers Back to cloud / Grow another / Review good days — Review only if good days are saved).
- Voice: type or record up to 1:00 per prompt (MediaRecorder, auto-stop, play back, re-record). Stored locally in IndexedDB.
- **Grow tab** — the home cloud garden is the default view, with a 1–10 “How are you feeling right now?” scale. Low mood = more dry dead weeds, high mood = fewer; a finished plant replaces a weed. Random events sometimes leave a gift plant — tap it to read its encouragement note.
- **Garden tab** — only today's plants, as pots in 3 columns (2 on mobile) with world filters (All / Rivers & Valleys / Desert / Outer Space). Tap a plant → only that plant, its scene, and its **Branches** (its own prompts + answers).
- **Settings tab** — name your garden (max 6 characters, shown on the sign on the cloud, just the name, with a live sign preview), one gentle sound set (Muted Pixel Rain; Desert plays a warm muted pluck + dry leaf crinkle, Outer Space adds twinkly blips), sound test, one simple reminder time, and Backup (export/import).
- **Calendar tab** — month calendar, no scrollable journal. Each grown day shows a snapshot picture of that day's actual garden (its real plants on the cloud, with the mood alongside). Tap a day → all plants grown that day.
- **Build Your Own** — hidden one layer deep: after picking a world, the “You'll be growing…” screen has a quiet “or grow your own?” link. It expands to Tree (8) / Shrub (6) / Flower (4) with topic-filled steps, a topic box (e.g. work, family, friends), and a colour picker (Natural + 8 presets + any colour). It grows one of 9 exclusive special plants (Golden Oak, Gem Pine, Sun Palm, Rainbow Sage, Moon Cactus, Ember Bush, Aurora Fern, Starlight Bloom, Golden Aloe) with a “★ Grown by you” badge.
- **Cloud grows with you** — the home cloud adds a new row every 6 plants, no cap; the page scrolls normally when it gets tall. A small floating ↑/↓ button jumps up or down the page.
- **Random events** — up to 2 per day (22 events). **Prompts rotate** — no question repeats within the last 3 plants.

## Deploy to GitHub Pages (free, ~5 minutes)
1. Create a new public GitHub repo, e.g. `tree-cloud`.
2. Upload the contents of this folder (`index.html`, `style.css`, `app.js`, `prompts.js`, `manifest.webmanifest`, `sw.js`, `icons/`) to the repo root. Commit.
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, Folder: `/ (root)` → Save.
4. Wait ~1 minute. Open `https://<your-username>.github.io/tree-cloud/` — on a phone, use the browser menu → **Add to Home Screen / Install app**. It works offline after the first visit.
5. **Important:** serve over HTTPS (GitHub Pages does this) — the service worker and microphone need it. Opening `index.html` directly from disk will load, but install/offline/mic will not work properly.

## Test it
- Pick mood 2, Desert, answer all 8 prompts (try a voice note on one) → plant lands in Garden, today shows a ⛈ summary in Calendar, plant detail shows only its Branches, progress bar reads “8 / 8 — to Outer Space”.
- Export text-only, then Export with voice, then Import one of them — you should see a success message and your plants restored.
- Sound toggle + TEST button are in the header. Turn sound off if you prefer silence.

## Files
`index.html` · `style.css` · `app.js` · `prompts.js` · `manifest.webmanifest` · `sw.js` · `icons/icon-192.png` · `icons/icon-512.png` · `README.md` · `plants.md` · `prompts-brainstorm.md` · `prompts-overview.md` (prompt source files — safe to upload too; the Christian bonus list in `christian-bonus-prompts.md` is parked and NOT used by the app)
