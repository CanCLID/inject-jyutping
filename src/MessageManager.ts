import type { Runtime } from 'webextension-polyfill';

const getUniqueId = (
    id => () =>
        id++
)(0);

interface Message {
    id: number;
    msg: any;
}

function isMessage(obj: any): obj is Message {
    return obj && typeof obj === 'object' && typeof obj.id === 'number' && 'msg' in obj;
}

/**
 * A class to manage messages between background script and content script.
 * @example
 * In background script:
 *
 * ```js
 * browser.runtime.onConnect.addListener(port => {
 *     const mm = new MessageManager(port);
 *     mm.registerHandler('double', s => s + s);
 *     mm.registerHandler('triple', s => s + s + s);
 * });
 * ```
 *
 * In content script:
 *
 * ```js
 * const port = browser.runtime.connect();
 * const mm = new MessageManager(port);
 * mm.sendMessage('double', '你好').then(alert); // Will alert 你好你好
 * mm.sendMessage('triple', '你好').then(alert); // Will alert 你好你好你好
 * ```
 */
export default class MessageManager<T extends Record<string, (msg: any) => any>> {
    constructor(private port: Runtime.Port) {}

    sendMessage<K extends keyof T>(handlerName: K, msg: Parameters<T[K]>[0]): Promise<ReturnType<T[K]>> {
        const { port } = this;
        const id = getUniqueId();
        return new Promise(resolve => {
            port.onMessage.addListener(function f(response) {
                if (isMessage(response) && response.id === id) {
                    port.onMessage.removeListener(f);
                    resolve(response.msg);
                }
            });
            port.postMessage({ msg, id, name: handlerName });
        });
    }

    registerHandler<K extends keyof T>(handlerName: K, f: T[K]) {
        const { port } = this;
        port.onMessage.addListener(msg => {
            if (isMessage(msg) && 'name' in msg && msg.name === handlerName) {
                const res = f(msg.msg);
                port.postMessage({ msg: res, id: msg.id });
            }
        });
    }
}
