import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.request
from html.parser import HTMLParser

ROOT=Path(__file__).resolve().parents[2]
COMMIT='dfdf6e42bd9ad324b903f320508accd2a7e7154c'
BASE='bb9f904d79afff6efee19a80e7fe80980c733514'
OUT=Path('/tmp/melunga-production-integrity.json')
report={'version':1,'executedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'origin':'https://melunga.com','expectedMergeCommit':COMMIT,'historicalProductionCommit':BASE,
 'realHttpRequests':True,'localResponseFixtures':False,'status':'running','files':[],'errors':[],
 'hostedBrowserReport':'/tmp/melunga-production-smoke.json','physicalPhoneTestedByCodex':False}
def git(file,commit=COMMIT):
 return subprocess.check_output(['git','show',commit+':melunga_deploy/'+file],cwd=ROOT)
def get(file,method='GET'):
 request=urllib.request.Request('https://melunga.com/'+file,headers={'Cache-Control':'no-cache'},method=method)
 with urllib.request.urlopen(request,timeout=45) as response:
  return response.status,response.geturl(),response.read()
def sha(b):return hashlib.sha256(b).hexdigest()
def pretty_url_only(expected,actual):
 class Anchors(HTMLParser):
  def __init__(self,text):
   super().__init__(convert_charrefs=False);self.tags=[];self.offsets=[0]
   for line in text.splitlines(keepends=True):self.offsets.append(self.offsets[-1]+len(line))
   self.feed(text)
  def handle_starttag(self,tag,attrs):
   if tag=='a':
    row,col=self.getpos();start=self.offsets[row-1]+col
    self.tags.append((self.get_starttag_text(),dict(attrs),start))
 source=expected.decode();live=actual.decode();a,b=Anchors(source),Anchors(live)
 assert len(a.tags)==len(b.tags),'HTML anchor count changed'
 replacements=[];changes=[]
 for (old,attrs,start),(new,other,_) in zip(a.tags,b.tags):
  if old==new:continue
  source_href=attrs.get('href','');live_href=other.get('href','')
  assert {k:v for k,v in attrs.items() if k!='href'}=={k:v for k,v in other.items() if k!='href'},'non-href anchor attributes changed'
  split=urllib.parse.urlsplit(source_href)
  assert split.path.endswith('.html'),'HTML difference is not a pretty URL rewrite'
  target=urllib.parse.urlunsplit((split.scheme,split.netloc,split.path[:-5],split.query,split.fragment))
  assert live_href==target,('unexpected href rewrite',source_href,live_href)
  replacements.append((start,start+len(old),new));changes.append({'sourceHref':source_href,'servedHref':live_href})
 for start,end,new in reversed(replacements):source=source[:start]+new+source[end:]
 assert source.encode()==actual,'HTML contains differences beyond the documented pretty URL link rewrites'
 return changes
try:
 paths=['app.html','index.html','desktop-home.js','curriculum-player.js','curriculum-player.css',
  'curriculum-entry.js','curriculum-index.js','curriculum-legacy-free.js','l1-cafe.js','l1-cafe-release.js',
  'content/l1-cafe.json','content/curriculum-legacy-free.json']
 paths+=['content/curriculum/'+p+'.json' for p in ['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr']]
 served={}
 for file in paths:
  status,url,body=get(file);expected=git(file)
  row={'path':file,'httpStatus':status,'url':url,'bytes':len(body),'sha256':sha(body),
       'expectedSha256':sha(expected),'matchesMergedCommit':body==expected}
  if body!=expected and file.endswith('.html'):
   row['documentedPrettyUrlRewrites']=pretty_url_only(expected,body)
   row['matchesExceptDocumentedPrettyUrls']=True
  report['files'].append(row);served[file]=body
  assert status==200 and (body==expected or row.get('matchesExceptDocumentedPrettyUrls')),file+' differs from merged production commit'
 app=served['app.html'].decode();old=git('app.html',BASE).decode()
 for name in ['DECKS','PEDAGOGY_FAMILIES']:
  line=lambda text:next(l for l in text.splitlines() if l.startswith('var '+name+' = '))
  assert line(app)==line(old),name+' changed from historical production'
  report[name+'Unchanged']=True
 decks=json.loads(next(l for l in app.splitlines() if l.startswith('var DECKS = ')).split('=',1)[1].strip().rstrip(';'))
 report['catalogueCards']=sum(len(d) for d in decks.values());assert report['catalogueCards']==32115
 cafe=json.loads(served['content/l1-cafe.json'])
 report['cafeMetadata']={k:cafe[k] for k in ['status','nativeReviewPending','sourceCommit']}
 assert cafe['status']=='owner-instruction-activated' and cafe['nativeReviewPending'] is False
 assert cafe['sourceCommit']=='30e7d40a8af3f51ee186bf83f983596b8ca8798f'
 report['curriculumPairs']=[]
 for file,body in served.items():
  if file.startswith('content/curriculum/'):
   data=json.loads(body)
   assert data['status']=='owner-instruction-activated' and data['publicationApproved'] is True
   report['curriculumPairs'].append({'pair':data['id'],'levels':len(data['levels']),
    'l1Lessons':len(data['levels'][0]['lessons']),'freeLibraryLessons':len(data['freeLibrary'])})
 status,url,_=get('parcours-preview.html',method='HEAD')
 assert '/app.html?' in url and 'start=1' in url
 report['reviewWorkshopRedirect']={'httpStatusAfterRedirect':status,'finalUrl':url}
 unchanged=[]
 for file in ['store-billing.js','netlify/functions/pricing-table.mjs','netlify/functions/get-pricing.mjs']:
  assert git(file)==git(file,BASE),file+' source changed';unchanged.append(file)
 report['unchangedPaymentSources']=unchanged
 try:
  status,url,body=get('.netlify/functions/get-pricing');pricing=json.loads(body)
  public={k:v for k,v in pricing.items() if k in ['currency','monthly','annual','monthlyPrice','annualPrice','monthlyDisplay','annualDisplay','monthlyAmount','annualAmount','plans']}
  report['pricingEndpoint']={'httpStatus':status,'publicFields':public}
 except Exception as e:report['pricingEndpoint']={'error':str(e)}
 report['status']='passed'
except Exception as e:
 report['status']='failed';report['errors'].append(str(e))
finally:
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':report['status'],'matchedFiles':sum(r['matchesMergedCommit'] or r.get('matchesExceptDocumentedPrettyUrls',False) for r in report['files']),
                  'catalogueCards':report.get('catalogueCards'),'cafeMetadata':report.get('cafeMetadata'),
                  'pairs':report.get('curriculumPairs'),'errors':report['errors']},ensure_ascii=False))
 if report['status']!='passed':raise SystemExit(1)
