import sys,json,re,hashlib
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
from cands import syls
ROOT='/home/claude/melunga'
BASE='melunga_deploy/content/niveaux-progressifs'
def load_cards(pair):
    idx={}
    for L in range(1,11):
        path=f'{BASE}/{pair}/L{L}.json'
        d=json.load(open(f'{ROOT}/{path}'))
        for ti,t in enumerate(d['themes']):
            for pi,p in enumerate(t['phrases']):
                idx.setdefault(p['id'],{'card':p,'level':L,'path':path,'location':['themes',ti,'phrases',pi],'theme':t['id'],'themeTitle':t['title']})
        for ri,p in enumerate(d['reserve']):
            idx.setdefault(p['id'],{'card':p,'level':L,'path':path,'location':['reserve',ri],'theme':'reserve','themeTitle':None})
    rp=f'{BASE}/repertoires/{pair}.json'
    r=json.load(open(f'{ROOT}/{rp}'))
    for i,p in enumerate(r['receivedModels']):
        idx.setdefault(p['id'],{'card':p,'level':p.get('editorialLevel'),'path':rp,'location':['receivedModels',i],'theme':'receivedModels','themeTitle':None})
    return idx
