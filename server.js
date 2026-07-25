const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const STATE_FILE = path.join(__dirname, "data", "state.json");

app.use(express.json({ limit: "120mb" }));
app.use(express.urlencoded({ extended: true, limit: "120mb" }));
app.use(express.static(path.join(__dirname, "public")));

function readState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw);
    return {
      profile: parsed.profile || {},
      posts: Array.isArray(parsed.posts) ? parsed.posts : []
    };
  } catch {
    return { profile: {}, posts: [] };
  }
}

function writeState(state) {
  const temp = STATE_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(temp, STATE_FILE);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "DİDİ Sosyal Pro", version: "8.0.0" });
});

app.get("/api/state", (_req, res) => {
  const state = readState();
  res.json({ ok: true, ...state });
});

app.put("/api/state/posts", (req, res) => {
  const posts = Array.isArray(req.body.posts) ? req.body.posts : null;
  if (!posts) {
    return res.status(400).json({ ok: false, message: "Gönderi listesi geçersiz." });
  }
  const state = readState();
  state.posts = posts.slice(0, 1000);
  writeState(state);
  res.json({ ok: true });
});

app.put("/api/state/profile", (req, res) => {
  const profile = req.body.profile;
  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ ok: false, message: "Profil bilgisi geçersiz." });
  }
  const state = readState();
  state.profile = {
    name: String(profile.name || "Mehmet Sait").slice(0, 80),
    username: String(profile.username || "@mehmetsait").slice(0, 50),
    initials: String(profile.initials || "MS").slice(0, 4),
    bio: String(profile.bio || "").slice(0, 500),
    location: String(profile.location || "").slice(0, 100)
  };
  writeState(state);
  res.json({ ok: true, profile: state.profile });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ ok: false, message: err.message || "Sunucu hatası." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DİDİ Sosyal Pro 8.0: http://localhost:${PORT}`);
});
