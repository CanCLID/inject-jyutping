class Trie {
    constructor() {
        /**
         * Trie 的每個節點為一個 Map 物件。
         * key 為 code point，value 為子節點（也是一個 Map）。
         * 如果 Map 物件有 __trie_val 屬性，則該屬性為值字串，代表替換的字詞。
         */
        this.t = new Map();
    }

    /**
     * 將一組資料加入字典樹
     * @param {String} k 鍵字串
     * @param {String} v 值字串，代表替換的字詞
     */
    addWord(k, v) {
        let t = this.t;
        for (const c of k) {
            const cp = c.codePointAt(0);
            if (!t.has(cp)) {
                t.set(cp, new Map())
            }
            t = t.get(cp);
        }
        t.__trie_val = v;
    }

    longestPrefix(s) {
        const totalBreadcrumbs = [];
        let currentBreadcrumbs = [], currentTarget, t = this.t;
        for (const c of s) {
            const cp = c.codePointAt(0);
            if (!t.has(cp)) {
                break;
            }
            currentBreadcrumbs.push(c);
            t = t.get(cp);
            if (typeof t.__trie_val !== 'undefined') {
                currentTarget = t.__trie_val;
                totalBreadcrumbs.push(...currentBreadcrumbs);
                currentBreadcrumbs = [];
            }
        }
        if (totalBreadcrumbs.length) {
            return [totalBreadcrumbs, currentTarget.split(' ')];  // chars, romanization of each char
        }
    }
}

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
            s = s.slice(cs.reduce((acc, x) => acc + x.length, 0));  // total length of strings in array cs
        } else {
            const k = s[Symbol.iterator]().next().value;  // Unicode-aware version of s[0]
            res.push([k, null]);
            s = s.slice(k.length);
        }
    }
    return res;
}

const t = new Trie();

(function loadDict() {
    fetch(browser.runtime.getURL('background_scripts/dictionary.json.txt'))
    .then(x => x.json())
    .then(d => {
        for (const [k, v] of d) {
            t.addWord(k, v);
        }
    })
    .catch(err => console.error(err));
})();

browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
    const result = convert(t, data);
    sendResponse(result);
});

browser.contextMenus.create({
    id: "do-inject-jyutping",
    title: browser.i18n.getMessage("contextMenuItemDoInjectJyutping"),
    contexts: ["page"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "do-inject-jyutping") {
        browser.tabs.sendMessage(tab.id, {type: 'init'});
    }
});
