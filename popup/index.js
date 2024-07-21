import Browser from 'webextension-polyfill';

const i = Browser.i18n.getMessage;

const nativeCheckboxText = /** @type {HTMLDivElement} */ (document.getElementById('nativeCheckboxText'));
const extensionEnabled = /** @type {HTMLInputElement} */ (document.getElementById('extensionEnabled'));
const refreshPromptText = /** @type {HTMLParagraphElement} */ (document.getElementById('refreshPromptText'));

/* Initialize state */
(async () => {
    document.documentElement.lang = i('langCode');
    nativeCheckboxText.textContent = i('popupCheckboxText');
    extensionEnabled.checked = (await Browser.storage.local.get('enabled'))['enabled'] !== false;
})();

/* Handle state change */
extensionEnabled.addEventListener('click', () => {
    Browser.storage.local.set({ enabled: extensionEnabled.checked });
    refreshPromptText.innerHTML = i('refreshPromptText');
});
