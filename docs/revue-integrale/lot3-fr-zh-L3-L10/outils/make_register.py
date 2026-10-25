import sys,json,re,hashlib,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
from build import *
from decisions import *
idx=load_cards('fr-zh')
REASON={'E':"la semi-voyelle y de la syllabe est perdue : « ang » se lit comme une autre syllabe (áng)",
'F':"une consonne a glissé d'une syllabe à la suivante : la coupe fait lire d'autres syllabes",
'G':"l'initiale r (rendue j dans le deck) a disparu ou s'est collée à la syllabe précédente",
'H':"l'initiale j est rendue t ou tch, ce qui fait lire une autre syllabe (tīng, qīn…) ; le deck rend j par dj",
'I':"les lettres latines ne sont pas à leur place dans la phrase, ou le sigle n'est pas lisible",
'J':"l'aide suivait une lecture pinyin fautive, corrigée dans le même lot",
'C':"« les » rendu 莱 (lái) ; la convention déjà retenue pour « les » est 雷"}
TOK=re.compile(r"[a-zéèêëïîôöüûàâç]+",re.I)
events=[]
def occ(entry):
    p=entry['card']
    return {'path':entry['path'],'location':entry['location'],'expectedBefore':{k:p.get(k) for k in ('study','native','reading','phon')}}
def add(id_,rules,before,after,align,pair='fr-zh',entry=None):
    entry=entry or idx[id_]
    p=entry['card']
    assert p['phon']==before,(id_,p['phon'],before)
    assert before!=after
    events.append({'pair':pair,'id':id_,'level':entry['level'],'theme':entry['theme'],'rules':rules,
      'study':p['study'],'native':p['native'],'reading':p.get('reading'),
      'beforePhon':before,'afterPhon':after,'alignment':align,
      'reason':' ; '.join(REASON[r] for r in rules),'occurrence':occ(entry),
      'priorCorrection':bool(p.get('phoneticCorrection'))})
for k,(r,b,a,al) in PHON.items(): add(k,[r],b,a,al)
for k,(b,a,al) in E_EXTRA.items(): add(k,['G','E'],b,a,al)
# E family
for k,v in idx.items():
    if k in PHON or k in E_EXTRA or k in E_UNCERTAIN: continue
    p=v['card']; ph=p.get('phon') or ''
    S=syls(p.get('reading') or ''); ms=list(TOK.finditer(ph))
    if len(S)!=len(ms): continue
    pos=[i for i,(s,m) in enumerate(zip(S,ms)) if s=='yang' and m.group().lower()=='ang' and not (i and ms[i-1].group().lower() in ('i',))]
    if not pos: continue
    new=ph
    for i in reversed(pos):
        m=ms[i]; new=new[:m.start()]+'yang'+new[m.end():]
    al=' · '.join(f"{s} → {m.group()}"+(' ✗' if i in pos else '') for i,(s,m) in enumerate(zip(S,ms)))
    add(k,['E'],ph,new,al)
# C : deux répliques reçues zh-fr
zf=json.load(open(f'{ROOT}/{BASE}/repertoires/zh-fr.json'))
for i,b,a in ((16,'蒂 埃姆 普吕托 莱 扎克蒂维泰 卡勒姆','蒂 埃姆 普吕托 雷 扎克蒂维泰 卡勒姆'),(28,'热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 莱 德 福尔马','热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 雷 德 福尔马')):
    p=zf['receivedModels'][i]
    e={'card':p,'level':p.get('editorialLevel'),'path':f'{BASE}/repertoires/zh-fr.json','location':['receivedModels',i],'theme':'receivedModels'}
    add(p['id'],['C'],b,a,'« les » → 莱 ✗ (lái) ; 雷 comme les 17 aides déjà corrigées',pair='zh-fr',entry=e)
# transport copies
for e in events:
    r=json.load(open(f"{ROOT}/{BASE}/repertoires/{e['pair']}.json"))
    e['transportCopies']=sum(1 for q in r['phrases'] if q['id']==e['id'])
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
reg={'id':'revue-claude-lot3-fr-zh-L3-L10','status':'proposed-whole-aid-corrections-for-generator',
 'baseSnapshotCommit':head,'scope':'fr-zh L3–L10, modèles reçus fr-zh, familles E/F/G retrouvées en fr-zh L1–L2, deux répliques reçues zh-fr (« les »)',
 'policy':"avant/après entiers et figés ; aucune règle à étendre à d'autres cartes ; la provenance d'origine n'est pas modifiée ; quand une carte porte déjà une correction B ou D, l'avant est la valeur actuelle (après B/D) et l'événement s'ajoute après",
 'rules':REASON,'eventCount':len(events),'events':sorted(events,key=lambda e:(e['pair'],e['level'] if isinstance(e['level'],int) else 99,e['id']))}
json.dump(reg,open(sys.argv[1],'w'),ensure_ascii=False,indent=1)
import collections
print(len(events),collections.Counter('+'.join(e['rules']) for e in events),collections.Counter(e['level'] for e in events))
