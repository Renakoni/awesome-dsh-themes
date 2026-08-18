/* dsh-neo-skin — host half (dual-face package shape, mirroring the official
 * dsh-client-* packages).
 *
 * The loader mounts a cordis entry for this package by its root export; the
 * modules node half only composes client bundles from entries that mounted a
 * fiber. This skin needs no host-side behaviour — the whole effect lives in
 * the client half (client.js), which stacks the token layer through the
 * `theme` service in the browser. Keeping a real (no-op) host apply makes the
 * fiber mount so the client bundle reaches window.__DSH_BOOT__.
 *
 * NOTE (settings): the on/off toggle persists in the browser's localStorage
 * rather than a `dsh-settings` namespace, because the host apiproxy only
 * serves settings namespaces on an explicit allowlist
 * (`WEB_SETTINGS_NAMESPACES` in @deepseek-ai/dsh-host-apiproxy). A
 * third-party namespace registers fine but answers `settings-not-exposed`
 * to the Web client; letting a plugin expose its own namespace is deferred
 * upstream work. localStorage keeps this skin self-contained and publishable
 * without patching the harness.
 */

/** Stable Cordis plugin name. */
const name = "dsh-neo-skin";

/** No host-side services or registries are required by this skin. */
function apply() {}

export { apply, name };
