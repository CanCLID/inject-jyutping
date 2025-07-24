import browser from 'webextension-polyfill';

import MessageManager from '../MessageManager';
import './index.css';

/**
 * Check if a string contains Chinese characters.
 * @param s The string to be checked
 * @return Whether the string contains at least one Chinese character.
 */
function hasHanChar(s: string): boolean {
    return /[\p{Unified_Ideograph}\u3006\u3007]/u.test(s);
}

/**
 * Determine whether an HTML element should be handled by inject-jyutping
 * by checking its lang tag.
 * @param lang The lang tag of an HTML element
 * @return If the lang tag is reasonable to be handled, returns
 * true. Otherwise returns false.
 */
function isTargetLang(locale: string): boolean {
    const [lang] = locale.split('-', 1);
    return lang !== 'ja' && lang !== 'ko' && lang !== 'vi';
}

/**
 * Create a ruby element with the character and the pronunciation.
 * @param ch The character in a ruby element
 * @param pronunciation The pronunciation in a ruby element
 * @return The ruby element
 */
function makeRuby(ch: string, pronunciation: string): Element {
    const ruby = document.createElement('ruby');
    ruby.classList.add('inject-jyutping');
    ruby.textContent = ch;

    const rt = document.createElement('rt');
    rt.lang = 'yue-Latn';
    rt.dataset['content'] = pronunciation;
    ruby.appendChild(rt);

    return ruby;
}

const port = browser.runtime.connect();
const mm: MessageManager<{ convert(msg: string): [string, string | null][] }> = new MessageManager(port);
const mo = new MutationObserver(changes => {
    for (const change of changes) {
        for (const node of change.addedNodes) {
            const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
            forEachText(node, convertText, ((element as Element)?.closest?.('[lang]') as HTMLElement)?.lang);
        }
    }
});

function forEachText(node: Node, callback: (node: Node) => void, lang = '') {
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
            forEachText(child, callback, (node as HTMLElement).lang);
        }
    }
}

const toneReplacements: Record<string, string> = {
  '1': 'ˉ¹',
  '2': '´²',
  '3': '-³',
  '4': 'ˎ₄',
  '5': 'ˏ₅',
  '6': 'ˍ₆'
};

const regex = /[1-6]/g;

async function convertText(node: Node) {
    const conversionResults = await mm.sendMessage('convert', node.nodeValue || '');
    const newNodes = document.createDocumentFragment();
    for (const [k, v] of conversionResults) {
        if (v === null) {
            newNodes.appendChild(document.createTextNode(k));
        } else {
            const processedV = contourEnabled
                ? v.replace(regex, digit => toneReplacements[digit])
                : v;
            newNodes.appendChild(makeRuby(k, processedV));
        }
    }
    if (node.isConnected) {
        node.parentNode?.replaceChild(newNodes, node);
    }
}

function once(fn: () => void) {
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
    if (typeof msg === 'object' && msg && 'name' in msg && msg.name === 'do-inject-jyutping') {
        init();
    }
    return undefined;
});

let contourEnabled: boolean = false;

async function autoInit() {
    const storage = await browser.storage.local.get(['enabled', 'contourEnabled']);
    contourEnabled = storage['contourEnabled'] === true;
    if (storage['enabled'] !== false) {
        init();
    }
}

autoInit();
