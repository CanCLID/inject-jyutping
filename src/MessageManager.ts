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

export default class MessageManager<T extends Record<string, (msg: any) => any>> {
    constructor(private worker: Pick<Worker, keyof AbstractWorker | 'postMessage'>) {}

    sendMessage<K extends keyof T>(handlerName: K, msg: Parameters<T[K]>[0]): Promise<ReturnType<T[K]>> {
        const { worker } = this;
        const id = getUniqueId();
        return new Promise(resolve => {
            worker.addEventListener('message', function f({ data: response }) {
                if (isMessage(response) && response.id === id) {
                    worker.removeEventListener('message', f);
                    resolve(response.msg);
                }
            });
            worker.postMessage({ msg, id, name: handlerName });
        });
    }

    registerHandler<K extends keyof T>(handlerName: K, f: T[K]) {
        const { worker } = this;
        worker.addEventListener('message', ({ data: msg }) => {
            if (isMessage(msg) && 'name' in msg && msg.name === handlerName) {
                const res = f(msg.msg);
                worker.postMessage({ msg: res, id: msg.id });
            }
        });
    }
}
