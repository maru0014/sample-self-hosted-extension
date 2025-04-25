const fs = require("fs");
const pkg = require("./../package.json");
const manifestPath = "../.output/chrome-mv3/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.version = pkg.version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
