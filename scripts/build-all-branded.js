#!/usr/bin/env node

/**
 * build-all-branded.js
 *
 * Reads eas.json and triggers EAS builds for all branded club profiles.
 * Skips non-club profiles (development, preview, production).
 *
 * Usage:
 *   node scripts/build-all-branded.js              # both platforms
 *   node scripts/build-all-branded.js --ios         # iOS only
 *   node scripts/build-all-branded.js --android     # Android only
 *   node scripts/build-all-branded.js --dry-run     # print commands only
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── Parse CLI flags ──────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const iosOnly = args.includes('--ios');
const androidOnly = args.includes('--android');

const platforms = [];
if (!iosOnly && !androidOnly) {
  platforms.push('ios', 'android');
} else {
  if (iosOnly) platforms.push('ios');
  if (androidOnly) platforms.push('android');
}

// ── Load eas.json ────────────────────────────────────────────
const easPath = path.join(__dirname, '..', 'eas.json');
const eas = JSON.parse(fs.readFileSync(easPath, 'utf-8'));
const buildProfiles = eas.build || {};

// Profiles that are NOT club builds
const SKIP_PROFILES = new Set(['development', 'preview', 'production']);

// Detect branded profiles: has EXPO_PUBLIC_CLUB_SLUG env var and not in skip list
const brandedProfiles = Object.entries(buildProfiles)
  .filter(([name, cfg]) => !SKIP_PROFILES.has(name) && cfg.env?.EXPO_PUBLIC_CLUB_SLUG)
  .map(([name, cfg]) => ({
    name,
    slug: cfg.env.EXPO_PUBLIC_CLUB_SLUG,
    appName: cfg.env.EXPO_PUBLIC_APP_NAME || cfg.env.EXPO_PUBLIC_CLUB_NAME || name,
  }));

if (brandedProfiles.length === 0) {
  console.log('No branded profiles found in eas.json');
  process.exit(0);
}

// ── Build ────────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log('  CraveClubs — Branded EAS Builds');
console.log('========================================');
console.log(`  Profiles: ${brandedProfiles.length}`);
console.log(`  Platforms: ${platforms.join(', ')}`);
console.log(`  Mode:      ${dryRun ? 'DRY RUN' : 'LIVE'}`);
console.log('========================================');
console.log('');

const results = [];

for (const profile of brandedProfiles) {
  for (const platform of platforms) {
    const cmd = `eas build --platform ${platform} --profile ${profile.name} --non-interactive`;

    console.log(`[${profile.appName}] ${platform.toUpperCase()}`);
    console.log(`  > ${cmd}`);

    if (dryRun) {
      results.push({ profile: profile.name, platform, status: 'dry-run' });
      console.log('  (skipped — dry run)\n');
      continue;
    }

    try {
      execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      results.push({ profile: profile.name, platform, status: 'success' });
      console.log('');
    } catch (err) {
      results.push({ profile: profile.name, platform, status: 'failed' });
      console.error(`  FAILED: ${err.message}\n`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log('  Build Summary');
console.log('========================================');
for (const r of results) {
  const icon = r.status === 'success' ? 'OK' : r.status === 'dry-run' ? '--' : 'FAIL';
  console.log(`  [${icon}] ${r.profile} (${r.platform})`);
}
console.log('========================================');
console.log(`  Total: ${results.length} builds`);
console.log(`  Passed: ${results.filter(r => r.status === 'success').length}`);
console.log(`  Failed: ${results.filter(r => r.status === 'failed').length}`);
console.log('');
