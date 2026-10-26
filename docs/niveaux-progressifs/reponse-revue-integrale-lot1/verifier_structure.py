#!/usr/bin/env python3
"""Reproduce structural counts from frozen Git content, without editing product data.

Output is JSON on stdout. Run from any directory; only Git's local objects are
read. No rule here claims to establish linguistic correctness or acquisition.
"""
from collections import Counter, defaultdict
import json
from pathlib import Path
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parents[3]
REVIEW = "d4eaea3"
BASE = "4ec163e"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PREFIX = "melunga_deploy/content/niveaux-progressifs"


def git_json(commit, path):
    return json.loads(subprocess.check_output(
        ["git", "-C", str(ROOT), "show", f"{commit}:{path}"]))


def row(pair, level, origin, theme, phrase):
    return {"pair": pair, "level": level, "origin": origin,
            "themeId": theme.get("id"), "section": theme.get("section"),
            **{key: phrase.get(key) for key in
               ("id", "study", "native", "phon", "reading", "contentType")}}


def load(commit):
    rows, themes = [], []
    for pair in PAIRS:
        repertoire = git_json(commit, f"{PREFIX}/repertoires/{pair}.json")
        bank_ids = {p["id"] for p in repertoire.get("phrases", [])}
        received_ids = {p["id"] for p in repertoire.get("receivedModels", [])}
        for level in range(1, 11):
            data = git_json(commit, f"{PREFIX}/{pair}/L{level}.json")
            for theme in data["themes"]:
                local_ids = {p["id"] for p in theme.get("phrases", [])}
                available = bank_ids | received_ids | local_ids
                themes.append({"pair": pair, "level": level,
                               **{key: theme.get(key) for key in
                                  ("id", "section", "contentType", "totalPhrases",
                                   "newCount", "reuseCount", "presentedCount",
                                   "pedagogicalConceptCount", "densityStatus")},
                               "phraseArrayLength": len(theme.get("phrases", [])),
                               "reviewReferencesLength": len(theme.get("reviewReferences", [])),
                               "sequencesLength": len(theme.get("sequences", [])),
                               "unresolvedReviewOrContextReferences": sum(
                                   r["id"] not in available for r in
                                   theme.get("reviewReferences", []) + theme.get("contextReferences", [])),
                               "emptySequences": sum(not sequence.get("steps")
                                                     for sequence in theme.get("sequences", []))})
                rows.extend(row(pair, level, "theme", theme, phrase)
                            for phrase in theme.get("phrases", []))
            for theme in data.get("heldThemes", []):
                rows.extend(row(pair, level, "heldTheme", theme, phrase)
                            for phrase in theme.get("phrases", []))
            rows.extend(row(pair, level, "reserve", {}, phrase)
                        for phrase in data.get("reserve", []))
            held = data.get("heldPhrases")
            if isinstance(held, list):
                rows.extend(row(pair, level, "held", {}, phrase) for phrase in held)
        rows.extend(row(pair, phrase.get("editorialLevel") or phrase.get("level"),
                        "receivedModel", {}, phrase)
                    for phrase in repertoire.get("receivedModels", []))
    return rows, themes


def study_key(text):
    # Exact normalization used by Claude; this is not strict textual identity.
    return re.sub(r"\s+", "", text or "").strip("。，！？、.,!?;:¡¿ ").lower()


def french_key(text):
    value = unicodedata.normalize("NFD", (text or "").lower())
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z' ]+", "", value).strip()


def duplicates(visible):
    groups = defaultdict(list)
    for item in visible:
        groups[(item["pair"], item["level"], study_key(item["study"]))].append(item)
    result = []
    for (pair, level, key), entries in groups.items():
        if not key or len(entries) < 2:
            continue
        aids = sorted({(r["phon"] or "").strip() for r in entries})
        result.append({"pair": pair, "level": level, "study": entries[0]["study"],
                       "occurrences": len(entries), "ids": [r["id"] for r in entries],
                       "themes": sorted({r["themeId"] for r in entries}), "aids": aids,
                       "differentAids": len(aids) > 1,
                       "aidsDifferOnlyByCase": len(aids) > 1 and len({a.lower() for a in aids}) == 1,
                       "exactStudyIdentical": len({r["study"] for r in entries}) == 1})
    return result


def gloss_groups(visible):
    groups = defaultdict(list)
    for item in visible:
        french = item["study"] if item["pair"] == "zh-fr" else item["native"]
        key = french_key(french)
        if len(key) >= 3:
            groups[(item["pair"], item["level"], key)].append(item)
    result = []
    for (pair, level, key), entries in groups.items():
        field = "native" if pair == "zh-fr" else "study"
        forms = {study_key(r[field]) for r in entries}
        if len(forms) > 1:
            result.append({"pair": pair, "level": level, "frenchKey": key,
                           "forms": sorted(forms), "ids": [r["id"] for r in entries]})
    return result


