/* dsh-neo-skin — client bundle template.
 *
 * This file is NOT served directly. scripts/build.mjs replaces the two
 * placeholder tokens (the package id and the compiled SCHEMES map) and writes
 * the final self-contained bundle to client.js — the exact artifact format the
 * official packages emit (tsdown), which the shell kernel loads via
 * window.__ModuleLoader__.load({ id, factory }).
 *
 * The factory body resolves three shared client-runtime modules the same way
 * the official ui-theme package does (react/jsx-runtime for JSX, primitives
 * for the Pill control, runtime-client for defineStore), then:
 *   - stacks the selected scheme's token layer through the `theme` service,
 *   - injects a neo-brutalism STRUCTURE layer (hard shadows / sharp corners /
 *     2px borders / press feedback / voice-plugin adaptation) + the scheme's
 *     own structure extras while enabled,
 *   - persists the on/off flag and the active scheme in localStorage
 *     (self-contained; a dsh-settings namespace would not be exposed to the
 *     Web client — see lib/index.js),
 *   - registers a settings row (on/off + scheme picker) into the General
 *     settings item slot.
 */
window.__ModuleLoader__.load({
	id: __PKG_NAME__,
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react_jsx_runtime = require("react/jsx-runtime");
		let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		const { jsx, jsxs } = react_jsx_runtime;
		const { Pill } = primitives;
		const { defineStore } = runtime_client;

		/** Source id of this token layer (the package id the façade pins). */
		const SOURCE = __PKG_NAME__;

		/** Compiled schemes: { blue: { label, css, tokens }, newspaper: {...} }. */
		const SCHEMES = __SCHEMES__;

		/** Locale namespace for the General settings row's copy. */
		const SETTINGS_NS = "settings.dsh-neo-skin";

		/** localStorage keys: skin on/off flag + active scheme id. */
		const STORAGE_KEY = "dsh-neo-skin.enabled";
		const SCHEME_KEY = "dsh-neo-skin.scheme";

		/**
		 * Neo-brutalism structure layer shared by every scheme: shadows, corners,
		 * borders, press feel, and the dsh-voice-input adaptation. Shadow color is
		 * theme-aware — --dsw-alias-border-l4 resolves to black in the light
		 * palette and white in the dark palette. Component class names carry
		 * stable readable suffixes (hash_name), so `[class*="_card"]` style
		 * selectors survive DSH rebuilds that only rotate the hash.
		 */
		const STRUCTURE_CSS = [
			"body{",
			"--dsw-shadow-lv1:2px 2px 0 var(--dsw-alias-border-l4)!important;",
			"--dsw-shadow-lv1-blur:2px 2px 0 var(--dsw-alias-border-l4)!important;",
			"--dsw-shadow-lv2:3px 3px 0 var(--dsw-alias-border-l4)!important;",
			"--dsw-shadow-lv3:4px 4px 0 var(--dsw-alias-border-l4)!important;",
			"}",
			"[class*=\"_card\"],[class*=\"_bubble\"],[class*=\"_panel\"],[class*=\"_code\"],",
			"[class*=\"_crumb\"],[class*=\"_option\"],[class*=\"_callRow\"],[class*=\"_notice\"],",
			"[class*=\"_selector\"],[class*=\"_workspace\"],[class*=\"_sectionHeader\"],",
			"[class*=\"_crumbBar\"]{",
			"border-radius:0!important;",
			"}",
			"[class*=\"_card\"],[class*=\"_option\"],[class*=\"_panel\"]{",
			"border-width:2px!important;",
			"}",
			"button:active:not(:disabled){",
			"transform:translate(1px,1px)!important;",
			"}",
			"[class*=\"_card\"]:active,[class*=\"_panel\"]:active{",
			"box-shadow:1px 1px 0 var(--dsw-alias-border-l4)!important;",
			"}",
			"/* dsh-voice-input adaptation: its CSS uses non-existent --dsw-alias-* tokens",
			"   (bg-elevated / bg-hover / accent-strong) so it falls back to hardcoded dark",
			"   values that break on light backgrounds; re-theme + neo-brutalize here. */",
			".dvi_pop{",
			"background:var(--dsw-specific-menu)!important;",
			"border-width:2px!important;",
			"border-radius:0!important;",
			"box-shadow:4px 4px 0 var(--dsw-alias-border-l4)!important;",
			"}",
			".dvi_btn,.dvi_pill,.dvi_done{",
			"border-radius:0!important;",
			"}",
			".dvi_pill,.dvi_done{",
			"border-width:2px!important;",
			"}",
			".dvi_btn:hover,.dvi_done:hover{",
			"background:var(--dsw-alias-interactive-bg-hover)!important;",
			"}",
			".dvi_listening{",
			"color:var(--dsw-alias-state-error-primary)!important;",
			"}",
			".dvi_listening:hover{",
			"background:var(--dsw-alias-interactive-bg-hover-danger)!important;",
			"}",
			".dvi_err{",
			"color:var(--dsw-alias-state-error-primary)!important;",
			"}",
			".dvi_pill.dvi_on{",
			"background:var(--dsw-alias-brand-primary)!important;",
			"border-color:var(--dsw-alias-brand-primary)!important;",
			"color:var(--dsw-alias-brand-primary-invert)!important;",
			"}"
		].join("\n");
		const STRUCTURE_TAG_ID = SOURCE + "/NeoStructure.css";

		/** Inline CSS for the settings row, mirroring ui-theme's AppearanceRow.module.css. */
		const css = "._neo_group{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}._neo_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}._neo_toggleRow{flex-wrap:wrap;align-items:center;gap:8px;display:flex}._neo_schemeLabel{color:var(--dsw-alias-label-caption);font-size:12px;font-weight:600;line-height:18px;margin-right:4px}";
		const tagId = __PKG_NAME__ + "/ToggleRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = __PKG_NAME__;
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const cssModule = {
			"group": "_neo_group",
			"title": "_neo_title",
			"toggleRow": "_neo_toggleRow",
			"schemeLabel": "_neo_schemeLabel"
		};

		const zh = {
			"neo.title": "Neo 皮肤",
			"neo.on": "开启",
			"neo.off": "关闭",
			"neo.scheme": "方案"
		};
		const en = {
			"neo.title": "Neo skin",
			"neo.on": "On",
			"neo.off": "Off",
			"neo.scheme": "Scheme"
		};

		/** First scheme id (the default when nothing is persisted). */
		function defaultScheme() {
			return Object.keys(SCHEMES)[0];
		}

		/** Read the persisted on/off flag (default enabled). */
		function readStored() {
			try {
				if (typeof localStorage === "undefined") return true;
				const v = localStorage.getItem(STORAGE_KEY);
				return v === null ? true : v !== "0" && v !== "false";
			} catch {
				return true;
			}
		}
		/** Persist the on/off flag. */
		function writeStored(enabled) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
			} catch {}
		}
		/** Read the persisted scheme id (fallback to the default). */
		function readScheme() {
			try {
				if (typeof localStorage === "undefined") return defaultScheme();
				const v = localStorage.getItem(SCHEME_KEY);
				return v && SCHEMES[v] ? v : defaultScheme();
			} catch {
				return defaultScheme();
			}
		}
		/** Persist the scheme id. */
		function writeScheme(name) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(SCHEME_KEY, name);
			} catch {}
		}

		/** Create (or replace) the structure <style> element for one scheme. */
		function createStructureStyle(scheme) {
			if (typeof document === "undefined") return null;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(STRUCTURE_TAG_ID) + "]");
			if (existing !== null) existing.remove();
			const def = SCHEMES[scheme] || SCHEMES[defaultScheme()];
			const tag = document.createElement("style");
			tag.dataset.plugin = SOURCE;
			tag.dataset.pluginCss = STRUCTURE_TAG_ID;
			tag.textContent = STRUCTURE_CSS + "\n" + (def.css || "");
			document.head.appendChild(tag);
			return tag;
		}

		/** Store mirroring the on/off flag + active scheme; written by apply() and clicks. */
		function createToggleStore() {
			return defineStore({
				init: () => ({ enabled: readStored(), scheme: readScheme() }),
				actions: {
					syncEnabled: (d, enabled) => { d.enabled = enabled; },
					syncScheme: (d, scheme) => { d.scheme = scheme; }
				}
			});
		}

		/** General settings row: 开启/关闭 + 方案选择器. */
		function ToggleRow({ t, setEnabled, setScheme, useStore }) {
			const enabled = useStore((s) => s.enabled);
			const scheme = useStore((s) => s.scheme);
			return jsxs("div", { className: cssModule.group, children: [
				jsx("div", { className: cssModule.title, children: t("neo.title") }),
				jsxs("div", { className: cssModule.toggleRow, children: [
					jsx(Pill, { active: enabled, onClick: () => setEnabled(true), children: t("neo.on") }, "on"),
					jsx(Pill, { active: !enabled, onClick: () => setEnabled(false), children: t("neo.off") }, "off")
				] }),
				jsxs("div", { className: cssModule.toggleRow, children: [
					jsx("span", { className: cssModule.schemeLabel, children: t("neo.scheme") }),
					Object.keys(SCHEMES).map((id) =>
						jsx(Pill, { active: scheme === id, onClick: () => setScheme(id), children: SCHEMES[id].label }, id)
					)
				] })
			] });
		}

		/** Cordis service-level inject: theme + the settings-row surface services. */
		const inject = ["theme", "slots", "locale"];

		/**
		 * Client plugin body:
		 *  - stack the active scheme's token + structure layers while enabled;
		 *  - switch schemes live (teardown + re-apply);
		 *  - register the settings row into the General settings item slot;
		 *  - persist toggles and scheme choice to localStorage.
		 * @param ctx - client cordis context with the required services resolved.
		 */
		function apply(ctx) {
			const store = createToggleStore();
			let bound;
			let layer = null;
			let structureTag = null;

			const applyLayer = (enabled) => {
				if (enabled && layer === null) {
					const def = SCHEMES[readScheme()];
					layer = ctx.theme.overrideTokens(SOURCE, def.tokens);
				} else if (!enabled && layer !== null) {
					layer();
					layer = null;
				}
				if (enabled && structureTag === null) {
					structureTag = createStructureStyle(readScheme());
				} else if (!enabled && structureTag !== null) {
					structureTag.remove();
					structureTag = null;
				}
			};

			const setScheme = (name) => {
				if (!SCHEMES[name] || name === readScheme()) return;
				writeScheme(name);
				if (layer !== null) { layer(); layer = null; }
				if (structureTag !== null) { structureTag.remove(); structureTag = null; }
				applyLayer(readStored());
				bound?.syncScheme(name);
			};

			const setEnabled = (v) => {
				writeStored(v);
				applyLayer(v);
				bound?.syncEnabled(v);
			};

			applyLayer(readStored());

			ctx.effect(() => () => {
				if (layer !== null) { layer(); layer = null; }
				if (structureTag !== null) { structureTag.remove(); structureTag = null; }
			}, "dsh-neo-skin: layers cleanup");

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "dsh-neo-skin: settings row dictionaries");

			const injected = (actions) => {
				bound = actions;
				return { setEnabled, setScheme };
			};

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "neo-skin",
				order: 15,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, ToggleRow));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
