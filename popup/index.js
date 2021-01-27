/* Initialize state */
(async () => {
    document.documentElement.lang = browser.i18n.getMessage('langCode');
    document.getElementById('checkboxText').innerHTML = browser.i18n.getMessage('popupCheckboxText');
    document.getElementById('extensionEnabled').checked = (await browser.storage.local.get('enabled'))['enabled'] !== false;
})();

/* Handle state change */
document.getElementById('extensionEnabled').addEventListener('click', () => {
    browser.storage.local.set({enabled: document.getElementById('extensionEnabled').checked});
    document.getElementById('refreshPromptText').innerHTML = browser.i18n.getMessage('refreshPromptText');
});
