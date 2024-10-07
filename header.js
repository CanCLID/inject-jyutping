// ==UserScript==
// @name              Inject Jyutping
// @name:zh-HK        注入粵拼
// @name:zh-TW        注入粵拼
// @name:zh-CN        注入粤拼
// @name:ja           粤拼を注入
// @name:ko           월병(粵拼)을 주입
// @description       Add Cantonese pronunciation (Jyutping) on Chinese characters.
// @description:zh-HK 為漢字標註粵語發音（粵拼）。
// @description:zh-TW 為漢字標註粵語發音（粵拼）。
// @description:zh-CN 为汉字标注粤语发音（粤拼）。
// @description:ja    漢字に広東語の発音（粤拼）を付けます。
// @description:ko    한자에 광동어의 발음(월병/粵拼)을 붙인다.
// @namespace         https://jyutping.org
// @version           0.5.0
// @license           BSD-2-Clause
// @icon              https://raw.githubusercontent.com/CanCLID/inject-jyutping/refs/heads/main/icons/128.png
// @match             *://*/*
// @grant             GM_addStyle
// @run-at            context-menu
// ==/UserScript==

'use strict';

GM_addStyle(`
    ruby.inject-jyutping > rt {
        font-size: 0.74em;
        font-variant: initial;
        margin-left: 0.1em;
        margin-right: 0.1em;
        text-transform: initial;
        letter-spacing: initial;
    }

    ruby.inject-jyutping > rt::after {
        content: attr(data-content);
    }
`);
