#!/usr/bin/env python3
"""Freeze pair-scoped free rights before replacing the legacy guided path.

The classic lv1 entitlement and the *resolved* legacy guided L1 entitlement
are copied from the published bb9f904 runtime, not inferred from a new learning
level. Guided references are resolved by target exactly as guidedPool did;
their old sourceIndex metadata is frequently wrong. Conversation L1 variants
are recorded separately and never grant access to another pair or catalogue
index. This script writes only the two generated entitlement artifacts.

Run with --check to verify reproducibility, all pinned source cards/aid fields,
and the current checkout's catalogue indices. No checkout, app or source is
rewritten. Python's standard library and the repository's Git objects suffice.
"""

import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
MAIN_COMMIT = "bb9f904d79afff6efee19a80e7fe80980c733514"
BASE_COMMIT = "50a28918c4760d6417aefc28092190ad406c8560"
CONVERSATION_COMMIT = "bcd108dff5c5931f935f70f694a040d235403b64"
APP = "melunga_deploy/app.html"
JSON_OUTPUT = Path("melunga_deploy/content/curriculum-legacy-free.json")
JS_OUTPUT = Path("melunga_deploy/curriculum-legacy-free.js")
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
MEANING_FIELDS = {"fr": "frm", "es": "esm", "en": "en", "it": "itm",
                  "ja": "jam", "ko": "kom"}
SOURCING_THEMES = {"biz", "textile", "elec", "furniture", "lighting", "toys",
                   "shoes", "bags", "machinery"}
# Independent historical counts: classic L1, distinct guided L1, union.
EXPECTED_COUNTS = {
    "fr-en": (323, 19, 342), "fr-es": (288, 19, 300),
    "fr-it": (335, 19, 347), "fr-zh": (314, 19, 331),
    "fr-ja": (287, 19, 305), "fr-ko": (284, 0, 284),
    "zh-fr": (293, 18, 309),
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":")).encode("utf-8")


