#!/usr/bin/env python3
"""Check or refresh editorial references against guidedPool's first text match.

Only sourceIndex and currentLevel in PEDAGOGY_FAMILIES may be updated.
DECKS, targets, family order and pathLv are never changed by this script.
The catalogue level is a legacy classification, not a mastery assessment.
"""

import argparse
import copy
import json
from pathlib import Path
import re
import sys


def extract_object(source, name):
    match = re.search(r"(?m)^[ \t]*var\s+" + re.escape(name) + r"\s*=\s*", source)
    if not match:
        raise ValueError(f"Missing JavaScript variable: {name}")
    value, length = json.JSONDecoder().raw_decode(source[match.end():])
    return value, match.end(), match.end() + length


def refresh(source):
    decks, _, _ = extract_object(source, "DECKS")
    families, start, end = extract_object(source, "PEDAGOGY_FAMILIES")
    updated = copy.deepcopy(families)
    counts = {"references": 0, "incorrectReferences": 0,
              "sourceIndexChanges": 0, "currentLevelChanges": 0}
    errors = []
    for language, config in updated["languages"].items():
        # setdefault intentionally preserves the FIRST occurrence, like guidedPool.
        first_by_text = {}
        for index, card in enumerate(decks[language]):
            first_by_text.setdefault(card["t"], (index, card))
        for family in config["families"]:
            for reference in family["cards"]:
                counts["references"] += 1
                target = reference["target"]
                found = first_by_text.get(target)
                if found is None:
                    errors.append(f"{language}/{family['id']}: missing target {target!r}")
                    continue
                index, card = found
                level = card["lv"]
                if type(level) is not int or not 1 <= level <= 10:
                    errors.append(f"{language}/{family['id']}: invalid catalogue level")
                    continue
                wrong_index = type(reference.get("sourceIndex")) is not int or reference["sourceIndex"] != index
                wrong_level = type(reference.get("currentLevel")) is not int or reference["currentLevel"] != level
                counts["sourceIndexChanges"] += int(wrong_index)
                counts["currentLevelChanges"] += int(wrong_level)
                counts["incorrectReferences"] += int(wrong_index or wrong_level)
                reference["sourceIndex"] = index
                reference["currentLevel"] = level
    if errors:
        # Never partially write a repair with missing or invalid source cards.
        raise ValueError("\n".join(errors))
    replacement = json.dumps(updated, ensure_ascii=False, separators=(",", ":"))
    return source[:start] + replacement + source[end:], counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app", type=Path,
                        default=Path(__file__).resolve().parents[2] / "melunga_deploy" / "app.html")
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--check", action="store_true", help="Read only; this is the default")
    modes.add_argument("--write", action="store_true", help="Refresh the two editorial fields")
    args = parser.parse_args()
    try:
        source = args.app.read_text(encoding="utf-8")
        result, counts = refresh(source)
    except (KeyError, TypeError, ValueError, OSError) as error:
        print(str(error), file=sys.stderr)
        return 2
    if args.write and counts["incorrectReferences"]:
        args.app.write_text(result, encoding="utf-8")
    print(json.dumps({"mode": "write" if args.write else "check", **counts}, ensure_ascii=False))
    return 0 if args.write or not counts["incorrectReferences"] else 1


if __name__ == "__main__":
    sys.exit(main())
