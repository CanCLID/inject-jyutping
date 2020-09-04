import json
from opencc import OpenCC
import os

# Preprocess
os.system('wget -nc https://github.com/CanCLID/ToJyutping/raw/master/preprocess.py')
os.system("sed -i 's/src\/ToJyutping\/jyut6ping3.simple.dict.yaml/jyut6ping3.simple.dict.yaml/' preprocess.py")
os.system('python preprocess.py')

# Build dictionary
converter = OpenCC('t2s')

d_t = {}
d_cn = {}

with open('jyut6ping3.simple.dict.yaml') as f:
    for line in f:
        k_t, v = line.rstrip('\n').split('\t')
        k_cn = converter.convert(k_t)
        d_t[k_t] = v
        d_cn[k_cn] = v

d = {**d_cn, **d_t}  # prefer t over cn
l = list(d.items())

with open('background_scripts/dictionary.json.txt', 'w') as f:
    f.write(json.dumps(l, ensure_ascii=False).replace('], [', '],\n['))
    f.write('\n')  # Add line break at the end of file
