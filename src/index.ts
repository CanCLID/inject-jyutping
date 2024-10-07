import MessageManager from './MessageManager';

function hasHanChar(s: string): boolean {
    return /[\p{Unified_Ideograph}\u3006\u3007]/u.test(s);
}

function isTargetLang(locale: string): boolean {
    const [lang] = locale.split('-', 1);
    return lang !== 'ja' && lang !== 'ko' && lang !== 'vi';
}

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

declare const workerSource: string;
const worker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' })));
const mm = new MessageManager<{ convert(msg: string): [string, string | null][] }>(worker);
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

async function convertText(node: Node) {
    const conversionResults = await mm.sendMessage('convert', node.nodeValue || '');
    const newNodes = document.createDocumentFragment();
    for (const [k, v] of conversionResults) {
        newNodes.appendChild(v === null ? document.createTextNode(k) : makeRuby(k, v));
    }
    if (node.isConnected) {
        node.parentNode?.replaceChild(newNodes, node);
    }
}

forEachText(document.body, convertText, document.body.lang || document.documentElement.lang);
mo.observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true,
});
