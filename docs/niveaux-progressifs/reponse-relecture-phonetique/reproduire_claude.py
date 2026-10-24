#!/usr/bin/env python3
"""Run Claude's three frozen readers against his complete reference checkout.

No reference data or product file is modified. Only the proposal report is
written; --check verifies the stored report instead.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
LOT = "90a343391807b5a62ef1f140ce40075c53b7d9d8"
REVIEW = "295adf3"


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def sha(value):
    return hashlib.sha256(value).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference-tree", required=True, type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    reference = args.reference_tree.resolve()
    wanted = git("rev-parse", REVIEW).decode().strip()
    observed = subprocess.check_output(["git", "-C", str(reference), "rev-parse", "HEAD"], text=True).strip()
    assert wanted == observed, "The reference checkout must be frozen at Claude's 295adf3."
    sources = sorted((reference / "melunga_deploy/content/conversation").glob("L*.json"))
    assert len(sources) == 70, "Use the complete seven-pair L1–L10 reference, not seven L1 snapshots."
    script_results = []
    comparisons = {}
    with tempfile.TemporaryDirectory(prefix="melunga-phonetic-reproduction-") as temp:
        folder = Path(temp)
        for number in [1, 2, 3]:
            source = f"docs/revue-pedagogique/mesures/phon{number}.py"
            raw = git("show", REVIEW + ":" + source)
            program = raw.decode()
            if number == 1:
                old = 'REV = "origin/review/themes-niveaux-progressifs"'
                assert program.count(old) == 1
                program = program.replace(old, f'REV = "{LOT}"')
            script = folder / f"phon{number}.py"
            script.write_text(program)
            run = subprocess.run([sys.executable, str(script), str(reference)], check=True,
                capture_output=True, text=True)
            script_results.append({"source": source, "sourceSha256": sha(raw),
                "harnessChange": "REV pinned to the exact reviewed lot" if number == 1 else None,
                "stdout": run.stdout})
            for pair, count, differences in re.findall(
                    r"── ([a-z]{2}-[a-z]{2})[^\n]*\n\s+(\d+) rendus comparables · (\d+) divergences", run.stdout):
                comparisons[pair] = {"comparableRenderings": int(count), "divergences": int(differences)}
        rows = json.loads((folder / "aides.json").read_text())
        statuses = dict(Counter(str(row["status"]) for row in rows))
    expected = {"fr-en": (401, 16), "fr-es": (723, 127), "fr-it": (379, 43),
        "zh-fr": (236, 36), "fr-zh": (957, 28), "fr-ko": (1784, 521)}
    assert {pair: (row["comparableRenderings"], row["divergences"])
        for pair, row in comparisons.items()} == expected
    assert len(rows) == 2965 and statuses == {"None": 334, "pending-Claude": 1715,
        "existing-verbatim": 535, "source-exact-preserved": 381}
    result = {"version": 1, "status": "reproduced-not-a-linguistic-validation",
        "lotCommit": LOT, "referenceCommit": wanted, "rowCount": len(rows),
        "statuses": statuses, "comparisons": comparisons,
        "allComparedRenderings": sum(row["comparableRenderings"] for row in comparisons.values()),
        "comparedRenderingsExcludingEnglish": sum(row["comparableRenderings"]
            for pair, row in comparisons.items() if pair != "fr-en"),
        "referenceConversationFiles": {str(path.relative_to(reference)): sha(path.read_bytes()) for path in sources},
        "referenceAppSha256": sha((reference / "melunga_deploy/app.html").read_bytes()),
        "scripts": script_results,
        "limits": ["Equal token counts do not prove contextual or phonological alignment.",
            "The original divergence JSON exports only the eight/ten most frequent mismatch groups.",
            "Japanese receives no comparable-token count in phon3.py.",
            "The ss-vowel filter is absent from the three original scripts.",
            "No corpus, metadata or runtime change is applied."]}
    assert result["allComparedRenderings"] == 4480
    assert result["comparedRenderingsExcludingEnglish"] == 4079
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    output = HERE / "reproduction-claude.json"
    if args.check:
        assert output.read_text() == serialized, "Stored reproduction differs."
    else:
        output.write_text(serialized)
    print(json.dumps({"status": "checked" if args.check else "reproduced",
        "rows": len(rows), "comparedRenderings": result["allComparedRenderings"],
        "withoutEnglish": result["comparedRenderingsExcludingEnglish"], "productEdits": 0}))


if __name__ == "__main__":
    main()
