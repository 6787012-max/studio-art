# -*- coding: utf-8 -*-
"""Adds the in-scene labels LBL_A..LBL_H to khs_99/captions_vault.json.
prep_production.py rewrites the vault from script_spec.json and drops the labels, so run this AFTER prep.
Labels are read by regex from work/short99_SUPERVISOR_FIXES.md (no Hebrew is typed here)."""
import io, json, re
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_99'
FIX = io.open(WORK + '/short99_SUPERVISOR_FIXES.md', encoding='utf-8').read()
LBL = {}
for m in re.finditer(r'^(LBL_[A-H])\s+(\S.*?)\s*$', FIX, re.M):
    LBL[m.group(1)] = m.group(2)
assert len(LBL) == 8, sorted(LBL)
path = HERE + '/captions_vault.json'
vault = json.load(io.open(path, encoding='utf-8'))
vault.update(LBL)
io.open(path, 'w', encoding='utf-8').write(json.dumps(vault, ensure_ascii=True, indent=1))
print('vault keys', len(vault), 'labels', sorted(k for k in vault if k.startswith('LBL_')))