def sha256(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def git_bytes(commit, path, root=ROOT):
    return subprocess.check_output(
        ["git", "-C", str(root), "show", f"{commit}:{path}"])


def extract_object(source, name):
    """Parse the generated JSON literal; never execute the surrounding app."""
    match = re.search(r"\bvar\s+" + re.escape(name) + r"\s*=\s*", source)
    require(match is not None, f"Missing app object: {name}")
    value, _ = json.JSONDecoder().raw_decode(source, match.end())
    require(isinstance(value, dict), f"Expected app object: {name}")
    return value


def load_sources(root=ROOT):
    main = git_bytes(MAIN_COMMIT, APP, root).decode("utf-8")
    base = git_bytes(BASE_COMMIT, APP, root).decode("utf-8")
    decks = extract_object(main, "DECKS")
    families = extract_object(main, "PEDAGOGY_FAMILIES")
    require(decks == extract_object(base, "DECKS"),
            "Catalogue changed between the historical and integration baselines")
    require(families == extract_object(base, "PEDAGOGY_FAMILIES"),
            "Guided path changed between the two pinned baselines")
    conversation = {}
    for pair in PAIRS:
        path = f"melunga_deploy/content/conversation/L1-{pair}.json"
        raw = git_bytes(CONVERSATION_COMMIT, path, root)
        conversation[pair] = (path, raw, json.loads(raw))
    return decks, families, conversation


def classic_free_indices(deck, native, study):
    """Mirror activeDeck + isFreeCard, before personal known-card filtering."""
    field = MEANING_FIELDS.get(native)
    sourcing_relevant = (native == "zh" or study == "zh"
                         or (native in {"fr", "es"} and study == "en"))
    return {index for index, card in enumerate(deck)
            if card["lv"] == 1
            and (sourcing_relevant or card.get("th") not in SOURCING_THEMES)
            and (field is None or card.get(field))}


def guided_free_references(deck, families, native, study):
    """Mirror guidedActiveDeck + guidedPool, including first-target matching."""
    # guidedActiveDeck has no ko native-language branch. The whitelist uses
    # only fr and zh readers, so that historical omission grants nothing new.
    field = MEANING_FIELDS.get(native) if native != "ko" else None
    by_target = {}
    for index, card in enumerate(deck):
        if field is None or card.get(field):
            by_target.setdefault(card["t"], (index, card))
    references = []
    for family in families["languages"].get(study, {}).get("families", []):
        if family["pathLv"] != 1:
            continue
        for ref in family["cards"]:
            require(ref["target"] in by_target,
                    f"Missing historical guided target: {native}-{study}/{ref['target']}")
            index, card = by_target[ref["target"]]
            references.append({
                "familyId": family["id"], "step": ref["step"],
                "sourceIndex": index, "study": card["t"],
                "declaredLegacySourceIndex": ref.get("sourceIndex"),
            })
    return references


def conversation_references(pair, source):
    path, raw, level = source
    native, study = pair.split("-")
    require((level["nativeLanguage"], level["studyLanguage"], level["level"])
            == (native, study, 1), f"Wrong conversation source for {pair}")
    phrases = []
    for unit in level["units"]:
        for index, variant in enumerate(unit["variants"]):
            require(all(isinstance(variant.get(key), str) and variant[key]
                        for key in ("study", "native", "phon")),
                    f"Missing source phrase/aid: {pair}/{unit['id']}/{index}")
            # Copy every source variant field (including slot and reading).
            # No normalization, concatenation, phonetic generation or fixes.
            phrases.append({
                "id": f"L1-{pair}.json:{unit['id']}:v{index}",
                "unitId": unit["id"], "variantIndex": index,
                "sourceVariantSha256": sha256(variant),
                **deepcopy(variant),
            })
    require(len(level["units"]) == 11 and len(phrases) == 44,
            f"Unexpected historical L1 coverage for {pair}")
    return {
        "sourceLevel": 1, "sourcePath": path,
        "sourceFileSha256": hashlib.sha256(raw).hexdigest(),
        "utteranceIds": [phrase["id"] for phrase in phrases],
        "phrases": phrases,
    }


def build_manifest(decks, families, conversation):
    pairs = []
    for pair in PAIRS:
        native, study = pair.split("-")
        deck = decks[study]
        classic = classic_free_indices(deck, native, study)
        guided_refs = guided_free_references(deck, families, native, study)
        guided = {ref["sourceIndex"] for ref in guided_refs}
        indices = sorted(classic | guided)
        require((len(classic), len(guided), len(indices)) == EXPECTED_COUNTS[pair],
                f"Historical entitlement count changed for {pair}")
        cards = [{
            "sourceIndex": index, "study": deck[index]["t"],
            "sourceLevel": deck[index]["lv"],
            "sourceCardSha256": sha256(deck[index]),
            "grants": (["classic-lv1"] if index in classic else [])
                      + (["guided-lv1"] if index in guided else []),
        } for index in indices]
        pairs.append({
            "id": pair, "nativeLanguage": native, "studyLanguage": study,
            "catalogue": {
                "sourceIndices": indices, "cards": cards,
                "guidedReferences": guided_refs,
                "counts": {"classicLv1": len(classic),
                           "guidedLv1References": len(guided_refs),
                           "guidedLv1Distinct": len(guided),
                           "guidedOutsideClassicLv1": len(guided - classic),
                           "union": len(indices)},
            },
            "conversation": conversation_references(pair, conversation[pair]),
        })
    return {
        "version": 1, "status": "historical-free-access-preserved",
        "scope": "Only the seven named native-study pairs; learning level does not revoke these rights.",
        "source": {
            "historicalMainCommit": MAIN_COMMIT,
            "integrationBaseCommit": BASE_COMMIT,
            "cataloguePath": APP, "catalogueSha256": sha256(decks),
            "guidedFamiliesSha256": sha256(families),
            "conversationCommit": CONVERSATION_COMMIT,
            "guidedResolution": "First matching target in the native-language-filtered deck, as in historical guidedPool.",
        },
        "policy": {
            "pairWhitelist": list(PAIRS),
            "classicFreeSourceLevels": [1],
            "preserveLegacyGuidedLevel1": True,
            "conversationReferencesAreSeparateFromCatalogueRights": True,
            "doesNotChangePricesOrPaidLevels": True,
            "doesNotGrantOtherPairs": True,
            "doesNotMeasureAcquisition": True,
        },
        "pairs": pairs,
    }


def validate_manifest(manifest, decks, families, conversation):
    """Reject added/removed rights, changed source/phonetic text and pair drift."""
    expected = build_manifest(decks, families, conversation)
    require(manifest == expected,
            "Manifest differs from the exact historical rights/source copies; regenerate it")
    for pair in manifest["pairs"]:
        deck = decks[pair["studyLanguage"]]
        indices = pair["catalogue"]["sourceIndices"]
        require(indices == sorted(set(indices)), f"Duplicate or unsorted indices: {pair['id']}")
        for card in pair["catalogue"]["cards"]:
            require(card["study"] == deck[card["sourceIndex"]]["t"]
                    and card["sourceCardSha256"] == sha256(deck[card["sourceIndex"]]),
                    f"Historical catalogue card/aid mismatch: {pair['id']}/{card['sourceIndex']}")
    return True


def validate_current_catalogue(decks, root=ROOT):
    current = extract_object((root / APP).read_text(encoding="utf-8"), "DECKS")
    require(current == decks,
            "Current DECKS/index/text/aid differs from both pinned product baselines; review rights before regenerating")


def render_json(manifest):
    return json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"


def render_js(manifest):
    payload = {"version": manifest["version"], "pairs": {
        pair["id"]: pair["catalogue"]["sourceIndices"] for pair in manifest["pairs"]}}
    # Numeric lists only; never interpolate catalogue text into JavaScript.
    return ("/* Generated by tools/curriculum/build_legacy_free.py; do not edit. */\n"
            "window.MelungaLegacyFree="
            + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                        help="Verify exact generated JSON/JS without writing files")
    args = parser.parse_args(argv)
    try:
        decks, families, conversation = load_sources()
        validate_current_catalogue(decks)
        manifest = build_manifest(decks, families, conversation)
        validate_manifest(manifest, decks, families, conversation)
        outputs = {JSON_OUTPUT: render_json(manifest), JS_OUTPUT: render_js(manifest)}
        for relative, content in outputs.items():
            path = ROOT / relative
            if args.check:
                require(path.exists() and path.read_text(encoding="utf-8") == content,
                        f"Stale or missing output: {relative}")
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
        action = "Checked" if args.check else "Generated"
        print(f"{action} historical free rights for {len(PAIRS)} pairs: "
              f"{sum(len(pair['catalogue']['sourceIndices']) for pair in manifest['pairs'])} "
              "catalogue index rights, 308 unchanged conversation L1 variants.")
        return 0
    except (ValueError, KeyError, OSError, json.JSONDecodeError,
            subprocess.CalledProcessError) as error:
        print(f"Legacy free rights error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
