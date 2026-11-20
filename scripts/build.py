#!/usr/bin/env python3
from base64 import b64encode
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'

def read_json(filename):
    return json.loads((SRC / filename).read_text(encoding='utf-8'))

content = read_json('atlas-data.json')
extensions = read_json('extensions.json')
guide = read_json('guide.json')

for name in ('cases', 'policies'):
    content[name].extend(extensions[name])
    items = content[name]
    assert len(items) == len({item['id'] for item in items}), f'Duplicate {name} IDs'

case_ids = {case['id'] for case in content['cases']}
policy_ids = {policy['id'] for policy in content['policies']}
anchors = { (policy['id'],clause['id']) for policy in content['policies'] for clause in policy['clauses'] }
assert len(anchors) == sum(len(policy['clauses']) for policy in content['policies'])

for case in content['cases']:
    assert all((link['docId'],link['clauseId']) in anchors for link in case['links']), case['id']
    assert all(item['stage'] in case['steps'] for item in case['process']), case['id']

def verify_guide(item):
    if isinstance(item, list):
        for entry in item:
            verify_guide(entry)
    if not isinstance(item, dict):
        return
    kind = item.get('type')
    if kind == 'case':
        assert item['id'] in case_ids, item
    if kind == 'policy':
        assert item['id'] in policy_ids and (not item.get('clause') or (item['id'], item['clause']) in anchors), item
    if kind == 'source':
        assert item['url'].startswith('https://'), item
    if kind == 'view':
        assert item['id'] in {'guide','fujian','benchmarks','china','world','policy','compare','method'}, item
    for child in item.values():
        verify_guide(child)

verify_guide(guide)
benchmarks = guide['benchmarks']['hospitals']
benchmark_stages = list(guide['benchmarks']['stages'])
assert benchmark_stages == ['entry', 'surgery', 'therapy', 'discharge', 'followup']
assert set(benchmarks) == {hospital['id'] for hospital in guide['fujian']['hospitals']}
for hospital, comparison in benchmarks.items():
    modules = comparison['modules']
    assert [module['id'] for module in modules] == benchmark_stages, hospital
    assert all(1 <= len(module['references']) <= 2 and module['policy'] for module in modules), hospital
assert len(guide["flagships"]) == len({ref["id"] for ref in guide["flagships"]})
assert all(ref["id"] in case_ids for ref in guide["flagships"])
flow_stages = guide['overview']['stages']
assert len(flow_stages) == len({stage['id'] for stage in flow_stages})
assert sorted(ref['id'] for stage in flow_stages for ref in stage['cases']) == sorted(ref['id'] for ref in guide['flagships'])
content.update(
    guide=guide,
    chinaMap='data:image/jpeg;base64,' + b64encode((SRC / 'maps/china.jpg').read_bytes()).decode('ascii'),
    worldPath=(SRC / 'maps/world-path.txt').read_text().strip(),
)
world = content['worldPath']
assert re.fullmatch(r'[MLZ0-9.,\\-]+', world), 'unexpected text in world map path'
bundle = json.dumps(content,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html = (SRC / 'template.html').read_text(encoding='utf-8')
for name, value in {
    'CSS_BUNDLE': (SRC / 'style.css').read_text(encoding='utf-8'),
    'JS_BUNDLE': (SRC / 'app.js').read_text(encoding='utf-8')+'\n'+(SRC / 'guide-view.js').read_text(encoding='utf-8'),
    'DATA_BUNDLE': bundle,
    'VERSION_DATE': escape(guide['updateDate']),
    'VERSION_DISPLAY': escape(guide['updateDate'].replace('-', '.')),
}.items():
    html = html.replace(name, value)
dest = ROOT / 'docs' / 'index.html'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(html,encoding='utf-8')
print(f'{len(case_ids)} cases | {len(policy_ids)} documents | {len(anchors)} anchors | {dest.stat().st_size:,} bytes | {dest}')
