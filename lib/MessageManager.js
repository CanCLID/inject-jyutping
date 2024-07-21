/** @import { Runtime } from 'webextension-polyfill'; */

const getUniqueId = (
    id => () =>
        id++
)(0);

/**
 * A class to manage messages between background script and content script.
 * @template {Record<string, (msg: any) => any>} T
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
class MessageManager {
    /**
     * @param {Runtime.Port} port
     */
    constructor(port) {
        /**
         * @type {Runtime.Port}
         * @private
         */
        this.port = port;
    }

    /**
     * @template {keyof T} K
     * @param {K} handlerName
     * @param {Parameters<T[K]>[0]} msg
     * @returns {Promise<ReturnType<T[K]>>}
     */
    sendMessage(handlerName, msg) {
        const { port } = this;
        const id = getUniqueId();
        return new Promise(resolve => {
            port.onMessage.addListener(function f(response) {
                if (response.id === id) {
                    port.onMessage.removeListener(f);
                    resolve(response.msg);
                }
            });
            port.postMessage({ msg, id, name: handlerName });
        });
    }

    /**
     * @template {keyof T} K
     * @param {K} handlerName
     * @param {T[K]} f
     */
    registerHandler(handlerName, f) {
        const { port } = this;
        port.onMessage.addListener(msg => {
            if (msg.name === handlerName) {
                const res = f(msg.msg);
                port.postMessage({ msg: res, id: msg.id });
            }
        });
    }
}

Object.assign(globalThis, { MessageManager });

/** @type {typeof MessageManager} MessageManager */
