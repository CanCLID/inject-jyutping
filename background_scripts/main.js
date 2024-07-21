import Browser from 'webextension-polyfill';
import MessageManager from '../lib/MessageManager.js';
import { getJyutpingList } from 'to-jyutping';

/* Communicate with content script */

Browser.runtime.onConnect.addListener(port => {
    /** @type { MessageManager<{ convert(msg: string): [string, string | null][] }> } */
    const mm = new MessageManager(port);
    mm.registerHandler('convert', getJyutpingList);
});

/* Context Menu */

Browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'do-inject-jyutping') {
        Browser.tabs.sendMessage(tab?.id || 0, { name: 'do-inject-jyutping' });
    }
});

Browser.contextMenus.create({
    id: 'do-inject-jyutping',
    title: Browser.i18n.getMessage('contextMenuItemDoInjectJyutping'),
    contexts: ['page'],
});
