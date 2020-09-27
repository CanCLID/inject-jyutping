import json
import os

# Library
os.system('wget -nc -O lib/browser-polyfill.js https://unpkg.com/webextension-polyfill@0.6.0/dist/browser-polyfill.js')

# Preprocess
os.system('wget -nc https://github.com/CanCLID/ToJyutping/raw/54945d4cf1fc86858acff7b1dd6f3f13dc838bf0/preprocess.py')
os.system("sed -i 's/src\/ToJyutping\/jyut6ping3.simple.dict.yaml/jyut6ping3.simple.dict.yaml/' preprocess.py")
os.system('python preprocess.py')

l = []

with open('jyut6ping3.simple.dict.yaml') as f:
	for line in f:
		k, v = line.rstrip('\n').split('\t')
		l.append((k, v))

with open('background_scripts/dictionary.json.txt', 'w') as f:  # *.json.txt: See mozilla/addons-linter#1700
	f.write(json.dumps(l, ensure_ascii=False).replace('], [', '],\n['))
	f.write('\n')  # Add line break at the end of file
