import '/node_modules/webextension-polyfill/dist/browser-polyfill.min.js';
import '/node_modules/to-jyutping/dist/index.js';
import '/lib/MessageManager.js';

/* Communicate with content script */

browser.runtime.onConnect.addListener(port => {
    /** @type { MessageManager<{ convert(msg: string): [string, string | null][] }> } */
    const mm = new MessageManager(port);
    mm.registerHandler('convert', ToJyutping.getJyutpingList);
});

/* Context Menu */

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'do-inject-jyutping') {
        browser.tabs.sendMessage(tab?.id || 0, { name: 'do-inject-jyutping' });
    }
});

browser.contextMenus.create({
    id: 'do-inject-jyutping',
    title: browser.i18n.getMessage('contextMenuItemDoInjectJyutping'),
    contexts: ['page'],
});
