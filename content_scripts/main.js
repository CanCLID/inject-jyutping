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

const port = browser.runtime.connect();
const mm = new MessageManager(port);

async function recursiveConvert(currentNode, langMatched) {
    // Ignore certain HTML elements
    if (['RUBY', 'OPTION', 'TEXTAREA', 'SCRIPT', 'STYLE'].includes(currentNode.tagName)) {
        return;
    }

    if (currentNode.lang && currentNode.lang.length) {
        langMatched = isTargetLang(currentNode.lang);
    }

    const substitutionArray = [];

    for (const node of currentNode.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!langMatched || !hasHanChar(node.nodeValue)) {
                continue;
            }

            const newNodes = document.createDocumentFragment();
            const conversionResults = await mm.sendMessage('convert', node.nodeValue);  // From background script
            for (const [k, v] of conversionResults) {
                newNodes.appendChild(v === null ? document.createTextNode(k) : makeRuby(k, v));
            }
            substitutionArray.push([newNodes, node]);
        } else {
            await recursiveConvert(node, langMatched);
        }
    }

    for (const [newNodes, node] of substitutionArray) {
        currentNode.replaceChild(newNodes, node);
    }
}

async function startConvert() {
    const lang = document.body.lang || document.documentElement.lang || 'en';
    await recursiveConvert(document.body, isTargetLang(lang));
}

browser.runtime.onMessage.addListener(msg => {
    if (msg.name === 'do-inject-jyutping') {
        startConvert();
    }
});

startConvert();
