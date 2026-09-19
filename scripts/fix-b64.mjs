// Restores a missing 40-char base64 chunk in apply-login-theme.mjs (line 15).
import fs from "node:fs";

const F = "scripts/apply-login-theme.mjs";
const s = fs.readFileSync(F, "utf8");
const lines = s.split("\n");
const line = lines[14];
if (!line || !line.startsWith('  "PGRpdiBjbGFzc05hbWU')) {
  throw new Error("unexpected line 15 - aborting");
}
const FIX = "gIDwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA";
const rel = 4158;
if (line.slice(rel, rel + 8) !== "8L3A+CiA") throw new Error("offset mismatch");
if (line.slice(rel - 20, rel) !== "AgICAgICAgICAgICAgICAgICA") throw new Error("context mismatch");
lines[14] = line.slice(0, rel) + FIX + line.slice(rel);
fs.writeFileSync(F, lines.join("\n"));
console.log("base64 chunk restored in apply-login-theme.mjs");
