#!/usr/bin/env python3
"""Check any completed language ledgers in memory without runtime writes."""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("baseline_level_builder", Path(__file__).with_name("build_levels.py"))
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pairs", nargs="+", required=True)
    args = parser.parse_args()
    all_pairs = {pair: (native, study, name, flag, historical)
                 for pair, native, study, name, flag, historical in builder.legacy.PAIRS}
    builder.ensure(set(args.pairs) <= set(all_pairs), "Unknown language pair")
    pairs = {pair: all_pairs[pair] for pair in args.pairs}
    plan, intents, plan_hash = builder.situation_content.read_plan(ROOT)
    frozen = {"plan": plan, "intents": intents, "items": [], "fingerprints": {},
              "searchIndex": json.loads((ROOT / builder.situation_content.DIRECTORY / "search-index.json").read_text())}
    for pair in pairs:
        path = ROOT / builder.situation_content.DIRECTORY / f"{pair}.json"
        document = json.loads(path.read_text())
        builder.ensure(document.get("pair") == pair and document.get("planHash") == plan_hash
                       and len(document.get("items", [])) == 80, "Draft ledger does not cover the frozen plan")
        fingerprint = builder.file_sha(path)
        frozen["items"].extend({**item, "_ledgerPath": str(path.relative_to(ROOT)), "_ledgerSha256": fingerprint}
                               for item in document["items"])
    outputs, _report = builder.make(include_situations=False)
    rows = {pair: [] for pair in pairs}
    for path, text in outputs.items():
        if path.parent.name in rows and path.name.startswith("L") and path.suffix == ".json":
            cell = json.loads(text)
            rows[path.parent.name].extend(phrase for theme in cell["themes"] + cell.get("heldThemes", []) for phrase in theme["phrases"])
            rows[path.parent.name].extend(cell.get("reserve", []))
    _app, decks, _plan, _decisions, _enrichments = builder.read_inputs()
    result = builder.situation_content.resolve(ROOT, frozen, rows, pairs, decks)
    print(json.dumps({"runtimeWritten": False, "pairs": list(pairs), "positions": len(result["uses"]),
        "newAuthoredForms": sum(entry["authored"] for entry in result["entries"]),
        "existingConversationImports": sum(entry["preexistingConversation"] for entry in result["entries"]),
        "explicitIntroductions": len(result["introductions"]), "sourceSnapshots": len(result["fingerprints"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
