import browser from 'webextension-polyfill';

import './index.css';

const i = browser.i18n.getMessage;

const autoInjectNativeText = document.getElementById('auto-inject-native-text') as HTMLDivElement;
const autoInjectCheckbox = document.getElementById('auto-inject-checkbox') as HTMLInputElement;
const contourDisplayNativeText = document.getElementById('contour-display-native-text') as HTMLDivElement;
const contourDisplayCheckbox = document.getElementById('contour-display-checkbox') as HTMLInputElement;
const refreshPromptText = document.getElementById('refresh-prompt-text') as HTMLParagraphElement;

/* Initialize state */
(async () => {
    document.documentElement.lang = i('langCode');
    autoInjectNativeText.textContent = i('popupCheckboxText');
    contourDisplayNativeText.textContent = i('popupContourCheckboxText');

    const storage = await browser.storage.local.get(['enabled', 'contourEnabled']);
    autoInjectCheckbox.checked = storage['enabled'] !== false;
    contourDisplayCheckbox.checked = storage['contourEnabled'] === true;
})();

/* Handle state change */
autoInjectCheckbox.addEventListener('click', () => {
    browser.storage.local.set({ enabled: autoInjectCheckbox.checked });
    refreshPromptText.innerHTML = i('refreshPromptText');
});

/* Contour handle state change */
contourDisplayCheckbox.addEventListener('click', () => {
    browser.storage.local.set({ contourEnabled: contourDisplayCheckbox.checked });
    refreshPromptText.innerHTML = i('refreshPromptText');
});
