import json
import os

# Library
os.system('wget -nc -O lib/browser-polyfill.js https://unpkg.com/webextension-polyfill@0.8.0/dist/browser-polyfill.js')

# Preprocess
os.system('wget -nc https://raw.githubusercontent.com/CanCLID/ToJyutping/662a8c1/preprocess.py')
os.system("sed -i 's/src\/ToJyutping\/jyut6ping3.simple.dict.yaml/jyut6ping3.simple.dict.yaml/' preprocess.py")
os.system('python preprocess.py')

l = []

with open('jyut6ping3.simple.dict.yaml') as f:
    for line in f:
        k, v = line.rstrip('\n').split('\t')
        l.append((k, v))

# *.json.txt: See mozilla/addons-linter#1700
with open('background_scripts/dictionary.json.txt', 'w') as f:
    f.write(json.dumps(l, ensure_ascii=False).replace('], [', '],\n['))
    f.write('\n')  # Add line break at the end of file
