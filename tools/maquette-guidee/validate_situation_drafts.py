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
    parser.add_argument("--extension", action="store_true", help="Resolve the protected base eighty followed by appended learner, received and lexical entries")
    args = parser.parse_args()
    all_pairs = {pair: (native, study, name, flag, historical)
                 for pair, native, study, name, flag, historical in builder.legacy.PAIRS}
    builder.ensure(set(args.pairs) <= set(all_pairs), "Unknown language pair")
    pairs = {pair: all_pairs[pair] for pair in args.pairs}
    plan, intents, plan_hash = builder.situation_content.read_plan(ROOT)
    directory = ROOT / builder.situation_content.DIRECTORY
    base_path = directory / "plan-base10.json"
    base_plan = json.loads(base_path.read_text()) if base_path.exists() else plan
    if not args.extension:
        plan = base_plan
        intents = {intent["id"]: {"theme": theme, "intent": intent} for theme in plan["themes"] for intent in theme["intents"]}
    frozen = {"plan": plan, "intents": intents, "items": [], "receivedTurns": [], "lexicalSupports": [], "fingerprints": {},
              "searchIndex": json.loads((directory / "search-index.json").read_text())}
    if args.extension:
        baseline = json.loads((directory / "extension-pistes/baseline.json").read_text())
        frozen["baseline"] = {**baseline, "canonical": {key: value for key, value in baseline["canonical"].items() if value["pairId"] in pairs},
            "protectedCanonicalIds": [key for key in baseline["protectedCanonicalIds"] if baseline["canonical"][key]["pairId"] in pairs]}
    for pair in pairs:
        files = [(directory / f"{pair}.json", builder.file_sha(base_path) if base_path.exists() else plan_hash)]
        if args.extension:
            files.append((directory / f"extension-{pair}.json", plan_hash))
        for path, expected_hash in files:
            document = json.loads(path.read_text())
            builder.ensure(document.get("pair") == pair and document.get("planHash") == expected_hash,
                           "Draft ledger refers to another plan")
            fingerprint = builder.file_sha(path)
            for category, key in (("learner", "items"), ("received", "receivedTurns"), ("support", "lexicalSupports")):
                frozen[key].extend({**item, "_ledgerPath": str(path.relative_to(ROOT)), "_ledgerSha256": fingerprint, "_category": category}
                                  for item in document.get(key, []))
    outputs, _report = builder.make(include_situations=False)
    rows = {pair: [] for pair in pairs}
    for path, text in outputs.items():
        if path.parent.name in rows and path.name.startswith("L") and path.suffix == ".json":
            cell = json.loads(text)
            rows[path.parent.name].extend(phrase for theme in cell["themes"] + cell.get("heldThemes", []) for phrase in theme["phrases"])
            rows[path.parent.name].extend(cell.get("reserve", []))
    _app, decks, _plan, _decisions, _enrichments = builder.read_inputs()
    result = builder.situation_content.resolve(ROOT, frozen, rows, pairs, decks)
    received_steps = 0
    lookup = {pair: {row["id"]: row for row in values} for pair, values in rows.items()}
    for pair in pairs:
        for theme in frozen["plan"]["themes"]:
            group = sorted((use for use in result["uses"] if use["pair"] == pair and use["topicId"] == theme["id"]), key=lambda use: use["intentOrder"])
            usages = [use for use in result["receivedUses"] if use["pair"] == pair and use["topicId"] == theme["id"]]
            exercises = builder.sequences(pair, theme["level"], theme["themeId"], [lookup[pair][use["canonicalId"]] for use in group],
                pairs[pair][0], preserve_input_order=True, received_usages=usages)
            steps = [step for sequence in exercises for step in sequence["steps"]]
            for index, step in enumerate(steps):
                if step["kind"] != "receive":
                    continue
                received_steps += 1
                neighbour = steps[index+1 if step.get("beforeIntentId") else index-1]
                builder.ensure(neighbour["kind"] == "choose-and-recall" and neighbour["utterance"] == step["prepares"], "Received cue is separated from its actual response")
                builder.ensure(step["countsForProgress"] is False and step["requiresProduction"] is False, "Received source entered production progression")
    print(json.dumps({"runtimeWritten": False, "pairs": list(pairs), "positions": len(result["uses"]),
        "newAuthoredForms": sum(entry["authored"] and entry["category"] == "learner" for entry in result["entries"]),
        "receivedUsages": len(result["receivedUses"]), "receivedSteps": received_steps, "lexicalSupportUses": len(result["lexicalSupportUses"]),
        "receivedCreated": sum(entry["authored"] and entry["category"] == "received" for entry in result["entries"]),
        "supportCreated": sum(entry["authored"] and entry["category"] == "support" for entry in result["entries"]),
        "existingConversationImports": sum(entry["preexistingConversation"] and entry["category"] == "learner" for entry in result["entries"]),
        "explicitIntroductions": len(result["introductions"]), "sourceSnapshots": len(result["fingerprints"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
