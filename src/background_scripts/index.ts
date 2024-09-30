import browser from 'webextension-polyfill';
import { getJyutpingList } from 'to-jyutping';

import MessageManager from '../MessageManager';

/* Communicate with content script */

browser.runtime.onConnect.addListener(port => {
    const mm: MessageManager<{ convert(msg: string): [string, string | null][] }> = new MessageManager(port);
    mm.registerHandler('convert', getJyutpingList);
});

/* Context Menu */

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'do-inject-jyutping') {
        browser.tabs.sendMessage(tab?.id || 0, { name: 'do-inject-jyutping' });
    }
});

(async () => {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
        id: 'do-inject-jyutping',
        title: browser.i18n.getMessage('contextMenuItemDoInjectJyutping'),
        contexts: ['page'],
    });
})();
