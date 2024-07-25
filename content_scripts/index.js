/**
 * Check if a string contains Chinese characters.
 * @param {string} s The string to be checked
 * @return {boolean} Whether the string contains at least one Chinese character.
 */
function hasHanChar(s) {
    return /[\p{Unified_Ideograph}\u3006\u3007]/u.test(s);
}

/**
 * Determine whether an HTML element should be handled by inject-jyutping
 * by checking its lang tag.
 * @param {string} lang The lang tag of an HTML element
 * @return {boolean} If the lang tag is reasonable to be handled, returns
 * true. Otherwise returns false.
 */
function isTargetLang(lang) {
    return !lang.startsWith('ja') && !lang.startsWith('ko') && !lang.startsWith('vi');
}

/**
 * Create a ruby element with the character and the pronunciation.
 * @param {string} ch The character in a ruby element
 * @param {string} pronunciation The pronunciation in a ruby element
 * @return {Element} The ruby element
 */
function makeRuby(ch, pronunciation) {
    const ruby = document.createElement('ruby');
    ruby.classList.add('inject-jyutping');
    ruby.innerText = ch;

    const rp_left = document.createElement('rp');
    rp_left.appendChild(document.createTextNode('('));
    ruby.appendChild(rp_left);

    const rt = document.createElement('rt');
    rt.lang = 'yue-Latn';
    rt.innerText = pronunciation;
    ruby.appendChild(rt);

    const rp_right = document.createElement('rp');
    rp_right.appendChild(document.createTextNode(')'));
    ruby.appendChild(rp_right);

    return ruby;
}

const port = browser.runtime.connect();
/** @type { MessageManager<{ convert(msg: string): [string, string | null][] }> } */
const mm = new MessageManager(port);
const mo = new MutationObserver(changes => {
    for (const change of changes) {
        for (const node of change.addedNodes) {
            const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
            forEachText(node, convertText, /** @type {HTMLElement} */ (/** @type {Element} */ (element)?.closest?.('[lang]'))?.lang);
        }
    }
});

/**
 * @param {Node} node
 * @param {(node: Node) => void} callback
 * @param {string} [lang = '']
 */
function forEachText(node, callback, lang = '') {
    if (!isTargetLang(lang)) {
        return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
        if (hasHanChar(node.nodeValue || '')) {
            callback(node);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Ignore certain HTML elements
        if (['RUBY', 'OPTION', 'TEXTAREA', 'SCRIPT', 'STYLE'].includes(node.nodeName)) {
            return;
        }
        for (const child of node.childNodes) {
            forEachText(child, callback, /** @type {HTMLElement} */ (node).lang);
        }
    }
}

/**
 * @param {Node} node
 */
async function convertText(node) {
    const conversionResults = await mm.sendMessage('convert', node.nodeValue || '');
    const newNodes = document.createDocumentFragment();
    for (const [k, v] of conversionResults) {
        newNodes.appendChild(v === null ? document.createTextNode(k) : makeRuby(k, v));
    }
    if (node.isConnected && node.nodeValue !== newNodes.textContent) {
        node.parentNode?.replaceChild(newNodes, node);
    }
}

/**
 * @param {() => void} fn
 */
function once(fn) {
    let called = false;
    return () => {
        if (called) return;
        called = true;
        fn();
    };
}

const init = once(() => {
    forEachText(document.body, convertText, document.body.lang || document.documentElement.lang);
    // Listen for new added nodes, or content changes of nodes
    mo.observe(document.body, {
        characterData: true,
        childList: true,
        subtree: true,
    });
});

browser.runtime.onMessage.addListener(msg => {
    if (msg.name === 'do-inject-jyutping') {
        init();
    }
});

async function autoInit() {
    if ((await browser.storage.local.get('enabled'))['enabled'] !== false) {
        init();
    }
}

autoInit();