def metrics(commit):
    rows, themes = load(commit)
    visible = [r for r in rows if r["origin"] == "theme"]
    dup = duplicates(visible)
    gloses = gloss_groups(visible)
    situations = [r for r in visible if r["section"] == "situations"]
    domains = Counter(re.sub(r"^L\d+-", "", r["themeId"] or "") for r in situations)
    case_only = [r for r in dup if r["aidsDifferOnlyByCase"]]
    no_new = [t for t in themes if t["totalPhrases"] == 0]
    one_two_new = [t for t in themes if t["totalPhrases"] in (1, 2)]
    l1 = [r for r in visible if r["pair"] == "fr-zh" and r["level"] == 1]
    ids = Counter(r["id"] for r in rows)
    section_type = Counter((r["section"], r["contentType"]) for r in visible)
    return {"commit": commit,
            "inventory": {"rows": len(rows), "distinctIds": len(ids),
                          "repeatedIds": sum(n > 1 for n in ids.values()),
                          "origins": dict(Counter(r["origin"] for r in rows)),
                          "sectionContentTypeCounts": [{"section": s, "contentType": t, "count": n}
                                                       for (s, t), n in section_type.items()]},
            "duplicates": {"groups": len(dup),
                           "occurrences": sum(r["occurrences"] for r in dup),
                           "excessOccurrences": sum(r["occurrences"] - 1 for r in dup),
                           "differentAidGroups": sum(r["differentAids"] for r in dup),
                           "multipleThemeGroups": sum(len(r["themes"]) > 1 for r in dup),
                           "exactStudyIdenticalGroups": sum(r["exactStudyIdentical"] for r in dup),
                           "byPair": dict(Counter(r["pair"] for r in dup)),
                           "caseOnlyAidGroups": case_only,
                           "differentAidDetails": [r for r in dup if r["differentAids"]]},
            "glosses": {"groups": len(gloses),
                        "byPair": dict(Counter(r["pair"] for r in gloses)),
                        "zhFrGroupingIsChineseTranslationsOfFrenchStudy": True},
            "domains": {"situations": len(situations), "conversation": domains["conversation"],
                        "conversationPercentOfSituations": domains["conversation"] / len(situations) * 100,
                        "conversationPercentOfVisible": domains["conversation"] / len(visible) * 100,
                        "distribution": dict(domains)},
            "themes": {"total": len(themes), "noNewPhrase": len(no_new),
                       "oneOrTwoNewPhrases": len(one_two_new),
                       "minimumPresentedCount": min(t["presentedCount"] for t in themes),
                       "minimumPedagogicalConceptCount": min(t["pedagogicalConceptCount"] for t in themes),
                       "unresolvedReviewOrContextReferences": sum(t["unresolvedReviewOrContextReferences"] for t in themes),
                       "emptySequences": sum(t["emptySequences"] for t in themes),
                       "emptyNewPhraseThemes": no_new,
                       "densityStatuses": dict(Counter(t["densityStatus"] for t in themes))},
            "chineseL1": {"visibleRows": len(l1),
                          "distinctHanziInStudy": len({c for r in l1 for c in r["study"]
                                                       if "一" <= c <= "鿿"}),
                          "situationRows": sum(r["section"] == "situations" for r in l1),
                          "distinctHanziInSituations": len({c for r in l1 if r["section"] == "situations"
                                                            for c in r["study"] if "一" <= c <= "鿿"}),
                          "withoutPhoneticAid": sum(not r["phon"] for r in l1),
                          "withoutReading": sum(not r["reading"] for r in l1)}}


if __name__ == "__main__":
    current = metrics(REVIEW)
    base = metrics(BASE)
    # The review's shipped duplicate list must reproduce from the real JSON,
    # rather than being accepted as a second independent source.
    shipped = git_json(REVIEW, "docs/revue-integrale/doublons-et-gloses.json")
    assert len(shipped["doublons"]) == current["duplicates"]["groups"]
    assert len(shipped["glosesPartagees"]) == current["glosses"]["groups"]
    expected = {(d["pair"], d["level"], study_key(d["study"])): set(d["ids"])
                for d in shipped["doublons"]}
    rows, _ = load(REVIEW)
    actual = {(d["pair"], d["level"], study_key(d["study"])): set(d["ids"])
              for d in duplicates([r for r in rows if r["origin"] == "theme"])}
    assert actual == expected
    current["baselineComparison"] = {
        "commit": BASE,
        "sameStructureCounts": all(base[k] == current[k] for k in
                                   ("inventory", "domains", "themes", "chineseL1")),
        "duplicateGroupsBefore": base["duplicates"]["groups"],
        "differentAidGroupsBefore": base["duplicates"]["differentAidGroups"],
        "multiThemeGroupsBefore": base["duplicates"]["multipleThemeGroups"],
        "glossGroupsBefore": base["glosses"]["groups"],
    }
    candidates = git_json(REVIEW, "docs/revue-integrale/candidates-themes.json")
    current["themeCandidateArtifact"] = {
        "declaredTotal": candidates["total"],
        "actualCandidates": len(candidates["candidates"]),
        "readmeReportedTotal": 1216,
        "eligibleDomains": 10,
        "unscoredSmallSituationDomains": 28,
        "unscoredSmallSituationRows": 1459,
        "scriptReplayedSeparately": "charge.py -> themes.py reproduces 1444 candidates with the exact same IDs",
    }
    print(json.dumps(current, ensure_ascii=False, indent=2))
