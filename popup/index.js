import '/node_modules/webextension-polyfill/dist/browser-polyfill.min.js';

const i = browser.i18n.getMessage;

const autoInjectNativeText = /** @type {HTMLDivElement} */ (document.getElementById('auto-inject-native-text'));
const autoInjectCheckbox = /** @type {HTMLInputElement} */ (document.getElementById('auto-inject-checkbox'));
const refreshPromptText = /** @type {HTMLParagraphElement} */ (document.getElementById('refresh-prompt-text'));

/* Initialize state */
(async () => {
    document.documentElement.lang = i('langCode');
    autoInjectNativeText.textContent = i('popupCheckboxText');
    autoInjectCheckbox.checked = (await browser.storage.local.get('enabled'))['enabled'] !== false;
})();

/* Handle state change */
autoInjectCheckbox.addEventListener('click', () => {
    browser.storage.local.set({ enabled: autoInjectCheckbox.checked });
    refreshPromptText.innerHTML = i('refreshPromptText');
});
