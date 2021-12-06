/* Usage example:

In background script:

browser.runtime.onConnect.addListener(port => {
    const mm = new MessageManager(port);
    mm.registerHandler('double', s => s + s);
    mm.registerHandler('triple', s => s + s + s);
});

In content script:

const port = browser.runtime.connect();
const mm = new MessageManager(port);
mm.sendMessage('double', '你好').then(f => alert(f));  // Will alert 你好你好
mm.sendMessage('triple', '你好').then(f => alert(f));  // Will alert 你好你好你好
*/

const getUniqueId = ((id) => () => id++)(0)

class MessageManager {
    constructor(port) {
        this.port = port;
    }

    sendMessage(handlerName, msg) {
        const {port} = this;
        const id = getUniqueId()
        return new Promise(resolve => {
            port.onMessage.addListener(function f(response) {
                if (response.id === id) {
                    port.onMessage.removeListener(f);
                    resolve(response.msg);
                }
            });
            port.postMessage({msg, id, name: handlerName});
        });
    }

    registerHandler(handlerName, f) {
        const port = this.port;
        port.onMessage.addListener(msg => {
            if (msg.name === handlerName) {
                const res = f(msg.msg);
                port.postMessage({msg: res, id: msg.id});
            }
        });
    }
}
