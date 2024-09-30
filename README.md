<h1>Inject Jyutping <ruby>幫<rt>bong1</rt></ruby> <ruby>漢<rt>hon3</rt></ruby> <ruby>字<rt>zi6</rt></ruby> <ruby>標<rt>biu1</rt></ruby> <ruby>粵<rt>jyut6</rt></ruby> <ruby>拼<rt>ping3</rt></ruby></h1>

呢個係一個可以幫網頁上面嘅漢字自動標註粵拼嘅 Chrome、Firefox 同 Edge 擴充功能，係學習粵拼同粵語嘅強大工具。

A browser extension for Google Chrome, Mozilla Firefox, and Microsoft Edge that adds Cantonese pronunciation (Jyutping) on Chinese characters, a powerful tool for learning Cantonese and Jyutping.

<h2>Install <ruby>安<rt>on1</rt></ruby> <ruby>裝<rt>zong1</rt></ruby></h2>

-   [Chrome Web Store](https://chrome.google.com/webstore/detail/inject-jyutping/lfgpgjkjglogbndlkikjgbbfoiofbdjp)
-   [Firefox Browser Add-On](https://addons.mozilla.org/firefox/addon/inject-jyutping/)

<h2>Preview <ruby>預<rt>jyu6</rt></ruby> <ruby>覽<rt>laam5</rt></ruby></h2>

![Demo](./demo.jpg)

<h2>Development <ruby>開<rt>hoi1</rt></ruby> <ruby>發<rt>faat3</rt></ruby></h2>

執行以下命令：

Run the following command:

```sh
npm i
npm start
```

再去瀏覽器「擴充功能」頁撳「載入未封裝項目」並揀選 `dist` 資料夾。

And navigate to the browser “Extensions” page, click “Load Unpacked” and select the `dist` folder.

要產生用於發佈嘅版本，請執行：

To generate a production build, run:

```sh
npm run build
```
