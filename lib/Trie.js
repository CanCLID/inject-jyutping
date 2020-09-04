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
