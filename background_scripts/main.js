/**
 * 轉換一個字串，取得字串中每個字及其讀音。
 * @param {Trie} t Trie 樹
 * @param {String} s 鍵字串
 * @return {Array} 二維陣列。每個元素為一個字及其讀音。
 */
function convert(t, s) {
    const res = [];
    while (s.length) {
        const prefix = t.longestPrefix(s);
        if (typeof prefix !== 'undefined') {
            const [cs, rs] = prefix;
            const zipped_cs_rs = cs.map((c, i) => [c, rs[i]]);
            res.push(...zipped_cs_rs);
            s = s.slice(cs.reduce((acc, x) => acc + x.length, 0)); // total length of strings in array cs
        } else {
            const k = s[Symbol.iterator]().next().value; // Unicode-aware version of s[0]
            res.push([k, null]);
            s = s.slice(k.length);
        }
    }
    return res;
}

(async () => {
    /* Dictionary */

    const t = new Trie();

    for (const [k, v] of await (await fetch(browser.runtime.getURL('background_scripts/dictionary.json.txt'))).json()) {
        t.addWord(k, v);
    }

    /* Communicate with content script */

    browser.runtime.onConnect.addListener(port => {
        const mm = new MessageManager(port);
        mm.registerHandler('convert', s => convert(t, s));
    });

    /* Context Menu */

    browser.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'do-inject-jyutping') {
            browser.tabs.sendMessage(tab.id, { name: 'do-inject-jyutping' });
        }
    });

    browser.contextMenus.create({
        id: 'do-inject-jyutping',
        title: browser.i18n.getMessage('contextMenuItemDoInjectJyutping'),
        contexts: ['page'],
    });
})();
