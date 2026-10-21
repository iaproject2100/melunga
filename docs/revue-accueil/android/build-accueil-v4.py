#!/usr/bin/env python3
"""Minimal local TEST-only APK update. No source mutation, no deletion, no user keys.
Usage: python3 build-accueil-v4.py --source-apk V3.apk --web-root melunga_deploy --signer uber-apk-signer-1.3.0.jar --out-dir NEW_DIRECTORY
Requires Python3 and Java21. Signer SHA256 is pinned to the official v1.3.0 release.
"""
import argparse, hashlib, json, pathlib, re, struct, subprocess, zipfile
EXPECTED_CERT='1E08A903AEF9C3A721510B64EC764D01D3D094EB954161B62544EA8F187B5953'
EXPECTED_SIGNER='e1299fd6fcf4da527dd53735b56127e8ea922a321128123b9c32d619bba1d835'
EXPECTED_SOURCE='cdf5a277613d54ce805cf291f3b4223d8a2abd61f5552db5a45a64a6ed756695'
WEBFILES=('index.html','desktop-home.css','desktop-home.js')
WEB_COMMIT='94f1c4f1ce41ee115f608d28883e83a7b6fe226d'
EXPECTED_WEB={'index.html': '4c79c4f283460fa7d649be4ae6dbf147206aa34c9479f24415d1bfd3043773b0', 'desktop-home.css': '52a0ce2375caa6800c703ec7437d724dc445b97080764f756647a047855afbab', 'desktop-home.js': '2120eafe2c344747408eba584e4460e5affbe73d5675aa311ed7142b2594de14'}
def sha(data): return hashlib.sha256(data).hexdigest()
def manifest_info(data, patch=False):
    buf=bytearray(data); pos=8; strings=[]; locations=[]; attrs={}; code_offset=None
    def u32(o): return struct.unpack_from('<I',buf,o)[0]
    def u16(o): return struct.unpack_from('<H',buf,o)[0]
    def size8(o):
        n=buf[o];o+=1
        if n&128:n=((n&127)<<8)|buf[o];o+=1
        return n,o
    def size16(o):
        n=u16(o);o+=2
        if n&32768:n=((n&32767)<<16)|u16(o);o+=2
        return n,o
    def st(i): return strings[i] if i!=0xffffffff else None
    while pos<len(buf):
        typ,hs,size=struct.unpack_from('<HHI',buf,pos)
        if not size:raise ValueError('Zero-size AXML chunk')
        if typ==1:
            cnt=u32(pos+8);utf8=bool(u32(pos+16)&256);start=u32(pos+20)
            for j in range(cnt):
                off=pos+start+u32(pos+hs+4*j)
                if utf8:
                    _,off=size8(off);length,off=size8(off);encoding='utf-8';end=off+length
                else:
                    length,off=size16(off);encoding='utf-16le';end=off+length*2
                strings.append(bytes(buf[off:end]).decode(encoding));locations.append((off,end,encoding))
        if typ==0x102 and st(u32(pos+20))=='manifest':
            astart=u16(pos+24);asz=u16(pos+26);cnt=u16(pos+28)
            for j in range(cnt):
                off=pos+16+astart+j*asz;name=st(u32(off+4));raw=st(u32(off+8));dtype=buf[off+15];value=u32(off+16)
                attrs[name]=raw if raw is not None else st(value) if dtype==3 else value
                if name=='versionCode':
                    assert dtype in (0x10,0x11);code_offset=off+16
        pos+=size
    if patch:
        assert attrs['package']=='com.melunga.app.test',attrs
        assert attrs['versionName']=='1.0.4-conv-test3' and attrs['versionCode']==5,attrs
        assert strings.count('1.0.4-conv-test3')==1
        off,end,enc=locations[strings.index('1.0.4-conv-test3')]
        replacement='1.0.4-conv-test4'.encode(enc);assert len(replacement)==end-off
        buf[off:end]=replacement;struct.pack_into('<I',buf,code_offset,6)
        assert len(buf)==len(data)
    return attrs,bytes(buf)
