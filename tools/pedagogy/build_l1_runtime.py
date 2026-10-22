#!/usr/bin/env python3
"""Build the standalone seven-pair café review from immutable Git objects.

No preview generator, working-tree source JSON, app code, DECKS or access code
is read or changed. Only melunga_deploy/content/l1-cafe.json is written.
"""

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
SOURCE_COMMIT = "30e7d40a8af3f51ee186bf83f983596b8ca8798f"
STATUS = "owner-instruction-activated"
OUTPUT = Path("melunga_deploy/content/l1-cafe.json")
PLAN = "docs/progression-complete/l1-bridges.json"
MAIN_BANK = "docs/progression-complete/banque-phrases.json"
FRAGMENTS = "docs/progression-complete/banks/l1-bridges.json"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
SOURCE_SHA256 = {
    PLAN: "855c969096a28791226b849fa2bde2654cc1fc5b7a241ebb3699f9e4d71858d6",
    MAIN_BANK: "7ee63a793298678e9738923c2278ddfceb7009a6b2aec8039f5d6d2d135d6157",
    FRAGMENTS: "c9411ba7961706674e2385d3997f06bb67d981adebe45ce44f331e2e6ce582d3",
    "melunga_deploy/content/conversation/L1-fr-en.json": "af4a52abde3257e2ee65dd0b313a293bb9dadd9947a7779448103e7aaf8aecd7",
    "melunga_deploy/content/conversation/L1-fr-es.json": "40b3c9794273dc44e133ea0705ac36644b87abf11df34e4cdb02192ea0b5816b",
    "melunga_deploy/content/conversation/L1-fr-it.json": "f6e7d13b1525ca6aa1fff83730ec1d6a7b22ce7aac6e3c57a290d34be40fc5c9",
    "melunga_deploy/content/conversation/L1-fr-zh.json": "798b987d60f6a95a9e4fa869e22e8fae949d4ce62c273b887aeb95e4c4466147",
    "melunga_deploy/content/conversation/L1-fr-ja.json": "fad1f7e9091586ddc33ccafcac9133bc31826fe1eb017eda217b0e17017ac2bc",
    "melunga_deploy/content/conversation/L1-fr-ko.json": "266ea2c2d498886b965f9d67c678dd7c2f1a001092a51f0a489fdd039652cc97",
    "melunga_deploy/content/conversation/L1-zh-fr.json": "170c3a0d576edd3a619b4560040e1a346246769e66530a582ce448d0699b1753",
}
# Reviewed Unicode codepoint boundaries: refusal end, price start. Never strip,
# normalize or calculate a new linguistic split from punctuation/whitespace.
BOUNDARIES = {
    "fr-en": {"study": (11, 12), "native": (11, 12), "phon": (11, 12)},
    "fr-es": {"study": (12, 13), "native": (11, 12), "phon": (14, 15)},
    "fr-it": {"study": (11, 12), "native": (11, 12), "phon": (13, 14)},
    "fr-zh": {"study": (6, 6), "native": (11, 12), "reading": (15, 16), "phon": (18, 19)},
    "fr-ja": {"study": (9, 9), "native": (11, 12), "reading": (11, 11), "phon": (23, 24)},
    "fr-ko": {"study": (10, 11), "native": (11, 12), "reading": (20, 21), "phon": (26, 27)},
    "zh-fr": {"study": (11, 12), "native": (6, 6), "phon": (5, 5)},
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_sources(root=ROOT):
    """Verify bytes before parsing; do not trust a checkout or another builder."""
    sources = {}
    for path, expected in SOURCE_SHA256.items():
        raw = subprocess.check_output(["git", "-C", str(root), "show", f"{SOURCE_COMMIT}:{path}"])
        require(hashlib.sha256(raw).hexdigest() == expected, f"Source SHA256 mismatch: {path}")
        sources[path] = json.loads(raw)
    return sources


def aids_of(record):
    aids = {key: value for key, value in record.items()
            if key not in {"study", "native", "speaker", "slot"}}
    require("phon" in aids and all(isinstance(value, str) for value in aids.values()),
            "Every present source aid must be copied as a string, including phon")
    return aids


def source_copy(record):
    return {"study": record["study"], "native": record["native"], "aids": aids_of(record)}


def unique_rows(rows):
    indexed = {row["id"]: row for row in rows}
    require(len(indexed) == len(rows), "Duplicate bank identity")
    return indexed


def no_certification(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"gradesOrUnlocks", "learnerAcquisitionValidated", "countsAsProduction",
                       "productionApproved", "grantsAccess", "masteryValidated"}:
                require(item is False, f"{key} cannot certify acquisition or change access")
            no_certification(item)
    elif isinstance(value, list):
        for item in value:
            no_certification(item)


def validate_contract(pair, scene, original, refs, bank):
    """Check preparation and received answers independently of preview tooling."""
    prefix = f"L1-{pair}"
    dialogue = scene["dialogue"]
    require(scene["id"] == dialogue["dialogueId"] == f"{prefix}-cafe-prepare"
            and dialogue["originalDialogueId"] == original["id"], "Wrong scene identity")
    require(dialogue["roles"] == original["roles"] and dialogue["learnerRole"] == "A",
            "Wrong scene role or labels")
    require(dialogue["situation"] == original["situation"], "Wrong scene context")
    require(scene["level"] == scene["accessFloor"] == 1, "Scene must remain L1")
    require(scene["nativeReview"]["status"] == "pending"
            and scene["nativeReview"]["productionApproved"] is False, "Native review must remain pending")
    require(dialogue["originalTurnOrder"] == [0, 1, 2, 3, "4:refusal", "4:price", 5],
            "Wrong derived turn order")
    require(dialogue["sceneType"] == "derived-dialogue-exact-segments"
            and dialogue["automaticVariantGrafting"] is False, "Unexpected scene construction")
    units = scene["bridgeUnits"]
    require(len(units) == 2 and [unit["utteranceId"] for unit in units] == [refs[0], refs[4]],
            "Prepare exactly greeting and refusal bridge units")
    for unit, suffix in zip(units, ("greeting", "refusal")):
        require(unit["unitId"] == f"{prefix}-bridge-{suffix}"
                and unit["kind"] == "whole-expression" and unit["sourceAccessLevel"] == 1
                and unit["requiresNewPhonetics"] is False and unit["replacementClaim"] is False,
                "Wrong whole-expression bridge contract")
        require(isinstance(unit["contextReader"], str) and bool(unit["contextReader"]), "Missing reader context")
        require([step["kind"] for step in unit["steps"]]
                == ["understand", "imitate", "recall-whole-phrase"], "Wrong bridge phases")
        for index, step in enumerate(unit["steps"]):
            require(step["utterance"] == unit["utteranceId"], "Bridge phrase changed between phases")
            require(step["id"] == unit["unitId"] + ("-understand", "-imitate", "-recall")[index],
                    "Wrong bridge step identity")
            if index < 2:
                require(step["wholePhrase"] is True and step["requiresProduction"] is (index == 1),
                        "Bridge understanding must precede imitation")
            else:
                require(step["hideLearnerModelOnRequest"] is True and step["canRestoreHelp"] is True,
                        "Bridge recall must allow help")
    # Ordered scene speakers are A, B, A, B, A, A, B.
    expected_preparation = [(ref, speaker, kind)
                            for ref, speaker in zip(refs, ("A", "B", "A", "B", "A", "A", "B"))
                            for kind in (("understand", "imitate") if speaker == "A" else ("receive",))]
    preparation = dialogue["preparation"]
    require([(step["utterance"], step["speaker"], step["kind"]) for step in preparation]
            == expected_preparation, "Every scene phrase needs its ordered whole preparation")
    prepared = {step["id"]: step for step in preparation}
    require(len(prepared) == len(preparation) == 11, "Duplicate or missing preparation")
    for step in preparation:
        require(step["wholePhrase"] is True and step["requiresProduction"] is (step["kind"] == "imitate"),
                "Received/understood phrases cannot require production")

    def prepared_whole(ref, step_id):
        require(step_id in prepared, "Answer points to unprepared step")
        step = prepared[step_id]
        require(step["utterance"] == ref and step["speaker"] == "A"
                and step["kind"] == "understand" and step["wholePhrase"] is True,
                "Answer must use the exact prepared learner phrase")

    price = scene["pricePreparation"]
    require(price["utteranceId"] == refs[5] and price["relatedUnitId"] == f"{prefix}-10"
            and price["relatedUnitDoesNotPrepareExactPhrase"] is True, "Price needs exact separate preparation")
    prepared_whole(refs[5], price["preparedInStep"])
    received = dialogue["received"]
    require([item["utteranceId"] for item in received] == [refs[1], refs[3], refs[6]],
            "Exactly three received entries are required")
    for item, index, answer in zip(received, (1, 3, 5), (refs[2], refs[4], None)):
        ref = item["utteranceId"]
        require(item["source"] == {"type": "dialogueTurn", "level": 1, "dialogueId": original["id"],
                                   "turnIndex": index, "learnerRole": "A",
                                   "expectedStudy": original["turns"][index]["study"]},
                "Wrong received source, role or text")
        introduced = [step["id"] for step in preparation if step["utterance"] == ref and step["kind"] == "receive"]
        require(introduced == [item["introducedInStep"]], "Received phrase lacks exact earlier introduction")
        require(item["analyse"] is False and item["countsAsProduction"] is False
                and item["replyRequired"] is (answer is not None), "Received contract cannot imply production")
        require([entry["utteranceId"] for entry in item["answerWith"]] == ([] if answer is None else [answer]),
                "Welcome answers with order; milk with refusal only; amount needs no reply")
        for entry in item["answerWith"]:
            require(entry["expectedStudy"] == bank[answer]["copy"]["study"], "Answer text changed")
            prepared_whole(answer, entry["preparedInStep"])
    phases = dialogue["steps"]
    require([step["kind"] for step in phases]
            == ["listen-whole-dialogue", "reply-with-help", "reply-without-model"], "Wrong scene phases")
    for step in phases:
        require(step["turns"] == refs and step["learnerRole"] == "A", "Wrong scene phrase order or role")
    require(phases[-1]["receivedRemainVisible"] is True and phases[-1]["canRestoreHelp"] is True,
            "Recall must retain received turns and restorable help")
    no_certification(scene)


def build_pair(pair, scene, sources, bank):
    native, study = pair.split("-")
    prefix = f"L1-{pair}"
    filename = f"{prefix}.json"
    path = f"melunga_deploy/content/conversation/{filename}"
    raw = sources[path]
    require((raw["nativeLanguage"], raw["studyLanguage"], raw["level"]) == (native, study, 1),
            "Wrong canonical pair or level")
    originals = [item for item in raw["dialogues"] if item["id"] == f"{prefix}-d1"]
    require(len(originals) == 1, "Missing or duplicate original dialogue")
    original = originals[0]
    turns = original["turns"]
    require(original["learnerRole"] == "A" and set(original["roles"]) == {"A", "B"}
            and [turn["speaker"] for turn in turns] == ["A", "B", "A", "B", "A", "B"],
            "Wrong canonical learner role or turn roles")
    refs = [f"{filename}:{prefix}-d1:t0", f"{filename}:{prefix}-d1:t1",
            f"{filename}:{prefix}-09:v0", f"{filename}:{prefix}-d1:t3",
            f"{filename}:{prefix}-d1:t4:refusal", f"{filename}:{prefix}-d1:t4:price",
            f"{filename}:{prefix}-d1:t5"]
    for ref in refs:
        row = bank[ref]
        require(row["id"] == ref and (row["nativeLanguage"], row["studyLanguage"]) == (native, study)
                and row["source"]["file"] == path, "Wrong bank pair, identity or source")
    for index in (0, 1, 3, 5):
        row = bank[f"{filename}:{prefix}-d1:t{index}"]
        require(row["source"] == {"type": "conversation", "file": path, "dialogueId": original["id"],
                                   "turnIndex": index, "expectedStudy": turns[index]["study"]},
                "Wrong whole-turn source locator")
        require(row["copy"] == source_copy(turns[index]), "Whole phrase must retain all exact source aids")
    order = bank[refs[2]]
    units = [unit for unit in raw["units"] if unit["id"] == f"{prefix}-09"]
    require(len(units) == 1, "Missing or duplicate unit 09")
    require(order["source"] == {"type": "conversation", "file": path, "unitId": f"{prefix}-09",
                                "variantIndex": 0, "slot": False, "expectedStudy": turns[2]["study"]},
            "Order must use exactly unit 09 variant 0")
    require(order["copy"] == source_copy(units[0]["variants"][0]) == source_copy(turns[2]),
            "Order must match both whole variant and original scene including all aids")
    parent = turns[4]
    fields = {"study", "native"} | set(aids_of(parent))
    require(fields == set(BOUNDARIES[pair]), "Unexpected fragment field/aid inventory")
    for ref, fragment in zip(refs[4:6], ("refusal", "price")):
        row = bank[ref]
        locator = row["source"]
        require(locator["expectedParent"] == parent, "Fragment raw parent changed")
        spans = {field: ([0, ends[0]] if fragment == "refusal" else [ends[1], len(parent[field])])
                 for field, ends in BOUNDARIES[pair].items()}
        require(locator == {"type": "conversation-fragment", "file": path, "dialogueId": original["id"],
                            "turnIndex": 4, "sourceLevel": 1, "learnerRole": "A", "fragment": fragment,
                            "expectedStudy": row["copy"]["study"], "expectedParent": parent, "spans": spans},
                "Fragment must use exact reviewed Unicode spans and parent")
        sliced = {field: parent[field][start:end] for field, (start, end) in spans.items()}
        require(row["copy"] == {"study": sliced["study"], "native": sliced["native"],
                                "aids": {key: sliced[key] for key in aids_of(parent)}},
                "Fragment must retain every exact source aid slice")
    split = scene["splitReconstruction"]
    require(split["originalTurnIndex"] == 4 and split["first"] == refs[4] and split["second"] == refs[5],
            "Wrong fragment reconstruction order")
    require(split["separators"] == {field: parent[field][ends[0]:ends[1]]
                                     for field, ends in BOUNDARIES[pair].items()},
            "Fragment separators must reconstruct the entire raw parent")
    validate_contract(pair, scene, original, refs, bank)
    phrases = []
    for ref, index in zip(refs, (0, 1, 2, 3, 4, 4, 5)):
        speaker = turns[index]["speaker"]
        copy = bank[ref]["copy"]
        phrases.append({"id": ref, "kind": "learner" if speaker == "A" else "received", "speaker": speaker,
                        "study": copy["study"], "native": copy["native"], **copy["aids"]})
    dialogue = scene["dialogue"]
    return {"id": pair, "nativeLanguage": native, "studyLanguage": study, "level": 1,
            "roles": deepcopy(original["roles"]), "learnerRole": "A",
            "contextReader": {"scene": dialogue["situation"],
                              "greeting": scene["bridgeUnits"][0]["contextReader"],
                              "refusal": scene["bridgeUnits"][1]["contextReader"]},
            "phrases": phrases, "bridgeUnits": deepcopy(scene["bridgeUnits"]),
            "preparation": deepcopy(dialogue["preparation"]), "steps": deepcopy(dialogue["steps"]),
            "received": deepcopy(dialogue["received"]), "nativeReview": deepcopy(scene["nativeReview"]),
            "sourceDialogueId": original["id"], "dialogueId": dialogue["dialogueId"]}


def build_bundle(sources):
    try:
        plan = sources[PLAN]
        require(plan["version"] == 1 and plan["doesNotChangeAccess"] is True
                and plan["learnerAcquisitionValidated"] is False, "Unexpected source review/access status")
        canonical_hashes = {path: digest for path, digest in SOURCE_SHA256.items() if "/conversation/" in path}
        require(plan["sourceFilesSha256"] == canonical_hashes, "Wrong canonical source hash manifest")
        scenes = plan["scenes"]
        require([f'{scene["nativeLanguage"]}-{scene["studyLanguage"]}' for scene in scenes] == list(PAIRS),
                "Wrong, missing, duplicate or reordered reader/study pair")
        require(len(sources[MAIN_BANK]["entries"]) == 7989 and len(sources[FRAGMENTS]["entries"]) == 14,
                "Unexpected source bank inventories")
        bank = unique_rows(sources[MAIN_BANK]["entries"] + sources[FRAGMENTS]["entries"])
        return {"version": 1, "sourceCommit": SOURCE_COMMIT, "status": STATUS,
                "nativeReviewPending": False, "doesNotChangeAccess": True,
                "sourceFilesSha256": dict(SOURCE_SHA256),
                "pairs": [build_pair(pair, scene, sources, bank) for pair, scene in zip(PAIRS, scenes)]}
    except (KeyError, IndexError, TypeError) as error:
        raise ValueError(f"Malformed L1 source contract: {error}") from error


def encode(bundle):
    return (json.dumps(bundle, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="Git repository and destination root")
    parser.add_argument("--check", action="store_true", help="Verify reproducible output without writing")
    args = parser.parse_args(argv)
    try:
        expected = encode(build_bundle(read_sources(args.root)))
        target = args.root / OUTPUT
        if args.check:
            require(target.exists() and target.read_bytes() == expected,
                    f"Runtime bundle differs; run python3 tools/pedagogy/build_l1_runtime.py: {target}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_suffix(".json.tmp")
            temporary.write_bytes(expected)
            temporary.replace(target)
        print(f"{'Checked' if args.check else 'Built'} {OUTPUT}: 7 pairs, 49 exact phrases; {STATUS}")
        return 0
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
