#!/usr/bin/env python3
"""Inventory all catalogue levels without changing a source phrase or its level.

The report distinguishes a catalogue level, a declared guided-family reference,
and a future editorial decision. None of those is evidence of acquisition.
Only the two report files and an optional temporary export directory are written.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "melunga_deploy/app.html"
REPORT = ROOT / "docs/niveaux-progressifs/inventaire.json"
DOC = ROOT / "docs/niveaux-progressifs/inventaire.md"
PAIRS = (
    ("fr-en", "fr", "en", "Anglais", 323),
    ("fr-es", "fr", "es", "Espagnol", 289),
    ("fr-it", "fr", "it", "Italien", 338),
    ("fr-zh", "fr", "zh", "Chinois", 314),
    ("fr-ja", "fr", "ja", "Japonais", 290),
    ("fr-ko", "fr", "ko", "Coréen", 287),
    ("zh-fr", "zh", "fr", "Français pour sinophones", 293),
)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def field_map(study):
    result = {
        "study": "t", "native": "cn" if study == "fr" else "frm",
        "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf",
    }
    if study in ("zh", "ja", "ko"):
        result["reading"] = "py"
    return result


def valid_level(value):
    return type(value) is int and 1 <= value <= 10


def missing_string(value):
    return not isinstance(value, str) or not value.strip()


def archive_references():
    """Names of existing review artefacts, not dependencies of this inventory."""
    base = "review/progression-L1-L10:docs/progression-corrections/"
    return [
        {"gitReference": base + "parcours-corriges.json",
         "purpose": "Previous reviewed proposal for conversation units; not a reclassification of the 32,115 catalogue cards."},
        {"gitReference": base + "editorial-en-es.json", "purpose": "English/Spanish unit decisions."},
        {"gitReference": base + "editorial-ko-it.json", "purpose": "Korean/Italian unit decisions."},
        {"gitReference": base + "editorial-zh-ja.json", "purpose": "Chinese/Japanese unit decisions."},
        {"gitReference": base + "editorial-zh-fr.json", "purpose": "French for sinophones unit decisions."},
        {"gitReference": base + "transition-es/preparations.json",
         "purpose": "Existing catalogue preparations for the Spanish transition."},
        {"gitReference": base + "reprise-globale/cadre-commun.json",
         "purpose": "Earlier common level framework; proposal to examine, not proof of catalogue progressivity."},
    ]


def inventory():
    raw = APP.read_bytes()
    source_line = next(line for line in raw.decode().splitlines() if line.startswith("var DECKS = "))
    decks = json.loads(source_line.split("=", 1)[1].strip().rstrip(";"))
    report = {
        "version": 1, "status": "inventory-not-a-progressivity-validation",
        "sourceFile": "melunga_deploy/app.html",
        "sourceAppSha256": hashlib.sha256(raw).hexdigest(),
        "sourceDecksSha256": digest(decks),
        "scope": "The seven primary catalogue pairs and every source card, without deduplication.",
        "doesNotMeasureAcquisition": True, "publicationApproved": False,
        "sourceLevelChanges": 0, "studiedPhraseChanges": 0, "phoneticChanges": 0,
        "historicalL1Meaning": "Cards whose original catalogue level is the integer 1; this is not the union of all historical free rights.",
        "guidedReferenceMeaning": "Declarations from card.arch; neither their source links nor pedagogical preparation are validated by this count.",
        "priorReviewReferences": archive_references(),
        "runtimeConversationSources": {
            "presentCount": len(list((ROOT / "melunga_deploy/content/conversation").glob("*.json"))),
            "expectedHistoricalCount": 110,
            "note": "Historical conversation sources and their unit review are a separate corpus. Their presence must be verified before calling them integrated.",
        },
        "pairs": [], "totals": {},
    }
    exports = {}
    for pair_id, native, study, label, historical in PAIRS:
        deck = decks[study]
        fmap = field_map(study)
        categories = Counter(str(card.get("cat", "<missing>")) for card in deck)
        fields_missing = {field: [i for i, card in enumerate(deck) if missing_string(card.get(source_field))]
                          for field, source_field in fmap.items()}
        families = defaultdict(lambda: {"references": 0, "sourceIndices": set(),
                                         "sourceLevels": Counter(), "pathLevels": Counter()})
        malformed_arch = []
        exported = []
        for index, card in enumerate(deck):
            declared = card.get("arch", [])
            if not isinstance(declared, list):
                malformed_arch.append(index)
                declared = []
            for item in declared:
                if not isinstance(item, dict) or not isinstance(item.get("id"), str):
                    malformed_arch.append(index)
                    continue
                family = families[item["id"]]
                family["references"] += 1
                family["sourceIndices"].add(index)
                family["sourceLevels"][str(card.get("lv"))] += 1
                family["pathLevels"][str(item.get("pathLv"))] += 1
            row = {"id": f"catalogue:{study}:{index}", "sourceIndex": index,
                   "sourceLevel": card.get("lv"), "category": card.get("cat"),
                   "themeTag": card.get("th"), "arch": card.get("arch", []),
                   "sourceSha256": digest(card)}
            row.update({field: card.get(source_field) for field, source_field in fmap.items()})
            exported.append(row)
        level_rows = []
        for level in range(1, 11):
            indices = [i for i, card in enumerate(deck) if type(card.get("lv")) is int and card["lv"] == level]
            source_family_ids = {item["id"] for i in indices for item in deck[i].get("arch", [])
                                 if isinstance(item, dict) and isinstance(item.get("id"), str)}
            path_items = [item for card in deck for item in card.get("arch", [])
                          if isinstance(item, dict) and type(item.get("pathLv")) is int and item["pathLv"] == level]
            level_rows.append({
                "level": level, "cards": len(indices),
                "categories": dict(sorted(Counter(str(deck[i].get("cat", "<missing>")) for i in indices).items())),
                "missingFields": {field: sum(i in set(missing) for i in indices) for field, missing in fields_missing.items()},
                "declaredFamiliesOnCardsAtThisSourceLevel": len(source_family_ids),
                "declaredReferencesAtThisPathLevel": len(path_items),
                "declaredFamiliesAtThisPathLevel": len({item["id"] for item in path_items if isinstance(item.get("id"), str)}),
            })
        family_rows = [{"id": key, "references": value["references"],
                        "sourceIndices": sorted(value["sourceIndices"]),
                        "sourceLevels": dict(sorted(value["sourceLevels"].items())),
                        "pathLevels": dict(sorted(value["pathLevels"].items()))}
                       for key, value in sorted(families.items())]
        pair = {
            "id": pair_id, "nativeLanguage": native, "studyLanguage": study, "label": label,
            "totalCards": len(deck), "deckSha256": digest(deck), "fieldMap": fmap,
            "historicalL1Expected": historical, "historicalL1Observed": level_rows[0]["cards"],
            "historicalL1Matches": level_rows[0]["cards"] == historical,
            "categories": dict(sorted(categories.items())), "levels": level_rows,
            "invalidSourceLevelIndices": [i for i, card in enumerate(deck) if not valid_level(card.get("lv"))],
            "missingFields": fields_missing,
            "declaredGuidedFamilyCount": len(families),
            "declaredGuidedReferenceCount": sum(value["references"] for value in families.values()),
            "malformedGuidedReferenceIndices": sorted(set(malformed_arch)),
            "declaredGuidedFamilies": family_rows,
        }
        report["pairs"].append(pair)
        exports[pair_id] = {"pair": pair_id, "sourceDeckSha256": pair["deckSha256"],
                            "fieldMap": fmap, "cards": exported}
    report["totals"] = {
        "pairs": len(report["pairs"]), "levelCells": len(report["pairs"]) * 10,
        "sourceCards": sum(pair["totalCards"] for pair in report["pairs"]),
        "historicalLevelOneCards": sum(pair["historicalL1Observed"] for pair in report["pairs"]),
        "historicalLevelOneExpected": sum(pair["historicalL1Expected"] for pair in report["pairs"]),
        "historicalLevelOneMatches": all(pair["historicalL1Matches"] for pair in report["pairs"]),
        "invalidSourceLevelCards": sum(len(pair["invalidSourceLevelIndices"]) for pair in report["pairs"]),
        "missingRequiredStudyNativePhonFields": sum(len(pair["missingFields"][field])
                                                    for pair in report["pairs"] for field in ("study", "native", "phon")),
        "declaredGuidedFamilies": sum(pair["declaredGuidedFamilyCount"] for pair in report["pairs"]),
        "declaredGuidedReferences": sum(pair["declaredGuidedReferenceCount"] for pair in report["pairs"]),
        "sourceCategoryCounts": dict(sorted(sum((Counter(pair["categories"]) for pair in report["pairs"]), Counter()).items())),
    }
    return report, exports


def markdown(report):
    card_total = format(report["totals"]["sourceCards"], ",").replace(",", " ")
    korean = next(pair for pair in report["pairs"] if pair["id"] == "fr-ko")
    rows = ["# Inventaire complet des niveaux source L1–L10", "",
            "Cet inventaire compte le contenu présent, sans lui attribuer une difficulté nouvelle. Un niveau source, une référence de famille guidée et une future décision éditoriale sont trois informations distinctes.", "",
            f"**{card_total} cartes**, sept couples, 70 cellules de niveau. Aucun texte, aide phonétique ou niveau de catalogue n'est modifié. Aucun doublon de texte n'est fusionné.", "",
            "## Volumes par niveau source", "",
            "| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Total |",
            "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for pair in report["pairs"]:
        rows.append("| " + pair["id"] + " | " + " | ".join(str(row["cards"]) for row in pair["levels"]) + f" | {pair['totalCards']} |")
    totals = [sum(pair["levels"][level]["cards"] for pair in report["pairs"]) for level in range(10)]
    rows.append("| **Total** | " + " | ".join(str(value) for value in totals) + f" | **{report['totals']['sourceCards']}** |")
    rows.extend(["", "Les **2 134 cartes source L1** de la maquette précédente sont retrouvées exactement. Ce total ne compte pas l'union des cibles guidées, des dialogues ou de « Mes phrases » historiquement gratuits ; il ne sert donc pas à réduire ou redéfinir les droits.", "",
                 "## Champs et références", "",
                 "| Couple | Texte étudié | Sens natif | Phonétique de la méthode | Lecture complémentaire | Familles déclarées | Références déclarées |",
                 "|---|---|---|---|---|---:|---:|"])
    for pair in report["pairs"]:
        m = pair["fieldMap"]
        rows.append(f"| {pair['id']} | `{m['study']}` | `{m['native']}` | `{m['phon']}` | "
                    + (f"`{m['reading']}`" if "reading" in m else "—")
                    + f" | {pair['declaredGuidedFamilyCount']} | {pair['declaredGuidedReferenceCount']} |")
    rows.extend(["", f"Champs étudié/sens/phonétique manquants ou vides : **{report['totals']['missingRequiredStudyNativePhonFields']}**. Niveaux source absents ou hors L1–L10 : **{report['totals']['invalidSourceLevelCards']}**.", "",
                 f"Le coréen porte **{korean['declaredGuidedReferenceCount']} référence(s) `arch`** dans ce catalogue, tous niveaux confondus. Ces comptes portent sur des déclarations : ils ne prouvent ni que les références sont correctes, ni qu'un élément a été préparé, ni qu'un apprenant l'a acquis.", "",
                 "## Autre corpus à reprendre séparément", "",
                 f"Le checkout courant contient **{report['runtimeConversationSources']['presentCount']} des 110 fichiers historiques de conversation** à `melunga_deploy/content/conversation/`. Les textes des unités et leur reclassement antérieur ne sont donc pas implicitement intégrés à cet inventaire du catalogue.", "",
                 "Le dossier antérieur `review/progression-L1-L10:docs/progression-corrections/` contient notamment `parcours-corriges.json`, les quatre fichiers `editorial-*.json`, les préparations de transition espagnole et le cadre commun. Il doit être récupéré et contrôlé comme un corpus distinct avant réemploi ; revoir 841 unités ne signifie pas avoir reclassé les 32 115 cartes.", "",
                 "## Reproduction", "", "```sh", "python3 -B tools/maquette-guidee/inventory_levels.py", "python3 -B tools/maquette-guidee/inventory_levels.py --check", "python3 -B tools/maquette-guidee/inventory_levels.py --export-dir /tmp/melunga-level-inventory", "```", "",
                 "L'export temporaire donne, par couple et indice source, le texte, le sens, l'aide, la lecture, le niveau, la catégorie et les références déclarées, sans normalisation. Les fichiers `inventaire.json` et `inventaire.md` sont les seuls artefacts versionnés produits par cet outil.", "",
                 f"Empreinte du catalogue complet : `{report['sourceDecksSha256']}`.", ""])
    return "\n".join(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--export-dir", type=Path)
    args = parser.parse_args()
    report, exports = inventory()
    outputs = {REPORT: json.dumps(report, ensure_ascii=False, indent=2) + "\n", DOC: markdown(report)}
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit("Out of date: " + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    if args.export_dir:
        args.export_dir.mkdir(parents=True, exist_ok=True)
        for pair_id, content in exports.items():
            (args.export_dir / (pair_id + ".json")).write_text(json.dumps(content, ensure_ascii=False, separators=(",", ":")) + "\n")
        (args.export_dir / "manifest.json").write_text(json.dumps({"sourceDecksSha256": report["sourceDecksSha256"],
            "pairs": [{"id": pair["id"], "cards": pair["totalCards"], "fieldMap": pair["fieldMap"]} for pair in report["pairs"]]}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(report["totals"], ensure_ascii=False))


if __name__ == "__main__":
    main()