def run(cmd,cwd,log):
    proc=subprocess.run(cmd,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    log.write_text(proc.stdout)
    if proc.returncode:raise RuntimeError(f'Command failed; see {log}')
    return proc.stdout
p=argparse.ArgumentParser();p.add_argument('--source-apk',required=True);p.add_argument('--web-root',required=True);p.add_argument('--signer',required=True);p.add_argument('--out-dir',required=True);args=p.parse_args()
source=pathlib.Path(args.source_apk).resolve();web=pathlib.Path(args.web_root).resolve();signer=pathlib.Path(args.signer).resolve();out=pathlib.Path(args.out_dir).resolve()
assert sha(source.read_bytes())==EXPECTED_SOURCE,'Unexpected source APK'
assert sha(signer.read_bytes())==EXPECTED_SIGNER,'Unexpected signer JAR'
# mkdir without exist_ok refuses any pre-existing output and never removes anything.
out.mkdir(parents=False,exist_ok=False)
work=out/'signing-work';work.mkdir();home=out/'isolated-home';home.mkdir();unsigned=out/'unsigned.apk'
replacements={'assets/public/'+fn:(web/fn).read_bytes() for fn in WEBFILES}
assert all(sha(replacements['assets/public/'+name])==EXPECTED_WEB[name] for name in WEBFILES),'Homepage assets differ from approved commit'
changed=[];removed=[];oldhashes={}
with zipfile.ZipFile(source) as zin,zipfile.ZipFile(unsigned,'x') as zout:
    names=zin.namelist();assert len(names)==len(set(names)),'Duplicate ZIP entries'
    for info in zin.infolist():
        data=zin.read(info.filename);oldhashes[info.filename]=sha(data)
        # Old JAR signatures are invalid after changing contents; remove only signing files.
        if re.fullmatch(r'META-INF/(?:MANIFEST\.MF|[^/]+\.(?:SF|RSA|DSA|EC))',info.filename,re.I):
            removed.append(info.filename);continue
        if info.filename=='AndroidManifest.xml':
            before,updated=manifest_info(data,True);changed.append(info.filename)
            bytechanges=[i for i,(a,b) in enumerate(zip(data,updated)) if a!=b]
            assert len(bytechanges)==2,bytechanges;data=updated
        elif info.filename in replacements:
            data=replacements[info.filename]
            if sha(data)!=oldhashes[info.filename]:changed.append(info.filename)
        zout.writestr(info,data)
assert set(changed)=={'AndroidManifest.xml',*replacements}
cmd=['java',f'-Duser.home={home}','-jar',str(signer),'-a',str(unsigned),'-o',str(out/'signed'),'--verifySha256',EXPECTED_CERT]
signing=run(cmd,work,out/'signing.log')
candidates=list((out/'signed').glob('*debugSigned.apk'));assert len(candidates)==1,candidates
apk=out/'Melunga-TEST-accueil-v4.apk';candidates[0].rename(apk)
verify=run(['java',f'-Duser.home={home}','-jar',str(signer),'-a',str(apk),'-y','--verifySha256',EXPECTED_CERT],work,out/'verify.log')
# Independent JRE certificate extraction, public certificate only.
cert=run(['keytool','-printcert','-jarfile',str(apk)],work,out/'certificate.log')
match=re.search(r'SHA256:\s*([0-9A-F:]+)',cert);assert match and match.group(1).replace(':','')==EXPECTED_CERT,'Certificate mismatch'
assert '- signature verified [v2, v3]' in verify.lower() and 'verify with provided hash successful' in verify.lower() and '0 errors' in verify.lower(),verify
unchanged=[];unexpected=[];assetproof={}
with zipfile.ZipFile(apk) as z:
    newattrs,_=manifest_info(z.read('AndroidManifest.xml'))
    assert newattrs['versionCode']==6 and newattrs['versionName']=='1.0.4-conv-test4'
    assert newattrs['package']=='com.melunga.app.test'
    for name,oldhash in oldhashes.items():
        if name in removed:continue
        actual=sha(z.read(name))
        if name in replacements:assert actual==sha(replacements[name])
        elif name!='AndroidManifest.xml':
            if actual!=oldhash:unexpected.append(name)
            else:unchanged.append(name)
        if name.startswith('assets/'):
            assetproof[name]={'sourceSha256':oldhash,'outputSha256':actual,'changed':actual!=oldhash}
    assert not unexpected,unexpected
    newpayload=[n for n in z.namelist() if n not in oldhashes and not n.startswith('META-INF/')]
    assert not newpayload,newpayload
    config=json.loads(z.read('assets/capacitor.config.json'));runtime=z.read('assets/public/mobile-runtime.js').decode()
    assert config['appId']=='com.melunga.app.test'
    assert 'conversation-preview-8-v3' in runtime
report={'artifact':str(apk),'sourceApk':str(source),'sourceSha256':EXPECTED_SOURCE,'sha256':sha(apk.read_bytes()),'bytes':apk.stat().st_size,'signer':{'version':'1.3.0','officialRelease':'https://github.com/patrickfav/uber-apk-signer/releases/tag/v1.3.0','sha256':EXPECTED_SIGNER,'officialChecksumMatched':True},'certificateSha256':EXPECTED_CERT,'sameCertificateAsV3':True,'package':newattrs['package'],'versionName':newattrs['versionName'],'versionCode':newattrs['versionCode'],'manifestChangedByteOffsets':bytechanges,'changedPayloadEntries':changed,'unchangedPayloadEntries':len(unchanged),'removedOldSignatureEntries':removed,'unexpectedPayloadChanges':unexpected,'nativeRuntimeConfigPreserved':True,'conversationPreview8Preserved':True,'assets':assetproof,'verificationTool':'uber-apk-signer 1.3.0 (Android apksig + zipalign), keytool independent certificate','deviceTested':False,'releaseBuild':False,'limitations':['Repack of existing TEST APK, not a Gradle source build or AAB.','Existing v3 conversation runtime/assets retained; homepage only updated.','Installation and visual behavior require phone testing.']}
report['webSourceCommit']=WEB_COMMIT
report['webSourceFiles']={name:{'sha256':EXPECTED_WEB[name],'matchesPinnedCommit':True} for name in WEBFILES}
report['servicesPreserved']='Content preview #8; existing API calls still point to melunga.com as in v3.'
(out/'verification-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['assets']},ensure_ascii=False,indent=2))
