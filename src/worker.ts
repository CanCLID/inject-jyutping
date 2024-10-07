declare const ToJyutping: typeof import('to-jyutping');

import MessageManager from './MessageManager';

importScripts('https://cdn.jsdelivr.net/npm/to-jyutping@3.1.1');
const mm = new MessageManager<{ convert(msg: string): [string, string | null][] }>(globalThis);
mm.registerHandler('convert', ToJyutping.getJyutpingList);
