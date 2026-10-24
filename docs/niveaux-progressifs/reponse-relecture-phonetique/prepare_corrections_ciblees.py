#!/usr/bin/env python3
"""Prepare whole-aid proposals for Claude; never modify content or runtime files.

The fixed lot is compared with its real files, not with a reconstructed lexicon.
Use --check to verify this proposal and the unchanged-source preconditions.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = "90a343391807b5a62ef1f140ce40075c53b7d9d8"
REVIEW = "295adf3"
OUTPUT = HERE / "corrections-ciblees-proposees.json"


def sha(value):
    return hashlib.sha256(value).hexdigest()


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def names(prefix):
    return git("ls-tree", "-r", "--name-only", BASE, "--", prefix).decode().splitlines()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source_files = sorted(name for prefix in [
        "docs/niveaux-progressifs/enrichissement-situations",
        "docs/niveaux-progressifs/corrections-themes",
    ] for name in names(prefix) if name.endswith(".json"))
    assert len(source_files) == 87, "The reviewed source scope changed."
    protected = sorted(set(source_files + [name for name in names(
        "melunga_deploy/content/niveaux-progressifs") if name.endswith(".json")] + [
        "melunga_deploy/app.html", "melunga_deploy/maquette-guidee.js",
        "melunga_deploy/maquette-guidee.css", "melunga_deploy/maquette-guidee.html",
        "melunga_deploy/parcours-niveaux.html",
    ]))
    fingerprints = {}
    for name in protected:
        original = git("show", BASE + ":" + name)
        assert (ROOT / name).read_bytes() == original, "Changed source: " + name
        fingerprints[name] = sha(original)
    proposals = []
    for name in source_files:
        document = json.loads((ROOT / name).read_text())
        if not isinstance(document, dict):
            continue
        for bucket in ["items", "receivedTurns", "lexicalSupports", "entries", "introductions"]:
            for index, row in enumerate(document.get(bucket) or []):
                if not isinstance(row, dict) or row.get("phoneticReviewStatus") != "pending-Claude":
                    continue
                pair = row.get("pair") or document.get("pair")
                study, before = row.get("study", ""), row.get("phon", "")
                if pair == "zh-fr" and re.search(r"\bles\b", study, re.I):
                    # Only the standalone aid for 'les': never the same glyph
                    # inside plaît, téléphone, délai, à l'aise, etc.
                    occurrence_count = len(re.findall(r"\bles\b", study, re.I))
                    pattern = r"(?<![\u4e00-\u9fff])莱(?![\u4e00-\u9fff])"
                    assert len(re.findall(pattern, before)) == occurrence_count, row["id"]
                    after = re.sub(pattern, "雷", before)
                    rule = "zh-fr-les-lei"
                    explanation = "雷 plutôt que 莱 pour le mot français les ; la phrase entière reste proposée à Claude."
                elif pair == "fr-zh" and any(char in study for char in "预愉") and (
                        "yu-kouaï" in before or "yu-yué" in before):
                    occurrence_count = 1
                    after = before.replace("yu-kouaï", "u-kouaï").replace("yu-yué", "u-yué")
                    rule = "fr-zh-yu-without-extra-glide"
                    explanation = "u pour 预/愉 ; la graphie de 约 (yué) est laissée explicitement à trancher séparément."
                else:
                    continue
                assert before != after
                proposals.append({
                    "pair": pair, "file": name, "pointer": f"/{bucket}/{index}",
                    "id": row["id"], "study": study, "native": row.get("native"),
                    "reading": row.get("reading"), "phonBefore": before, "phonProposed": after,
                    "rule": rule, "occurrences": occurrence_count,
                    "entryBeforeSha256": sha(json.dumps(row, ensure_ascii=False, sort_keys=True,
                        separators=(",", ":")).encode()),
                    "reviewStatus": "proposed-pending-Claude", "reason": explanation,
                })
    french = [row for row in proposals if row["pair"] == "zh-fr"]
    mandarin = [row for row in proposals if row["pair"] == "fr-zh"]
    assert len(french) == 19 and sum(row["occurrences"] for row in french) == 20
    assert len(mandarin) == 6
    result = {
        "version": 1, "status": "proposed-pending-Claude-not-applied",
        "lotCommit": BASE, "reviewCommit": REVIEW, "changesAppliedToContent": 0,
        "changesAppliedToRuntime": 0, "publicationApproved": False,
        "scope": {"sourceFiles": 87, "protectedFiles": len(protected),
            "wholeAidsProposed": len(proposals), "zhFrWholeAids": len(french),
            "zhFrLesOccurrences": 20, "frZhWholeAids": len(mandarin)},
        "inputSha256": fingerprints, "proposals": proposals,
        "unresolved": [
            "约 : yué/u é/ué demande un choix explicite ; aucun changement proposé de cette syllabe ici.",
            "Pas de migration du coréen ou du ss espagnol dans le catalogue historique.",
            "Liaisons françaises 蒂勒 et approximation de sans par 桑 conservées.",
        ],
    }
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        assert OUTPUT.read_text() == serialized, "Regenerate the proposal after resolving its sources."
    else:
        OUTPUT.write_text(serialized)
    print(json.dumps({"status": "checked" if args.check else "prepared",
        **result["scope"], "contentChanges": 0, "runtimeChanges": 0}, ensure_ascii=False))


if __name__ == "__main__":
    main()
