#!/usr/bin/env node

/**
 * add-club.js — scaffold a branded club build profile from backend data.
 *
 * Usage:
 *   node scripts/add-club.js <club-slug>
 *   npm run add-club <club-slug>
 *
 * What it does:
 *   1. Fetches club branding from GET {API}/api/v1/branding/{slug}
 *   2. Validates that per-club icon assets exist (warns if missing)
 *   3. Adds/updates the club's build profile in eas.json
 *      (bundle ID is carried via env.APP_BUNDLE_ID — consumed by app.config.js)
 *
 * Env:
 *   CRAVECLUBS_API_URL — API base URL, no path (default: https://api.craveclubs.com)
 */

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: node scripts/add-club.js <club-slug>');
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    `Invalid slug "${slug}" — must be lowercase letters/digits with single dashes (e.g. "future-academy").`,
  );
  process.exit(1);
}

const API_BASE = (process.env.CRAVECLUBS_API_URL || 'https://api.craveclubs.com').replace(/\/+$/, '');

/** future-academy -> com.craveclubs.futureacademy (matches app.config.js fallback) */
function toBundleId(clubSlug) {
  return `com.craveclubs.${clubSlug.replace(/-/g, '')}`;
}

/** Ensure a color string has a # prefix (backend stores colors without #) */
function toHex(color) {
  if (!color) return null;
  return color.startsWith('#') ? color : `#${color}`;
}

async function fetchBranding(clubSlug) {
  const url = `${API_BASE}/api/v1/branding/${clubSlug}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Branding API returned ${res.status} for "${clubSlug}" (${url})`);
  }
  const json = await res.json();
  // Laravel may wrap the payload in { data: {...} }
  return json.data ?? json;
}

async function main() {
  console.log(`Fetching branding for "${slug}" from ${API_BASE}...`);
  const branding = await fetchBranding(slug);

  const appName =
    branding.display_name || branding.app_name || branding.club_name || branding.name;
  const primaryColor = toHex(branding.primary_color);

  if (!appName || !primaryColor) {
    console.error(
      'Branding API response is missing an app name (display_name/app_name/club_name) or primary_color. Aborting.',
    );
    console.error('Response was:', JSON.stringify(branding, null, 2));
    process.exit(1);
  }

  // 1. Check icon assets exist
  const iconDir = path.join(__dirname, '..', 'assets', 'icons', slug);
  const requiredAssets = ['icon.png', 'adaptive-icon.png', 'splash.png'];
  const missing = requiredAssets.filter((f) => !fs.existsSync(path.join(iconDir, f)));

  if (missing.length > 0) {
    console.warn(`\n!  Missing icon assets in assets/icons/${slug}/:`);
    missing.forEach((f) => console.warn(`   - ${f}`));
    console.warn('   The build will fall back to assets/icons/craveclubs/ for these.\n');
  } else {
    console.log(`OK All icon assets found in assets/icons/${slug}/`);
  }

  // 2. Read and update eas.json
  const easPath = path.join(__dirname, '..', 'eas.json');
  const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));

  const existing = eas.build[slug];
  if (existing) {
    console.log(`Profile "${slug}" already exists in eas.json — updating it.`);
  }

  // Never change the bundle ID of an existing profile — once an app is
  // published, its identifier is permanent on both stores.
  const bundleId = existing?.env?.APP_BUNDLE_ID || toBundleId(slug);

  eas.build[slug] = {
    extends: 'production',
    env: {
      EXPO_PUBLIC_CLUB_SLUG: slug,
      EXPO_PUBLIC_APP_NAME: appName,
      EXPO_PUBLIC_CLUB_NAME: branding.club_name || appName,
      EXPO_PUBLIC_PRIMARY_COLOR: primaryColor.replace('#', ''),
      EXPO_PUBLIC_CLUB_PRIMARY_COLOR: primaryColor,
      EXPO_PUBLIC_API_URL: API_BASE,
      APP_BUNDLE_ID: bundleId,
    },
  };

  fs.writeFileSync(easPath, JSON.stringify(eas, null, 2) + '\n');
  console.log(`OK Added/updated "${slug}" profile in eas.json`);
  console.log(`   Bundle ID:     ${bundleId}`);
  console.log(`   App Name:      ${appName}`);
  console.log(`   Primary Color: ${primaryColor}`);

  // 3. Verify bundle ID uniqueness across all club profiles
  const ids = Object.entries(eas.build)
    .filter(([, cfg]) => cfg.env?.APP_BUNDLE_ID)
    .map(([name, cfg]) => ({ name, id: cfg.env.APP_BUNDLE_ID }));
  const dupes = ids.filter((a) => ids.some((b) => b.name !== a.name && b.id === a.id));
  if (dupes.length > 0) {
    console.error('\nX  DUPLICATE bundle IDs detected — stores will reject these:');
    dupes.forEach((d) => console.error(`   ${d.name}: ${d.id}`));
    process.exit(1);
  }

  console.log('\nNext steps:');
  const steps = [];
  if (missing.length > 0) {
    steps.push(`Add missing icon assets to assets/icons/${slug}/`);
  }
  steps.push(`Build:  eas build --profile ${slug} --platform all`);
  steps.push(`Submit: eas submit --profile ${slug} --platform all`);
  steps.push('First release only: create the App Store / Google Play listing for this bundle ID');
  steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
