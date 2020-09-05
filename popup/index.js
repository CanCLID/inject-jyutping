/* Initialize state */
(async () => {
    document.documentElement.lang = browser.i18n.getMessage('langCode');
    document.getElementById('checkboxText').innerText = browser.i18n.getMessage('popupCheckboxText');
    document.getElementById('extensionEnabled').checked = ((await browser.storage.local.get('enabled'))['enabled'] !== false) ? true : false;
})();

/* Handle state change */
document.getElementById('extensionEnabled').addEventListener('click', () => {
    browser.storage.local.set({enabled: document.getElementById('extensionEnabled').checked});
});
