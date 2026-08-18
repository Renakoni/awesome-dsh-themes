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
	id: "dsh-neo-skin",
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
		const SOURCE = "dsh-neo-skin";

		/** Compiled schemes: { blue: { label, css, tokens }, newspaper: {...} }. */
		const SCHEMES = {"blue":{"label":"蓝统治","css":"/* Scheme A「蓝统治」structure extras.\n *\n * The light-mode sidebar is a DARK blue (#1E317A via sidebar-fill), but DSH\n * colors sidebar text with the shared --dsw-alias-label-* tokens (dark in\n * light mode) — so the sidebar chrome must be re-lit here. The selected row\n * keeps its own label-primary (white block in light / blue block in dark).\n */\n[class*=\"_sessionRow\"]:not([class*=\"_selected\"]),\n[class*=\"_projectRow\"]:not([class*=\"_selected\"]),\n[class*=\"_searchResultRow\"]:not([class*=\"_selected\"]),\n[class*=\"_sessionRow\"]:not([class*=\"_selected\"]) *,\n[class*=\"_projectRow\"]:not([class*=\"_selected\"]) *,\n[class*=\"_searchResultRow\"]:not([class*=\"_selected\"]) *,\n[class*=\"_sectionLabel\"] {\n\tcolor: #E8EDFB !important;\n}\n[class*=\"_iconButton\"] {\n\tcolor: #B9C6E8 !important;\n}","tokens":{"--dsw-alias-bg-base":{"light":"#F3EFE6","dark":"#0D111C"},"--dsw-alias-bg-layer-1":{"light":"#FDFBF6","dark":"#121826"},"--dsw-alias-bg-layer-2":{"light":"#FDFBF6","dark":"#171E2E"},"--dsw-alias-bg-layer-3":{"light":"#FDFBF6","dark":"#1C2436"},"--dsw-alias-bg-mask-1":{"light":"rgba(0, 0, 0, 0.35)","dark":"rgba(0, 0, 0, 0.6)"},"--dsw-alias-bg-mask-2":{"light":"rgba(0, 0, 0, 0.15)","dark":"rgba(0, 0, 0, 0.35)"},"--dsw-alias-bg-mask-3":{"light":"rgba(0, 0, 0, 0.5)","dark":"rgba(0, 0, 0, 0.55)"},"--dsw-alias-bg-mask-photo":{"light":"rgba(0, 0, 0, 0.88)","dark":"rgba(0, 0, 0, 0.88)"},"--dsw-alias-bg-mask-drop":{"light":"rgba(255, 255, 255, 0.85)","dark":"rgba(30, 30, 30, 0.85)"},"--dsw-alias-bg-module-platform":{"light":"#EDE7DB","dark":"#121826"},"--dsw-alias-bg-multi-select":{"light":"#E3DCCE","dark":"#171E2E"},"--dsw-alias-bg-overlay":{"light":"#FDFBF6","dark":"#1C2436"},"--dsw-alias-bg-skeleton":{"light":"rgba(0, 0, 0, 0.08)","dark":"rgba(255, 255, 255, 0.08)"},"--dsw-alias-border-inverted2":{"light":"rgba(26, 26, 26, 0.9)","dark":"rgba(255, 255, 255, 0.9)"},"--dsw-alias-border-inverted":{"light":"rgba(26, 26, 26, 0.9)","dark":"rgba(255, 255, 255, 0.9)"},"--dsw-alias-border-l1":{"light":"rgba(26, 26, 26, 0.85)","dark":"rgba(255, 255, 255, 0.85)"},"--dsw-alias-border-l2-darkmode-thin":{"light":"rgba(26, 26, 26, 0.9)","dark":"rgba(255, 255, 255, 0.9)"},"--dsw-alias-border-l2":{"light":"#1A1A1A","dark":"rgba(255, 255, 255, 0.9)"},"--dsw-alias-border-l3":{"light":"#1A1A1A","dark":"rgba(255, 255, 255, 0.9)"},"--dsw-alias-border-l4":{"light":"#1A1A1A","dark":"#FFFFFF"},"--dsw-alias-brand-primary-invert":{"light":"#FFFFFF","dark":"#FFFFFF"},"--dsw-alias-brand-primary-new-colorprimary-new-color":{"light":"#4176E6","dark":"#6B9BFF"},"--dsw-alias-brand-primary":{"light":"#2340A8","dark":"#2A54D0"},"--dsw-alias-brand-text":{"light":"#2340A8","dark":"#2A54D0"},"--dsw-alias-button-contrast-fill":{"light":"#111111","dark":"#F5F1E8"},"--dsw-alias-button-elevated-fill":{"light":"#FDFBF6","dark":"#171E2E"},"--dsw-alias-button-floating-fill":{"light":"#FDFBF6","dark":"#1C2436"},"--dsw-alias-button-floating-hover":{"light":"#EDE7DB","dark":"#222B40"},"--dsw-alias-button-ghost-active-border":{"light":"#111111","dark":"#F5F1E8"},"--dsw-alias-button-ghost-active-fill":{"light":"#E3DCCE","dark":"#1C2436"},"--dsw-alias-button-ghost-active-hover":{"light":"#D9D1C0","dark":"#242E46"},"--dsw-alias-button-info-fill":{"light":"#4176E6","dark":"#6B9BFF"},"--dsw-alias-button-info-hover":{"light":"#2F5FD9","dark":"#5B8DF0"},"--dsw-alias-button-primary-dimmed":{"light":"#DCE6FF","dark":"#1A2B56"},"--dsw-alias-button-primary-fill":{"light":"#2340A8","dark":"#2A54D0"},"--dsw-alias-button-primary-hover":{"light":"#2F5FD9","dark":"#5B8DF0"},"--dsw-alias-button-tool-bar-fill-invisible":{"light":"rgba(26, 26, 26, 0.4)","dark":"rgba(255, 255, 255, 0.2)"},"--dsw-alias-button-tool-bar-fill":{"light":"rgba(26, 26, 26, 0.55)","dark":"rgba(255, 255, 255, 0.2)"},"--dsw-alias-button-tool-bar-hover":{"light":"rgba(26, 26, 26, 0.65)","dark":"rgba(255, 255, 255, 0.3)"},"--dsw-alias-interactive-bg-active":{"light":"rgba(26, 26, 26, 0.12)","dark":"rgba(255, 255, 255, 0.14)"},"--dsw-alias-interactive-bg-hover-accent":{"light":"rgba(65, 118, 230, 0.14)","dark":"rgba(107, 155, 255, 0.2)"},"--dsw-alias-interactive-bg-hover-danger":{"light":"rgba(220, 38, 38, 0.08)","dark":"rgba(248, 113, 113, 0.15)"},"--dsw-alias-interactive-bg-hover-solid":{"light":"#E3DCCE","dark":"#1C2436"},"--dsw-alias-interactive-bg-hover":{"light":"rgba(26, 26, 26, 0.06)","dark":"rgba(255, 255, 255, 0.08)"},"--dsw-alias-label-caption":{"light":"#6F6A5E","dark":"#8A857A"},"--dsw-alias-label-dimmed":{"light":"#A39C8D","dark":"#6B6B6B"},"--dsw-alias-label-primary-bluish":{"light":"#1D4ED8","dark":"#93B4FF"},"--dsw-alias-label-primary-dimmed":{"light":"#2A2A2A","dark":"#C9C4BA"},"--dsw-alias-label-primary-foreground":{"light":"#FFFFFF","dark":"#FFFFFF"},"--dsw-alias-label-primary-inverted":{"light":"#FFFFFF","dark":"#111111"},"--dsw-alias-label-primary":{"light":"#111111","dark":"#F5F1E8"},"--dsw-alias-label-secondary":{"light":"#3F3B33","dark":"#C9C4BA"},"--dsw-alias-label-tertiary":{"light":"#6F6A5E","dark":"#9A958A"},"--dsw-alias-markdown-citation":{"light":"#DFE5F0","dark":"#1E293E"},"--dsw-alias-markdown-code-block-banner":{"light":"#E9EDF4","dark":"#0F1524"},"--dsw-alias-markdown-code-block":{"light":"#E9EDF4","dark":"#101728"},"--dsw-alias-markdown-code-segment-selected":{"light":"#F5F8FD","dark":"#1C2436"},"--dsw-alias-markdown-code-segment-unselected":{"light":"#DFE5F0","dark":"#171E2E"},"--dsw-alias-markdown-inline-code":{"light":"#DFE5F0","dark":"#1E293E"},"--dsw-alias-markdown-placeholder":{"light":"#E9EDF4","dark":"#151D30"},"--dsw-alias-markdown-tag":{"light":"#DFE5F0","dark":"#1E293E"},"--dsw-alias-scrollbar-bg-l1":{"light":"#B5AE9F","dark":"#4A4A4A"},"--dsw-alias-scrollbar-bg-l2":{"light":"#A9A293","dark":"#555555"},"--dsw-alias-scrollbar-hover-l1":{"light":"#9A9384","dark":"#5F5F5F"},"--dsw-alias-scrollbar-hover-l2":{"light":"#8C8576","dark":"#6A6A6A"},"--dsw-alias-state-business-primary":{"light":"#4176E6","dark":"#6B9BFF"},"--dsw-alias-state-business-tertiary":{"light":"#DBEAFE","dark":"#1F2F52"},"--dsw-alias-state-error-primary":{"light":"#DC2626","dark":"#DC2626"},"--dsw-alias-state-error-secondary":{"light":"#EF4444","dark":"#EF4444"},"--dsw-alias-state-success-primary":{"light":"#16A34A","dark":"#4ADE80"},"--dsw-alias-state-success-secondary":{"light":"#22C55E","dark":"#22C55E"},"--dsw-alias-state-success-tertiary":{"light":"#DCFCE7","dark":"#14331F"},"--dsw-alias-state-warn-label":{"light":"#C2410C","dark":"#FB923C"},"--dsw-alias-state-warn-primary":{"light":"#F97316","dark":"#FB923C"},"--dsw-alias-state-warn-secondary":{"light":"#FB923C","dark":"#F97316"},"--dsw-alias-state-warn-tertiary":{"light":"#FFEDD5","dark":"#3A2412"},"--dsw-alias-toast-bg":{"light":"#111111","dark":"#2E2E2E"},"--dsw-alias-tooltip-bg":{"light":"#111111","dark":"#1C2436"},"--dsw-specific-bubble-highlight":{"light":"#C9D6F5","dark":"#27437F"},"--dsw-specific-bubble":{"light":"#D6E4FF","dark":"#1C3570"},"--dsw-specific-input-major":{"light":"#FDFBF6","dark":"#121826"},"--dsw-specific-login-input":{"light":"#EDE7DB","dark":"#0D111C"},"--dsw-specific-menu":{"light":"#FDFBF6","dark":"#1C2436"},"--dsw-specific-selector":{"light":"#EDE7DB","dark":"#171E2E"},"--dsw-specific-sidebar-fill":{"light":"#1E317A","dark":"#0D1630"},"--dsw-specific-sidebar-nav-item-active-accent":{"light":"#5E82D6","dark":"#6D8FDD"},"--dsw-specific-sidebar-nav-item-active":{"light":"#FFFFFF","dark":"#2A54D0"},"--dsw-specific-sidebar-nav-item-hover":{"light":"#283C8A","dark":"#15224A"},"--dsw-specific-tip":{"light":"#EDE7DB","dark":"#171E2E"}}},"newspaper":{"label":"做旧报纸","css":"/* Scheme B「做旧报纸」structure extras.\n *\n * Editorial serif type across the reading surfaces (code blocks keep their\n * monospace --ds-font-family-code), plus a masthead-style double rule on the\n * conversation header. The \"推荐\" badge is decoupled from the sidebar-accent\n * token: paper background + masthead-red text, readable in both themes.\n */\nbody {\n\tfont-family: Georgia, \"Times New Roman\", \"Songti SC\", \"SimSun\", serif !important;\n}\n[class*=\"_badge\"] {\n\tbackground: var(--dsw-specific-menu) !important;\n\tcolor: var(--dsw-alias-brand-primary) !important;\n}","tokens":{"--dsw-alias-bg-base":{"light":"#EAE0C7","dark":"#1A150E"},"--dsw-alias-bg-layer-1":{"light":"#F1E9D2","dark":"#201B14"},"--dsw-alias-bg-layer-2":{"light":"#F1E9D2","dark":"#242016"},"--dsw-alias-bg-layer-3":{"light":"#F1E9D2","dark":"#282318"},"--dsw-alias-bg-mask-1":{"light":"rgba(43, 36, 26, 0.4)","dark":"rgba(0, 0, 0, 0.6)"},"--dsw-alias-bg-mask-2":{"light":"rgba(43, 36, 26, 0.18)","dark":"rgba(0, 0, 0, 0.35)"},"--dsw-alias-bg-mask-3":{"light":"rgba(43, 36, 26, 0.5)","dark":"rgba(0, 0, 0, 0.55)"},"--dsw-alias-bg-mask-photo":{"light":"rgba(0, 0, 0, 0.88)","dark":"rgba(0, 0, 0, 0.88)"},"--dsw-alias-bg-mask-drop":{"light":"rgba(241, 233, 210, 0.85)","dark":"rgba(32, 27, 20, 0.85)"},"--dsw-alias-bg-module-platform":{"light":"#E7DCC0","dark":"#201B14"},"--dsw-alias-bg-multi-select":{"light":"#E0D5BA","dark":"#242016"},"--dsw-alias-bg-overlay":{"light":"#F1E9D2","dark":"#2A251A"},"--dsw-alias-bg-skeleton":{"light":"rgba(43, 36, 26, 0.08)","dark":"rgba(255, 255, 255, 0.07)"},"--dsw-alias-border-inverted2":{"light":"#3A3125","dark":"#8F8368"},"--dsw-alias-border-inverted":{"light":"#3A3125","dark":"#8F8368"},"--dsw-alias-border-l1":{"light":"rgba(58, 49, 37, 0.45)","dark":"rgba(143, 131, 104, 0.45)"},"--dsw-alias-border-l2-darkmode-thin":{"light":"#4A4033","dark":"#6E6350"},"--dsw-alias-border-l2":{"light":"#4A4033","dark":"#7A6F58"},"--dsw-alias-border-l3":{"light":"#3A3125","dark":"#8F8368"},"--dsw-alias-border-l4":{"light":"#3A3125","dark":"#8F8368"},"--dsw-alias-brand-primary-invert":{"light":"#F1E9D2","dark":"#F1E9D2"},"--dsw-alias-brand-primary-new-colorprimary-new-color":{"light":"#8C3B2E","dark":"#A34A35"},"--dsw-alias-brand-primary":{"light":"#8C3B2E","dark":"#A34A35"},"--dsw-alias-brand-text":{"light":"#8C3B2E","dark":"#A34A35"},"--dsw-alias-button-contrast-fill":{"light":"#2B241A","dark":"#E8DDBF"},"--dsw-alias-button-elevated-fill":{"light":"#F1E9D2","dark":"#242016"},"--dsw-alias-button-floating-fill":{"light":"#F1E9D2","dark":"#282318"},"--dsw-alias-button-floating-hover":{"light":"#E7DCC0","dark":"#2E2819"},"--dsw-alias-button-ghost-active-border":{"light":"#2B241A","dark":"#E8DDBF"},"--dsw-alias-button-ghost-active-fill":{"light":"#E0D5BA","dark":"#2A251A"},"--dsw-alias-button-ghost-active-hover":{"light":"#D6C9A8","dark":"#332C1B"},"--dsw-alias-button-info-fill":{"light":"#8C3B2E","dark":"#C15A40"},"--dsw-alias-button-info-hover":{"light":"#75301F","dark":"#D06A4D"},"--dsw-alias-button-primary-dimmed":{"light":"#EFE4C6","dark":"#2A2416"},"--dsw-alias-button-primary-fill":{"light":"#8C3B2E","dark":"#A34A35"},"--dsw-alias-button-primary-hover":{"light":"#75301F","dark":"#C15A40"},"--dsw-alias-button-tool-bar-fill-invisible":{"light":"rgba(43, 36, 26, 0.4)","dark":"rgba(232, 221, 191, 0.2)"},"--dsw-alias-button-tool-bar-fill":{"light":"rgba(43, 36, 26, 0.55)","dark":"rgba(232, 221, 191, 0.25)"},"--dsw-alias-button-tool-bar-hover":{"light":"rgba(43, 36, 26, 0.65)","dark":"rgba(232, 221, 191, 0.35)"},"--dsw-alias-interactive-bg-active":{"light":"rgba(43, 36, 26, 0.12)","dark":"rgba(232, 221, 191, 0.14)"},"--dsw-alias-interactive-bg-hover-accent":{"light":"rgba(140, 59, 46, 0.12)","dark":"rgba(193, 90, 64, 0.2)"},"--dsw-alias-interactive-bg-hover-danger":{"light":"rgba(161, 45, 31, 0.08)","dark":"rgba(224, 138, 112, 0.15)"},"--dsw-alias-interactive-bg-hover-solid":{"light":"#E0D5BA","dark":"#2A251A"},"--dsw-alias-interactive-bg-hover":{"light":"rgba(43, 36, 26, 0.06)","dark":"rgba(232, 221, 191, 0.08)"},"--dsw-alias-label-caption":{"light":"#7A6F58","dark":"#8F8368"},"--dsw-alias-label-dimmed":{"light":"#A89C7F","dark":"#6E6350"},"--dsw-alias-label-primary-bluish":{"light":"#3E5C8A","dark":"#9DB4D8"},"--dsw-alias-label-primary-dimmed":{"light":"#4A4033","dark":"#C9BCA0"},"--dsw-alias-label-primary-foreground":{"light":"#F1E9D2","dark":"#F1E9D2"},"--dsw-alias-label-primary-inverted":{"light":"#F1E9D2","dark":"#E8DDBF"},"--dsw-alias-label-primary":{"light":"#2B241A","dark":"#E8DDBF"},"--dsw-alias-label-secondary":{"light":"#5C5141","dark":"#A5977A"},"--dsw-alias-label-tertiary":{"light":"#7A6F58","dark":"#8F8368"},"--dsw-alias-markdown-citation":{"light":"#E0D5BA","dark":"#262016"},"--dsw-alias-markdown-code-block-banner":{"light":"#E0D5BA","dark":"#221C12"},"--dsw-alias-markdown-code-block":{"light":"#E0D5BA","dark":"#241D12"},"--dsw-alias-markdown-code-segment-selected":{"light":"#F1E9D2","dark":"#2A251A"},"--dsw-alias-markdown-code-segment-unselected":{"light":"#E0D5BA","dark":"#262016"},"--dsw-alias-markdown-inline-code":{"light":"#E0D5BA","dark":"#282318"},"--dsw-alias-markdown-placeholder":{"light":"#E7DCC0","dark":"#262016"},"--dsw-alias-markdown-tag":{"light":"#E0D5BA","dark":"#282318"},"--dsw-alias-scrollbar-bg-l1":{"light":"#B5A98C","dark":"#4A4436"},"--dsw-alias-scrollbar-bg-l2":{"light":"#A99C7F","dark":"#544D3D"},"--dsw-alias-scrollbar-hover-l1":{"light":"#9A8D70","dark":"#5E5645"},"--dsw-alias-scrollbar-hover-l2":{"light":"#8C7F64","dark":"#685F4C"},"--dsw-alias-state-business-primary":{"light":"#3E5C8A","dark":"#9DB4D8"},"--dsw-alias-state-business-tertiary":{"light":"#DCE4F0","dark":"#22304A"},"--dsw-alias-state-error-primary":{"light":"#A12D1F","dark":"#C96A50"},"--dsw-alias-state-error-secondary":{"light":"#C73E2D","dark":"#E08A70"},"--dsw-alias-state-success-primary":{"light":"#3E7D45","dark":"#6FBF77"},"--dsw-alias-state-success-secondary":{"light":"#52A05C","dark":"#52A05C"},"--dsw-alias-state-success-tertiary":{"light":"#E3EFE0","dark":"#1E331C"},"--dsw-alias-state-warn-label":{"light":"#8A5210","dark":"#E8A23D"},"--dsw-alias-state-warn-primary":{"light":"#B4550D","dark":"#E8A23D"},"--dsw-alias-state-warn-secondary":{"light":"#D97A24","dark":"#F0A63D"},"--dsw-alias-state-warn-tertiary":{"light":"#F5E6C8","dark":"#3A2A12"},"--dsw-alias-toast-bg":{"light":"#2B241A","dark":"#2A251A"},"--dsw-alias-tooltip-bg":{"light":"#2B241A","dark":"#2E2819"},"--dsw-specific-bubble-highlight":{"light":"#B9C6DA","dark":"#2C3550"},"--dsw-specific-bubble":{"light":"#CFD9E6","dark":"#262E40"},"--dsw-specific-input-major":{"light":"#F1E9D2","dark":"#201B14"},"--dsw-specific-login-input":{"light":"#E7DCC0","dark":"#1A150E"},"--dsw-specific-menu":{"light":"#F1E9D2","dark":"#282318"},"--dsw-specific-selector":{"light":"#E7DCC0","dark":"#242016"},"--dsw-specific-sidebar-fill":{"light":"#E7DCC0","dark":"#1C1711"},"--dsw-specific-sidebar-nav-item-active-accent":{"light":"#8C3B2E","dark":"#A34A35"},"--dsw-specific-sidebar-nav-item-active":{"light":"#D9C8A0","dark":"#E8DDBF"},"--dsw-specific-sidebar-nav-item-hover":{"light":"#EFE6CF","dark":"#262012"},"--dsw-specific-tip":{"light":"#E7DCC0","dark":"#262016"}}}};

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
		const tagId = "dsh-neo-skin" + "/ToggleRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-neo-skin";
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
