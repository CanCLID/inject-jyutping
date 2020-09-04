/**
 * Check if a string contains Chinese characters.
 * @param {String} s The string to be checked
 * @return {Boolean} If the string contains at least one Chinese character,
 * returns true. Otherwise returns false.
 */
function hasHanChar(s) {
    const r = /[〆〇一-鿿㐀-䶿𠀀-𪛟𪜀-𫜿𫝀-𫠟𫠠-𬺯𬺰-𮯯𰀀-𱍏]/u;
    return Boolean(s.match(r));
}

/**
 * Determine whether an HTML element should be handled by inject-jyutping
 * by checking its lang tag.
 * @param {String} lang The lang tag of an HTML element
 * @return {Boolean} If the lang tag is reasonable to be handled, returns
 * true. Otherwise returns false.
 */
function isTargetLang(lang) {
    return !lang.startsWith('ja')
        && !lang.startsWith('ko')
        && !lang.startsWith('vi');
}

/**
 * Create a ruby element with the character and the pronunciation.
 * @param {String} ch The character in a ruby element
 * @param {String} pronunciation The pronunciation in a ruby element
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

async function recursiveConvert(currentNode, langMatched) {
    // ignore certain HTML elements
    if (   currentNode.tagName === 'RUBY'
        || currentNode.tagName === 'OPTION'
        || currentNode.tagName === 'NOSCRIPT'
        || currentNode.tagName === 'SCRIPT'
        || currentNode.tagName === 'STYLE'
    ) {
        return;
    }

    if (currentNode.lang && currentNode.lang.length) {
        langMatched = isTargetLang(currentNode.lang);
    }

    const ret = [];

    for (const node of currentNode.childNodes) {
        if (node.nodeType == Node.TEXT_NODE) {
            if (!langMatched) {
                break;
            }

            const s = node.nodeValue;

            if (hasHanChar(s)) {
                const nodesFragment = document.createDocumentFragment();
                for (const [k, v] of await convert__(s)) {
                    if (v === null) {
                        nodesFragment.appendChild(document.createTextNode(k));
                    } else {
                        nodesFragment.appendChild(makeRuby(k, v));
                    }
                }
                ret.push([nodesFragment, node]);
            }
        } else {
            await recursiveConvert(node, langMatched);
        }
    }

    for (const [nodesFragment, node] of ret) {
        currentNode.replaceChild(nodesFragment, node);
    }
}

async function convert_() {
    const root = document.documentElement;
    await recursiveConvert(document.body, isTargetLang(document.body.lang || root.lang));
}

// ================

async function convert__(s) {
    return await browser.runtime.sendMessage(s);
}

(async () => await convert_())();

browser.runtime.onMessage.addListener(message => {
    if (message.type === 'init') {
        convert_();
    }
});
