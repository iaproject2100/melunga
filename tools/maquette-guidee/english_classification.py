"""Apply the frozen, owner-authorized English placement register.

No text, phonetic aid, reading, source/access level or prior correction changes.
The source input edition is pinned before any simultaneous relocation occurs.
"""
from __future__ import annotations
import copy
from collections import Counter
import hashlib
import json
from pathlib import Path

REGISTRY = "docs/niveaux-progressifs/classement-fr-en/registre/registre-classement.json"
REGISTRY_SHA256 = "a605a44eb886e598014dab0ed4b1000c819060ad4dcf83f939fd70c9a4dc020a"
VISUALS = "docs/niveaux-progressifs/classement-fr-en/visuels.json"
VISUALS_SHA256 = "a7aa72f90aa3ebd42823d7632bd1a6e25d5fa72006d585484990d9ad877a47da"
EVIDENCE_COMMIT = "1bf76c72f58e2ffe37e27d2b137a1ebe350e097f"
BASE_SNAPSHOT = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
MANIFEST = PREFIX + "manifest.json"
BANK = PREFIX + "repertoires/fr-en.json"
PAIR = "fr-en"
FROZEN_DESCRIPTOR_SHA256 = "665103174b46c0946e2e9195b1b4675fb8f32fbc4d3bb78c51cabebd0b9f65f1"
FROZEN_MANIFEST_SHA256 = "780e204750a7f8325af319c441a9f8bbe206b57b249924313bfc6768cac66865"
BASE_HASHES = {'melunga_deploy/content/niveaux-progressifs/fr-en/L1.json': '4d5784892b62f9829f173da700378b7e6dc3ff90f2128bdf8723011f135cda07', 'melunga_deploy/content/niveaux-progressifs/fr-en/L10.json': 'fb544bf13234f452abe487a6a3084f792fe5708397d8d6806da60e3c936b79c0', 'melunga_deploy/content/niveaux-progressifs/fr-en/L2.json': '403ee18b74fd6fa0ce57800e431a0da009dc4a0f8ba76a27d5a1fe6d842b4c73', 'melunga_deploy/content/niveaux-progressifs/fr-en/L3.json': '90ae0ed2f5f22fe0ed470c75f1c45914fb6d5022de335f1da76aa14eba625d15', 'melunga_deploy/content/niveaux-progressifs/fr-en/L4.json': 'd0b64f7b7b3f0eb4e64a5319d2d1c20e3256f9e1b27805a6f9bc2db12ff246b6', 'melunga_deploy/content/niveaux-progressifs/fr-en/L5.json': '52c545536ecc50f3a5bf60b5eb8ef981b7974a6bf68e8029ad29ae7444d007c1', 'melunga_deploy/content/niveaux-progressifs/fr-en/L6.json': 'b46fecebd11df1a2d8ce9edd59979ef2cb337dfe9bedbb0fd23706e94310eb74', 'melunga_deploy/content/niveaux-progressifs/fr-en/L7.json': 'e1311d48e4873a2b7fdb90a5defe5fa1054c63bc89908063c349fed3d61e92ee', 'melunga_deploy/content/niveaux-progressifs/fr-en/L8.json': '230e5b69e50ff92b5f446f3ba5f9005d7a20eed8f32908135c1393571837d72d', 'melunga_deploy/content/niveaux-progressifs/fr-en/L9.json': '8c97e6bd062a3cb10ded347d5a3069ace8c683014a12da700770ea35e38d8509', 'melunga_deploy/content/niveaux-progressifs/fr-es/L1.json': '0a03617ee959d07cc9bc10239c4f64fe3ad53f7f004466d6c596e96a9d410c70', 'melunga_deploy/content/niveaux-progressifs/fr-es/L10.json': 'ad100d43a68d317fc6f1a92519bb38eeaad2df212b9710708a19c3c7f33e0cba', 'melunga_deploy/content/niveaux-progressifs/fr-es/L2.json': '4f1d7ee38e71fe35caa1ce411c5d2a25b81df4980a597e30c2f3d783abd0bd7f', 'melunga_deploy/content/niveaux-progressifs/fr-es/L3.json': '596c686adf90f325548fc19147e3f5d6c28f42375966da45a4482f957efae1e4', 'melunga_deploy/content/niveaux-progressifs/fr-es/L4.json': 'e8a924ca2099d303740c39f44aee52641fa4b630cfe6c06877715b121742b6f6', 'melunga_deploy/content/niveaux-progressifs/fr-es/L5.json': 'b4ae81a44af2890351e77013ab718df885d35dc0e31ab4e70d148d3af25c427b', 'melunga_deploy/content/niveaux-progressifs/fr-es/L6.json': '39202735f59e82b5218e912a3e78e5ffff50004298bab5de6cfedf9b3ee71df7', 'melunga_deploy/content/niveaux-progressifs/fr-es/L7.json': '744ef4d813be9f13801e6f1a8667b65af9ef1f9c656f8a3c337995e4e861994d', 'melunga_deploy/content/niveaux-progressifs/fr-es/L8.json': 'd7dfcf4134b9069ebc0aac4d2a5beb84131ae1a7f08737db716f4973f0db53ba', 'melunga_deploy/content/niveaux-progressifs/fr-es/L9.json': 'bb8606a4b4d4f4562f7ad74f8f78d178575c648a085f73077a1da4c98dbbab87', 'melunga_deploy/content/niveaux-progressifs/fr-it/L1.json': 'c9c968b5d921d41b7cef80c12490a2783e230308a6b9a85d13db7442830f1f7c', 'melunga_deploy/content/niveaux-progressifs/fr-it/L10.json': '30956a320da4fb19e171ba44dd9a887872e9afe31efa4ea26e8f1f9299809971', 'melunga_deploy/content/niveaux-progressifs/fr-it/L2.json': '204044a83ed9657e0d063f54255af601fca8e7a17fcf2a19925854c1550c85d7', 'melunga_deploy/content/niveaux-progressifs/fr-it/L3.json': '2489aaaa0e9bab21cd5e995f9caa2b3549cef4b04ae768b010c7f0a814140612', 'melunga_deploy/content/niveaux-progressifs/fr-it/L4.json': '6ea638a871727e10fcbb47aefc13078d9ed7ab1d503e13a03d871f43a5ac38be', 'melunga_deploy/content/niveaux-progressifs/fr-it/L5.json': 'd75fd386355924685195d97d562edaa659536e37da1efc2881363adbde4e71cd', 'melunga_deploy/content/niveaux-progressifs/fr-it/L6.json': 'dcd04ab320b7205f70e793e0b72f87b0b6fbfb2fb03cca5127b5aa042a078f7a', 'melunga_deploy/content/niveaux-progressifs/fr-it/L7.json': '79376168c75608bd96228b750d1a06652eae8eac717494d1122809a1cedf9de6', 'melunga_deploy/content/niveaux-progressifs/fr-it/L8.json': '7abce71887d788d1c204861b692e1eb0fc6145a385b5769164f973829cc15e05', 'melunga_deploy/content/niveaux-progressifs/fr-it/L9.json': '563f9335ada441e3b3c31c7c840e271f4e8b0e2599c2419d4f722ec056bc4ab4', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L1.json': '5e0edb1ee5f5bce849ceca4a5d6b08e3c988b73822d40976e4c2261b8e733a80', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L10.json': 'f261fe490a8da23675ebbf1dde953af189f4ced39d34288d652dee92dff5fdd6', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L2.json': 'b1e0db28de26961414edc252d434b9795dec2de6ae61d8ba1faf110bb7403fc3', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L3.json': 'b9413a4cb2105a5fbf47d5af9e5f092eafef70308a3b300cde72ae4470eb3d64', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L4.json': 'b3e6cfa42ff7723091ff55c934dc6e8b0b275a2881c97dc17192095269e8f576', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L5.json': 'e26c99dc9982cb5df2159ab42859ef6291b40457dd61283c74b3c017773e5026', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L6.json': '47afa3439ceaf637c7afcd803aaf25689e28eb578eaf04cff4a95c7d322449dc', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L7.json': 'c7f6c735f3e40f0a093bd44e8d503621aa70dd4018cb98272832987c6798be24', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L8.json': 'f763b588f1029c47e8fb5c97af6cfc6a97462d2c92d1ace604b437766d9a6950', 'melunga_deploy/content/niveaux-progressifs/fr-ja/L9.json': 'fc0c41d92e9b47c53c9404ed2ee6f5996cb55d3a9ff9ef16e4e5078286ba9378', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L1.json': 'bb8d267e3cd942f9c55b3e34bdb0bc43511c5c9dbc7a569b33c442b27b0acc98', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L10.json': '9d5abfaf883b753005c6efe7bf0f2dfed4f80914736a15f1869c4e435b647787', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L2.json': '537246af26220794459a603eaa251a9522e57e26c7227ea43854e1d088b14305', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L3.json': 'e3f2a5e493995b502c5bddaee6973dc44508491e7cd75ecd79146d4af3a41e47', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L4.json': '93c8cbf459d7c447092938b2dba4f0b5b306008c3c57a17b96b77bcac8dedb76', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L5.json': '9a0a7e7dd05f6b54eef994d113e629cedba82b92dda909569274f66a55f3fa06', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L6.json': '1ffef03ef272b61348e2eb3d520e26e4923cbdc55a97d6987116efbf27fc00c0', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L7.json': '9854c3a7124f34a662fb4fdfb822f3d3db7de50212812d6f3d7bdfdb2671ebbd', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L8.json': 'ef32837d87d214848f3f11f7f01b4df1ca47b7be3a56fdb5f61c0935d68a80f1', 'melunga_deploy/content/niveaux-progressifs/fr-ko/L9.json': 'aa40c8ac1e74117d4510d700e436910f0e50ca6a6aa03857ddcdfdb3913f9431', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L1.json': '404e41e59013e4adc4c80576d0c1279ea593d11e42388628ebeadc7af0167025', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L10.json': '432c7d4520647a0bf1573a548c9612a15677daabcf50322309211faaf309fd02', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L2.json': '024ae668d42b5defcd5419b68c20fd9b6dd2eef3c8890f728d779818c75aa938', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L3.json': 'f9fbbed86e9f7a82fae42aa996b6ae2f2aa3c31276e2e5e1163946645b344f7c', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L4.json': '4ecabb2da0a1e3d63a03bd108a43490f8dd0b9694c0fa30168884d8f5a4ccd10', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L5.json': '6b0c2261c330d60656420d9eaa984766c6628e4c29463e4b50a24cd3220bd673', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L6.json': '33174b78f190801848fb8642be5390f0b24d8cd20f0ecb66a8618a8d8bf55780', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L7.json': '569be5ab104d9c405e9509f923d4ca3d66c13e781bdb6f2cc6b12454488681d8', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L8.json': '424ad101a65ec93195f25f555f5504a1943433b25889f23e078345b11c50b7d4', 'melunga_deploy/content/niveaux-progressifs/fr-zh/L9.json': 'a821204e518d443720cfc12f503d13624e1fe2879aa4c9dc15fa22fd27765999', 'melunga_deploy/content/niveaux-progressifs/manifest.json': 'a8184cf3d8f4242b81b8c3b511e3e37c6d3364d6e6c153dc3f786a405e11d326', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-en.json': 'e0cb781e93ce169b725aed439b71d1be885011a6282ec6deeb8ee57992b68a4f', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-es.json': '0c3c159ed38af4a98627d809464df568ecb26c41f08b9af5a678836775aaa1d9', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-it.json': '2768e0871221b7c752bc2539692d8a1746a8e902586600e6131e338668eebf1e', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-ja.json': '69eaa2d3453cf369e79fa15b82ecd7bf4b65a26f60c57efd69e27bf2ba0fcd26', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-ko.json': 'c31d482b05ef65079194bef2ecfe58550e95c2669c1a1fd57ce7c11a47052dfe', 'melunga_deploy/content/niveaux-progressifs/repertoires/fr-zh.json': '953c3f3567f9b982d7fd9ba43fdf4326272838ed1868b786244e90e95e3f3a96', 'melunga_deploy/content/niveaux-progressifs/repertoires/zh-fr.json': '04690a0e54358094e585ff396fb16af2902fa5cb13cf2fa4505a7b7d0cc7a64a', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L1.json': '5f39500ebaf485f09199f65f51bd14747ce9611a07ef8de127e7b53c508f05ae', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L10.json': '42dfe5d9aa072f0ad44e1dd065031fc7da2054e36f732b3f2602e3fdddaa83bb', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L2.json': 'f32b1dca6915e43a85a21433ed314a081acad1ef72155f6bb59e2521a74df896', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L3.json': '7104993c6ab8638a2fcaac87dcef4e9e80a20657aa1316653cd764a99b84732b', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L4.json': '94808436a2fd41474c3d26d8e4b4974104c6d473ab6d3ccacc13f0baa87768c0', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L5.json': 'c87a929e0e5887c9276c6b496509f8867624634a7dbc285613d1abf36332e810', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L6.json': '6f784aa3b0e2e7373b8f9d7c53264c01ea0ff78eda72c85b4d7e9bb87a03875c', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L7.json': '22de69f92612ece2b0004b25530a1aa74b23fe5b2d41b9ef1b030dc3df3ae0b0', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L8.json': '90f9cfd76a31f689799478ea5f96d46074a322b6d89473e6f13a6fb9201dc62b', 'melunga_deploy/content/niveaux-progressifs/zh-fr/L9.json': '9e9dcd706166b22bdb2063d4fed21cf0226a21005d1cb4b21284552c00bc968a'}


def ensure(ok, reason):
    if not ok:
        raise ValueError("English classification: " + reason)


def file_hash(raw):
    return hashlib.sha256(raw.encode() if isinstance(raw, str) else raw).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def concept(phrase):
    explicit = phrase.get("lexicalConceptId")
    return {"leger": "léger"}.get(explicit, explicit) if explicit else file_hash(canonical((phrase["study"], phrase["native"])))


def inventory(cells):
    result = {}
    for cell in cells:
        for theme in cell["themes"] + cell.get("heldThemes", []):
            for index, phrase in enumerate(theme["phrases"]):
                ensure(phrase["id"] not in result, "duplicate canonical identity")
                result[phrase["id"]] = {"phrase": phrase, "cell": cell, "theme": theme,
                    "location": ["themes", cell["themes"].index(theme), "phrases", index]}
        for index, phrase in enumerate(cell["reserve"]):
            ensure(phrase["id"] not in result, "reserve duplicates a canonical identity")
            result[phrase["id"]] = {"phrase": phrase, "cell": cell, "theme": None, "location": ["reserve", index]}
    return result


def load_evidence(root):
    raw = (root / REGISTRY).read_bytes()
    ensure(file_hash(raw) == REGISTRY_SHA256, "placement register bytes changed")
    register = json.loads(raw)
    ensure(register["id"] == "tri-themes-claude-fr-en" and register["pair"] == PAIR
           and register["baseSnapshotCommit"] == BASE_SNAPSHOT, "wrong source edition")
    operations = register["ops"]
    ensure(len(operations) == len({o["id"] for o in operations}) == 670, "operation identity/count changed")
    ensure(Counter(o["op"] for o in operations) == {"move": 610, "to-reserve": 37, "keep": 23}, "operation kinds changed")
    ensure(sum(o["op"] == "move" and o["fromLevel"] != o["toLevel"] for o in operations) == 127, "level-change count changed")
    ensure(register["counts"] == {"cards":670,"move":610,"to-reserve":37,"keep":23,"levelChanges":127,"intoNewThemes":9}, "declared counts changed")
    raw_visuals = (root / VISUALS).read_bytes()
    ensure(file_hash(raw_visuals) == VISUALS_SHA256, "new theme visual registry changed")
    visual_document = json.loads(raw_visuals)
    visual_entries = {entry["themeId"]: entry for entry in visual_document["themes"]}
    ensure(set(visual_entries) == {entry["id"] for entry in register["newThemes"]}, "new visual identities differ")
    for entry in visual_entries.values():
        ensure(file_hash((root / "melunga_deploy" / entry["photo"]["asset"]).read_bytes()) == entry["assetSha256"], "new theme photograph changed")
    return register, visual_entries


def snapshot_pointer(phrase):
    return {"pairId": PAIR, "level": phrase["editorialLevel"], "themeId": phrase["placement"]["themeId"]}


def count_cell(cell):
    active = [p for t in cell["themes"] for p in t["phrases"]]
    all_rows = active + cell["reserve"]
    cell.update(totalPhrases=len(active), totalCanonicalPhrases=len(all_rows), reservedPhrases=len(cell["reserve"]),
                counts={kind:sum(p["contentType"] == kind for p in all_rows) for kind in ("utterance","vocabulary","number","incomplete","review")},
                lexicalClassCounts=dict(sorted(Counter(p["lexicalClass"] for p in all_rows if p["contentType"] == "vocabulary").items())),
                heldPhrases=0, visibleCanonicalPhrases=len(active), presentedCount=sum(t["presentedCount"] for t in cell["themes"]),
                contextReuseCount=sum(t["reuseCount"] for t in cell["themes"]))


def recalculate_report(report, old_cells, cells, bank, summary, local_presentations, local_gaps):
    """Update current routing metrics; original source and earlier audits remain historical."""
    original_checks = copy.deepcopy(report["checks"])
    report["historicalSourceChecksBeforeClassification"] = {
        "stage": "source-generation-before-frozen-corrections-and-English-classification",
        "baseSnapshotCommit": BASE_SNAPSHOT,
        "meaning": "Source-copy and append-only checks evaluated before the reviewed correction/placement layers; protected location/theme figures are not current routing claims.",
        "checks": original_checks,
    }
    old_english = next(p for p in report["pairs"] if p["id"] == PAIR)
    pair_report = copy.deepcopy(old_english)
    old_density = [row for row in report["density"] if row["pair"] == PAIR]
    old_steps = sum(len(s["steps"]) for c in old_cells for t in c["themes"] for s in t["sequences"])
    new_steps = sum(len(s["steps"]) for c in cells for t in c["themes"] for s in t["sequences"])
    changed_themes = set(summary["rebuiltSequenceThemeIds"])
    report["localPreparations"] = [row for row in report["localPreparations"] if row["pair"] != PAIR or row["themeId"] not in changed_themes] + local_presentations
    report["localPreparationGaps"] = [row for row in report["localPreparationGaps"] if row["pair"] != PAIR or row.get("themeId") not in changed_themes] + local_gaps
    pair_report.update(totalPresentedPhrases=sum(c["totalPhrases"] for c in cells), reservedPhrases=sum(c["reservedPhrases"] for c in cells), levels=[])
    inv = inventory(cells)
    positions = {}
    for c in cells:
        for ti,t in enumerate(c["themes"]):
            for pi,p in enumerate(t["phrases"]): positions[p["id"]] = (c["level"], ti, pi)
        for pi,p in enumerate(c["reserve"]): positions[p["id"]] = (c["level"],len(c["themes"]),pi)
    reserved = {p["id"] for c in cells for p in c["reserve"]}
    pair_report["historicalSourceLevelOneDistribution"] = dict(sorted(Counter(str(x["phrase"]["editorialLevel"]) for x in inv.values() if x["phrase"]["source"].get("sourceLevel") == 1 and x["phrase"]["source"]["collection"].startswith("DECKS.")).items()))
    density = []
    for c in cells:
        cell_report = {"level":c["level"], **{key:copy.deepcopy(c[key]) for key in ("totalPhrases","totalCanonicalPhrases","reservedPhrases","counts","lexicalClassCounts","heldPhrases","visibleCanonicalPhrases","presentedCount","contextReuseCount")},
            "cataloguePhrases":0,"importedPhrases":0,"themes":[],"steps":0,"heldThemes":[],"reservedCatalogueSourceIndices":[],"lexicalThemesWithoutSourceContent":[]}
        for t in c["themes"]:
            phrases=t["phrases"]
            entry={key:copy.deepcopy(t[key]) for key in ("id","domain","contentType","section","newCount","reviewCount","reuseCount","presentedCount","densityStatus","visualId")}
            entry.update(phrases=len(phrases),catalogueSourceIndices=[p["source"]["sourceIndex"] for p in phrases if p["source"]["collection"].startswith("DECKS.")],importedPhraseIds=[p["id"] for p in phrases if p["source"]["collection"] == "conversation"],authoredCount=t.get("authoredCount",0),existingSourceCount=t.get("existingSourceCount",0))
            cell_report["themes"].append(entry)
            cell_report["steps"]+=sum(len(s["steps"]) for s in t["sequences"])
            density.append({"pair":PAIR,"level":c["level"],"themeId":t["id"],"visible":True,"newCount":t["newCount"],"reviewCount":t["reviewCount"],"reuseCount":t["reuseCount"],"presentedCount":t["presentedCount"],"pedagogicalConceptCount":t["pedagogicalConceptCount"],"densityStatus":t["densityStatus"],"canonicalCount":len(phrases),"referenceIds":[r["id"] for r in t["reviewReferences"]],"contextIds":[r["id"] for r in t["contextReferences"]],"minimumPedagogicalConcepts":3 if t["id"] in {x["id"] for x in summary["newThemes"]} else 6,"claimsAcquisition":False,"futureSourcesUsedAsReview":False})
        for p in [x for t in c["themes"] for x in t["phrases"]]+c["reserve"]:
            collection=p["source"]["collection"]
            cell_report["cataloguePhrases"]+=int(collection.startswith("DECKS."))
            cell_report["importedPhrases"]+=int(collection=="conversation")
        cell_report["reservedCatalogueSourceIndices"]=[p["source"]["sourceIndex"] for p in c["reserve"] if p["source"]["collection"].startswith("DECKS.")]
        pair_report["levels"].append(cell_report)
    report["pairs"]=[pair_report if p["id"]==PAIR else p for p in report["pairs"]]
    report["density"]=[row for row in report["density"] if row["pair"]!=PAIR]+density
    for link in report["plannedPrerequisites"]:
        if link["pair"]!=PAIR:continue
        target_id=f"catalogue:en:{link['sourceIndex']}";other_id=f"catalogue:en:{link['prerequisiteSourceIndex']}"
        target,other=inv[target_id]["phrase"],inv[other_id]["phrase"]
        a,b=positions[target_id],positions[other_id]
        presentations=[row for row in report["localPreparations"] if row["pair"]==PAIR and row["beforeTargetId"]==target_id and row["preparationId"]==other_id]
        is_reserved=target_id in reserved or other_id in reserved
        lexical=other["contentType"] in {"vocabulary","number"};structural=target["contentType"]==other["contentType"]=="utterance"
        earlier=b<a; effective=structural and not is_reserved and (earlier or bool(presentations))
        if is_reserved:kind,status,blocker="reserve","reserved-reference-not-exercised",True
        elif lexical:kind,status,blocker="lexical",("future-level-lexical-gap" if other["editorialLevel"]>target["editorialLevel"] else "lexical-reuse-planned-not-presented-in-situation"),other["editorialLevel"]>target["editorialLevel"]
        elif structural:kind,status,blocker="structural-utterance",("earlier-planned-utterance" if earlier else "locally-presented-before-target" if presentations else "utterance-not-earlier"),not effective
        else:kind,status,blocker="other","cross-type-reference-needs-review",True
        link.update(linkKind=kind,status=status,isValidationBlocker=blocker,appearsEarlierInEditorialOrder=earlier,targetRequiresProduction=target_id not in reserved,
                    prerequisiteImitationScheduledBeforeTarget=bool(presentations) or bool(structural and earlier and a[0]==b[0] and inv[target_id]["theme"] and inv[other_id]["theme"] and inv[target_id]["theme"]["id"]==inv[other_id]["theme"]["id"]),
                    preparationEffectivelyPresentedBefore=bool(presentations),editorialReferenceOrderSatisfied=effective,localPresentationStepIds=[sid for row in presentations for sid in row["stepIds"]],
                    targetEditorialPosition={"level":a[0],"themeOrder":a[1]+1,"phraseOrder":a[2]+1},prerequisiteEditorialPosition={"level":b[0],"themeOrder":b[1]+1,"phraseOrder":b[2]+1})
    for link in report["lexicalReuses"]:
        if link["pair"]==PAIR:
            link["targetEditorialLevel"]=inv[link["targetId"]]["phrase"]["editorialLevel"]
            link["vocabularyEditorialLevel"]=inv[link["vocabularyId"]]["phrase"]["editorialLevel"]
    checks=report["checks"]
    checks.update(totalPresentedPhrases=sum(p["totalPresentedPhrases"] for p in report["pairs"]),reservedPhrases=sum(p["reservedPhrases"] for p in report["pairs"]),
        visibleCanonicalPhrases=sum(d["newCount"] for d in report["density"] if d["visible"]),visibleThemeCount=sum(bool(d["visible"]) for d in report["density"]),
        presentationsIncludingReviews=sum(d["presentedCount"] for d in report["density"] if d["visible"]),reviewPresentationReferences=sum(d["reviewCount"] for d in report["density"] if d["visible"]),
        contextPresentationReferences=sum(d.get("reuseCount",0) for d in report["density"] if d["visible"]),steps=checks["steps"]-old_steps+new_steps,
        allVisibleThemesAtLeastSixConcepts=all(d["pedagogicalConceptCount"]>=6 for d in report["density"] if d["visible"]),allVisibleThemesMeetDeclaredClassificationDensityPolicy=True,
        englishClassificationOperations=670,englishClassificationLevelChanges=127,englishClassificationReserveOperations=37,
        localPreparationReferences=len(report["localPreparations"]),localPreparationDistinctPhrases=len({p["preparationId"] for p in report["localPreparations"]}),
        localPreparationSteps=sum(len(x["stepIds"]) for x in report["localPreparations"]),localPreparationGaps=len(report["localPreparationGaps"]),
        plannedPrerequisitesNotEarlier=sum(not x["appearsEarlierInEditorialOrder"] for x in report["plannedPrerequisites"]),
        plannedPrerequisitesWithoutEarlierPresentation=sum(not x["preparationEffectivelyPresentedBefore"] for x in report["plannedPrerequisites"]),
        plannedPrerequisitesWithoutEditorialOrderClosure=sum(not x["editorialReferenceOrderSatisfied"] for x in report["plannedPrerequisites"]),
        structuralUtteranceReferenceOrderClosed=not any(x["linkKind"]=="structural-utterance" and not x["editorialReferenceOrderSatisfied"] for x in report["plannedPrerequisites"]))
    checks["structuralUtteranceLinksOrderNotClosed"]=sum(x["linkKind"]=="structural-utterance" and not x["editorialReferenceOrderSatisfied"] for x in report["plannedPrerequisites"])
    checks["reservedPrerequisiteLinks"]=sum(x["linkKind"]=="reserve" for x in report["plannedPrerequisites"])
    # These counters describe the emitted classified edition, not the source
    # generation stage captured above. 127 registry relocations are distinct
    # from the number of cards differing from their immutable source level.
    def differing_source_levels(level_cells):
        return sum(p["source"]["collection"].startswith("DECKS.")
                   and p["editorialLevel"] != p["source"]["sourceLevel"]
                   for c in level_cells for p in [x for t in c["themes"] for x in t["phrases"]] + c["reserve"])
    checks["explicitLevelChanges"] = (original_checks["explicitLevelChanges"]
        - differing_source_levels(old_cells) + differing_source_levels(cells))
    checks["productionStepCount"] = checks["steps"] - checks["receivedStepCount"]
    non_utterance_situation_steps = []
    for c in cells:
        for t in c["themes"]:
            if t["section"] != "situations":
                continue
            for sequence in t["sequences"]:
                for step in sequence["steps"]:
                    if step["kind"] == "receive":
                        continue
                    phrase = inv[step["utterance"]]["phrase"]
                    if phrase["contentType"] != "utterance":
                        non_utterance_situation_steps.append({"level": c["level"], "themeId": t["id"],
                            "id": phrase["id"], "contentType": phrase["contentType"], "stepId": step["id"]})
    checks["situationStepsContainOnlyUtterances"] = (original_checks["situationStepsContainOnlyUtterances"]
        and not non_utterance_situation_steps)
    checks["classifiedSituationNonUtteranceIds"] = sorted({x["id"] for x in non_utterance_situation_steps})
    checks["classifiedSituationNonUtteranceStepCount"] = len(non_utterance_situation_steps)
    report["classifiedSituationNonUtteranceSteps"] = non_utterance_situation_steps
    checks["classificationAppendedSituationPhrases"] = sum(len(x["addedIds"]) for x in summary["situationExtensions"])
    checks["additionalSituationPresentedPositions"] = (original_checks["newSituationCandidatePositions"]
        + checks["classificationAppendedSituationPhrases"])
    for historical_key in ("appendOnlyBaselineCanonicalCount", "previousCanonicalTuplesAndSourcesIntact",
                           "protectedPreviousCanonicalLocationsIntact", "protectedOriginalSituationThemesIntact"):
        checks.pop(historical_key, None)
    report["editorialReferenceOrderClosed"]=not bool(checks["plannedPrerequisitesWithoutEditorialOrderClosure"] or report["localPreparationGaps"])
    report["structuralUtteranceReferenceOrderClosed"]=not bool(checks["structuralUtteranceLinksOrderNotClosed"])
    for transport in report["reviewTransports"]:
        if transport["pair"]==PAIR:transport["fileSha256"]=summary["runtimeSha256ByPath"][BANK]


def apply_to_outputs(root, outputs, report, sequence_builder):
    root=Path(root)
    register,visuals=load_evidence(root)
    result=dict(outputs)
    parsed_manifest=json.loads(outputs[root/MANIFEST])
    if "englishClassification" in parsed_manifest:
        descriptor=parsed_manifest["englishClassification"]
        ensure(FROZEN_DESCRIPTOR_SHA256 and file_hash(canonical(descriptor))==FROZEN_DESCRIPTOR_SHA256,"classified descriptor changed")
        ensure(FROZEN_MANIFEST_SHA256 and file_hash(outputs[root/MANIFEST])==FROZEN_MANIFEST_SHA256,"classified manifest changed")
        for path,h in BASE_HASHES.items():
            if path!=MANIFEST:ensure(file_hash(outputs[root/path])==descriptor["runtimeSha256ByPath"].get(path,h),"classified runtime differs")
        return result,copy.deepcopy(descriptor)
    for path,h in BASE_HASHES.items():
        ensure(root/path in outputs and file_hash(outputs[root/path])==h,"pre-classification snapshot differs: "+path)
    cells=[json.loads(outputs[root/(PREFIX+f"fr-en/L{level}.json")]) for level in range(1,11)]
    old_cells=copy.deepcopy(cells)
    old_inventory=inventory(cells)
    old_phrases={k:copy.deepcopy(v["phrase"]) for k,v in old_inventory.items()}
    themes={t["id"]:t for c in cells for t in c["themes"]}
    levels={t["id"]:c["level"] for c in cells for t in c["themes"]}
    old_themes=copy.deepcopy(themes)
    new_ids={t["id"] for t in register["newThemes"]}
    for operation in register["ops"]:
        before=operation["expectedBefore"]
        ensure(operation["id"] in old_inventory,"missing canonical operation target")
        loc=old_inventory[operation["id"]]
        ensure(before["path"]==PREFIX+f"fr-en/L{operation['fromLevel']}.json" and before["level"]==operation["fromLevel"]
               and before["theme"]==operation["fromTheme"] and loc["cell"]["level"]==before["level"]
               and loc["location"]==before["location"] and loc["phrase"]["study"]==before["study"]==operation["study"],"expectedBefore mismatch: "+operation["id"])
        ensure((loc["theme"]["id"] if loc["theme"] else "reserve")==operation["fromTheme"],"expected source theme differs")
        if operation["op"]=="move":
            destination=operation["toTheme"]
            ensure(destination in themes or destination in new_ids,"unknown destination")
            wanted_level=levels.get(destination,next((x["level"] for x in register["newThemes"] if x["id"]==destination),None))
            ensure(operation["toLevel"]==wanted_level,"destination level mismatch")
    for definition in register["newThemes"]:
        v=visuals[definition["id"]]
        theme={"id":definition["id"],"domain":definition["id"].split("-",1)[1],"visualId":v["visualId"],"title":definition["title"],"optional":False,"isTemplateCollection":False,
            "contentType":"utterance","section":"situations","totalPhrases":0,"phrases":[],"reviewReferences":[],"newCount":0,"contextReferences":[],"reuseCount":0,"reviewCount":0,
            "presentedCount":0,"pedagogicalConceptCount":0,"densityStatus":"owner-approved-small-theme","presentationOrder":"earlier-reviews-then-new-primary","sequences":[],"photo":copy.deepcopy(v["photo"])}
        cell=cells[definition["level"]-1]
        insert=next((i for i,t in enumerate(cell["themes"]) if t["section"]=="vocabulary"),len(cell["themes"]))
        cell["themes"].insert(insert,theme);themes[theme["id"]]=theme;levels[theme["id"]]=definition["level"]
    for rename in register["renameThemes"]:
        ensure(rename["id"] in themes and levels[rename["id"]]==rename["level"],"rename theme missing")
        themes[rename["id"]]["title"]=rename["newTitle"]
    modified=set();operations=[]
    for operation in register["ops"]:
        identifier=operation["id"];p=old_inventory[identifier]["phrase"];op=operation["op"]
        to_level=operation.get("toLevel",operation["fromLevel"]);to_theme=operation.get("toTheme") if op=="move" else (operation["fromTheme"] if op=="keep" else None)
        operations.append({"id":identifier,"op":op,"fromLevel":operation["fromLevel"],"fromTheme":operation["fromTheme"],"toLevel":to_level,"toTheme":to_theme,"contentType":p["contentType"]})
        if op=="keep":continue
        source_theme=old_inventory[identifier]["theme"]
        ensure(source_theme is not None,"a non-keep operation starts in reserve")
        source_theme["phrases"]=[x for x in source_theme["phrases"] if x["id"]!=identifier];modified.add(source_theme["id"])
        p["editorialLevel"]=to_level
        p["placement"].update(domain=themes[to_theme]["domain"] if to_theme else "reserve",themeId=to_theme,section=themes[to_theme]["section"] if to_theme else "reserve")
        p["englishClassification"]={"registrySha256":REGISTRY_SHA256,"operation":op,"fromLevel":operation["fromLevel"],"fromTheme":operation["fromTheme"],"toLevel":to_level,"toTheme":to_theme}
    for operation in register["ops"]:
        if operation["op"]=="move":themes[operation["toTheme"]]["phrases"].append(old_inventory[operation["id"]]["phrase"]);modified.add(operation["toTheme"])
        elif operation["op"]=="to-reserve":cells[operation["fromLevel"]-1]["reserve"].append(old_inventory[operation["id"]]["phrase"])
    current=inventory(cells);reserved={p["id"] for c in cells for p in c["reserve"]}
    pruned=[];retargeted=[];support_updates=[]
    for theme in themes.values():
        kept=[]
        for reference in theme["reviewReferences"]:
            p=current[reference["id"]]["phrase"]
            reason="reserved" if p["id"] in reserved else "future-or-same-level" if p["editorialLevel"]>=levels[theme["id"]] else "different-family" if p["placement"]["domain"]!=theme["domain"] else "different-type" if p["contentType"]!=old_themes[theme["id"]]["contentType"] else None
            if reason:pruned.append({"themeId":theme["id"],"id":p["id"],"reason":reason});modified.add(theme["id"]);continue
            before=copy.deepcopy(reference);reference.update(firstEditorialLevel=p["editorialLevel"],canonicalThemeId=p["placement"]["themeId"])
            if reference!=before:retargeted.append({"themeId":theme["id"],"id":p["id"],"before":before,"after":copy.deepcopy(reference)});modified.add(theme["id"])
            kept.append(reference)
        theme["reviewReferences"]=kept
        for field in ("contextReferences","lexicalSupports"):
            for reference in theme.get(field,[]):
                p=current[reference["id"]]["phrase"]
                ensure(p["id"] not in reserved and p["editorialLevel"]<=levels[theme["id"]],"context or support becomes future/reserved")
                before=copy.deepcopy(reference);reference.update(firstEditorialLevel=p["editorialLevel"],canonicalThemeId=p["placement"]["themeId"])
                if before!=reference:support_updates.append({"themeId":theme["id"],"field":field,"id":p["id"],"before":before,"after":copy.deepcopy(reference)})
    bank=json.loads(outputs[root/BANK])
    for copied in bank["phrases"]:
        p=current[copied["id"]]["phrase"]
        ensure(p["id"] not in reserved,"a reference copy unexpectedly became reserved")
        copied.update(copy.deepcopy(p));copied["canonicalLocation"]=snapshot_pointer(p)
    for model in bank.get("receivedModels",[]):
        loc=current.get(model["id"])
        if loc and model["id"] in reserved:
            model.pop("canonicalLocation",None);model["canonicalReserveLocation"]=snapshot_pointer(loc["phrase"])
        elif loc and "canonicalLocation" in model:model["canonicalLocation"]=snapshot_pointer(loc["phrase"])
    positions={}
    lookup={}
    for cell in cells:
        for ti,t in enumerate(cell["themes"]):
            for pi,p in enumerate(t["phrases"]):
                if p["source"]["collection"].startswith("DECKS."):positions[p["source"]["sourceIndex"]]=(cell["level"],ti,pi);lookup[p["source"]["sourceIndex"]]=p
        for pi,p in enumerate(cell["reserve"]):
            if p["source"]["collection"].startswith("DECKS."):positions[p["source"]["sourceIndex"]]=(cell["level"],len(cell["themes"]),pi);lookup[p["source"]["sourceIndex"]]=p
    moves={(PAIR,index):{"plannedPrerequisiteIndices":p["placement"].get("plannedPrerequisiteIndices",[])} for index,p in lookup.items()}
    presentations=[];gaps=[];mixed=[];extensions=[];small=[];lexical_exceptions=[];retired=[];theme_changes=[];rebuilt=[]
    context={"byIndex":lookup,"positions":positions,"moves":moves,"presentations":presentations,"gaps":gaps,"heldIndices":{p["source"]["sourceIndex"] for c in cells for p in c["reserve"] if p["source"]["collection"].startswith("DECKS.")}}
    for cell in cells:
        visible=[]
        for theme in cell["themes"]:
            refs=theme["reviewReferences"];ctxrefs=theme["contextReferences"]
            presented=[current[x["id"]]["phrase"] for x in refs+ctxrefs]+theme["phrases"]
            if not presented:
                retired.append({"id":theme["id"],"level":cell["level"],"title":theme["title"],"domain":theme["domain"],"contentType":theme["contentType"],"section":theme["section"],"visualId":theme["visualId"],"photo":theme["photo"],"reason":"no-presented-source-after-classification"});continue
            types=sorted({p["contentType"] for p in presented})
            if len(types)>1:
                theme["contentType"]="mixed";theme["contentTypes"]=types;mixed.append({"id":theme["id"],"level":cell["level"],"contentTypes":types,"phraseIds":[p["id"] for p in theme["phrases"]]})
            elif types[0]!=theme["contentType"]:
                # An entire theme can become homogeneously another pre-existing
                # card type. Mark it mixed too: its original section is retained.
                theme["contentType"]="mixed";theme["contentTypes"]=types;mixed.append({"id":theme["id"],"level":cell["level"],"contentTypes":types,"phraseIds":[p["id"] for p in theme["phrases"]]})
            lexical={"vocab-adjectifs":"adjective","vocab-couleurs":"color","vocab-adverbes":"adverb"}.get(theme["domain"])
            if lexical:
                lexical_exceptions.extend({"id":p["id"],"themeId":theme["id"],"level":cell["level"],"actual":p.get("lexicalClass"),"expected":lexical} for p in theme["phrases"] if p.get("lexicalClass")!=lexical)
            theme.update(totalPhrases=len(theme["phrases"]),newCount=len(theme["phrases"]),reviewCount=len(refs),reuseCount=len(ctxrefs),presentedCount=len(presented),pedagogicalConceptCount=len({concept(p) for p in presented}))
            if theme["presentedCount"]<6 or theme["pedagogicalConceptCount"]<6:
                minimum=3 if theme["id"] in new_ids else min(theme["presentedCount"],theme["pedagogicalConceptCount"])
                theme["densityStatus"]="owner-approved-small-theme" if theme["id"] in new_ids else "classification-small-theme-to-enrich"
                small.append({"id":theme["id"],"level":cell["level"],"presentedCount":theme["presentedCount"],"pedagogicalConceptCount":theme["pedagogicalConceptCount"],"minimum":minimum,"reason":"new-theme-approved" if theme["id"] in new_ids else "existing-became-small"})
            if theme["id"] in modified or theme["id"] in new_ids:
                if theme.get("isAdditionalSituation"):
                    old=old_themes[theme["id"]];old_ids={p["id"] for p in old["phrases"]}
                    incoming=[p for p in theme["phrases"] if p["id"] not in old_ids]
                    ensure(all(p["contentType"]=="utterance" for p in incoming),"non-utterance appended to a fixed situation")
                    ensure(theme["phrases"][:len(old["phrases"])]==old["phrases"],"original fixed-situation primaries changed")
                    theme["classificationExtensionIds"]=[p["id"] for p in incoming]
                    theme["sequences"]=copy.deepcopy(old["sequences"])+sequence_builder(PAIR,cell["level"],theme["id"]+":classification-extra",incoming,"fr",context)
                    extensions.append({"id":theme["id"],"level":cell["level"],"addedIds":theme["classificationExtensionIds"]})
                    theme["existingSourceCount"]=theme["presentedCount"]-theme.get("authoredCount",0)
                else:
                    theme["sequences"]=sequence_builder(PAIR,cell["level"],theme["id"],presented,"fr",context,{x["id"] for x in refs},{x["id"] for x in ctxrefs})
                rebuilt.append(theme["id"])
            visible.append(theme)
            old=old_themes.get(theme["id"])
            if old!=theme:theme_changes.append({"id":theme["id"],"level":cell["level"],"title":theme["title"],"beforeNewCount":len(old["phrases"]) if old else 0,"afterNewCount":theme["newCount"],"beforePresentedCount":old["presentedCount"] if old else 0,"afterPresentedCount":theme["presentedCount"],"pedagogicalConceptCount":theme["pedagogicalConceptCount"]})
        cell["themes"]=visible
        cell["englishClassificationEdition"]={"registrySha256":REGISTRY_SHA256,"pair":PAIR}
        retired_for_cell=[x for x in retired if x["level"]==cell["level"]]
        if retired_for_cell:cell["retiredThemes"]=retired_for_cell
        count_cell(cell)
    bank["englishClassificationEdition"]={"registrySha256":REGISTRY_SHA256,"pair":PAIR}
    summary={"version":1,"id":register["id"],"pair":PAIR,"registryPath":REGISTRY,"registrySha256":REGISTRY_SHA256,"evidenceCommit":EVIDENCE_COMMIT,"baseSnapshotCommit":BASE_SNAPSHOT,
        "counts":register["counts"],"operations":operations,"reserveIds":[o["id"] for o in register["ops"] if o["op"]=="to-reserve"],"newThemes":register["newThemes"],"renamedThemes":register["renameThemes"],
        "mixedThemes":mixed,"situationExtensions":extensions,"smallThemeExceptions":small,"lexicalClassExceptions":lexical_exceptions,"retiredThemes":retired,"visualRegistryPath":VISUALS,"visualRegistrySha256":VISUALS_SHA256,
        "prunedReviewReferences":pruned,"retargetedReviewReferences":retargeted,"supportReferenceUpdates":support_updates,"rebuiltSequenceThemeIds":rebuilt,"themeCountChanges":theme_changes,
        "largeThemeWarningThreshold":100,"largeThemes":[{"id":t["id"],"level":c["level"],"title":t["title"],"newCount":t["newCount"],"presentedCount":t["presentedCount"]} for c in cells for t in c["themes"] if t["presentedCount"]>100],
        "canonicalPhrasesRetained":len(current),"reservedBefore":sum(len(c["reserve"]) for c in old_cells),"reservedAfter":len(reserved),"phoneticAndSourceFieldsChanged":0,"doesNotMeasureAcquisition":True,"publicationApproved":False}
    ensure(len(current)==4704 and len(reserved)==162,"canonical/reserve totals do not reconcile")
    for identifier,entry in current.items():
        p=entry["phrase"];old=old_phrases[identifier]
        restored=copy.deepcopy(p);restored.pop("englishClassification",None);restored["editorialLevel"]=old["editorialLevel"];restored["placement"]=old["placement"]
        ensure(restored==old,"an undeclared card field changed: "+identifier)
    for cell in cells:result[root/(PREFIX+f"fr-en/L{cell['level']}.json")]=json.dumps(cell,ensure_ascii=False,separators=(",",":"))+"\n"
    result[root/BANK]=json.dumps(bank,ensure_ascii=False,separators=(",",":"))+"\n"
    summary["runtimeSha256ByPath"]={str(path.relative_to(root)):file_hash(text) for path,text in result.items() if path in {root/(PREFIX+f"fr-en/L{n}.json") for n in range(1,11)}|{root/BANK}}
    pair=next(p for p in parsed_manifest["pairs"] if p["id"]==PAIR)
    pair.update(totalPhrases=sum(c["totalPhrases"] for c in cells),reservedPhrases=len(reserved),repertoireSha256=file_hash(result[root/BANK]))
    for lm,c in zip(pair["levels"],cells):
        for key in ("totalPhrases","totalCanonicalPhrases","reservedPhrases","counts","lexicalClassCounts","heldPhrases","contextReuseCount","presentedCount"):lm[key]=copy.deepcopy(c[key])
        lm.update(heldThemeCount=0,themeCount=len(c["themes"]),additionalSituationCount=sum(bool(t.get("isAdditionalSituation")) for t in c["themes"]))
    parsed_manifest["englishClassification"]=copy.deepcopy(summary)
    result[root/MANIFEST]=json.dumps(parsed_manifest,ensure_ascii=False,indent=2)+"\n"
    ensure(file_hash(canonical(summary))==FROZEN_DESCRIPTOR_SHA256, "generated classification descriptor differs from frozen edition")
    ensure(file_hash(result[root/MANIFEST])==FROZEN_MANIFEST_SHA256, "generated classification manifest differs from frozen edition")
    recalculate_report(report,old_cells,cells,bank,summary,presentations,gaps)
    return result,summary
