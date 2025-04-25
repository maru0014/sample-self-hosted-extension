// scripts/sync-manifest-version.cjs
const fs = require("fs");
const path = require("path");

// __dirname はこの .cjs スクリプトのあるフォルダを指す
const projectRoot = path.resolve(__dirname, "..");
const pkgPath = path.join(projectRoot, "package.json");
const manifestPath = path.join(projectRoot, ".output", "chrome-mv3", "manifest.json");

// package.json を読み込み
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// manifest.json を読み込み → バージョン同期 → 上書き
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.version = pkg.version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`✔️  Manifest version synced to ${pkg.version}`);
