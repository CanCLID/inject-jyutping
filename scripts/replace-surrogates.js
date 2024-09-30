import { readFile, writeFile, readdir } from 'fs/promises';

await Promise.all(
    (
        await readdir('./dist')
    ).flatMap(async path =>
        path.endsWith('.js')
            ? [
                  writeFile(
                      `./dist/${path}`,
                      (
                          await readFile(`./dist/${path}`, 'utf-8')
                      ).replace(/\\u(D[89AB][0-9A-F]{2})\\u(D[CDEF][0-9A-F]{2})/gi, (_, highSurrogate, lowSurrogate) =>
                          String.fromCodePoint(
                              (parseInt(highSurrogate, 16) - 0xd800) * 0x400 + (parseInt(lowSurrogate, 16) - 0xdc00) + 0x10000
                          )
                      )
                  ),
              ]
            : []
    )
);
