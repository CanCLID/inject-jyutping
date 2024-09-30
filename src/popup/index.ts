import browser from 'webextension-polyfill';

import './index.css';

const i = browser.i18n.getMessage;

const autoInjectNativeText = document.getElementById('auto-inject-native-text') as HTMLDivElement;
const autoInjectCheckbox = document.getElementById('auto-inject-checkbox') as HTMLInputElement;
const refreshPromptText = document.getElementById('refresh-prompt-text') as HTMLParagraphElement;

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
