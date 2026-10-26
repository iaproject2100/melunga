#!/usr/bin/env python3
"""Reproduce the selected lot-9 content counter-review without importing its producer."""
import argparse
import copy
import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[3]
BASE = "40d4c0b264b364fe31d4fd1bc9acae03dc130e01"
COMMIT = "5d450cc79f32d180f9331c5d06387fe36e8d94a6"
EVIDENCE = "docs/revue-integrale/lot9-fr-it-L1-L10/lot-contenu-gloses.json"
PHONETIC_EVIDENCE = "docs/revue-integrale/lot9-fr-it-L1-L10/registre-phonetique.json"
EVIDENCE_SHA = "cf20a6f4595f4e8c3627aac8bd4956ef5724bd9f220b2676288a88878f4636a0"
REGISTRY = "docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"


LINGUISTIC_NOTES = {'catalogue:it:2647': 'Le proverbe français retenu explicite le caractère nuisible de l’excès ; l’ancienne glose peut néanmoins convenir dans certains contextes.', 'catalogue:it:218': 'Le remerciement grazie est désormais rendu sans changer la réception exprimée.', 'catalogue:it:321': 'Ti impose ici le tutoiement dans la demande du montant dû.', 'catalogue:it:2883': 'Assurdo exprime une appréciation d’absurdité, sans imposer une approbation argotique.', 'catalogue:it:3272': 'La langue étudiée nommée l’italiano est bien l’italien.', 'catalogue:it:1794': 'L’accord ouverts rend explicite le pluriel italien ; le français de service peut ailleurs viser un représentant singulier.', 'situation-authored:fr-it:piste-sport-habitudes-04': 'Le sujet ogni allenamento et la durée générale sont restitués.', 'catalogue:it:502': 'Da parte mia est rendu explicitement par de ma part.', 'catalogue:it:629': 'La demande téléphonique est comprise comme impératif formel Lei, donc ne quittez pas.', 'catalogue:it:3092': 'Stare per exprime l’imminence, distincte du progressif stare avec gérondif.', 'catalogue:it:970': 'Vuoi exprime la volonté à la deuxième personne.', 'catalogue:it:930': 'Sotto zero est traduit sans l’expression numérique incohérente moins zéro.', 'catalogue:it:734': 'Le complément le abitudini est restitué sans changer le sujet implicite.', 'catalogue:it:841': 'Le clitique ne de parlarne est rendu par en.', 'catalogue:it:846': 'La formulation française retenue conserve l’anticipation au futur et le tour idiomatique.', 'catalogue:it:978': 'Fai et tua indiquent un tutoiement singulier.', 'situation-authored:fr-it:transport-imprevus-06': 'Usare ancora exprime la possibilité d’utiliser encore le billet, au-delà de sa seule conservation.', 'situation-authored:fr-it:piste-equipement-chambre-08': 'Bene est rendu par bien dans le remerciement après le séjour.', 'catalogue:it:1375': 'Les deux clitiques te et lo sont tous deux rendus.', 'catalogue:it:1208': 'Centrare il bersaglio exprime le résultat d’atteindre la cible.', 'situation-authored:fr-it:piste-depannage-connexion-05': 'Un’altra rete reste indéfini : un autre réseau.', 'catalogue:it:1603': 'Mon billet est cohérent avec le thème déplacements ; biglietto peut ailleurs désigner une carte de visite par ellipse.', 'catalogue:it:1466': 'L’expression indique l’opportunité, pas l’évidence.', 'catalogue:it:1506': 'Precisare est rendu explicitement par préciser.', 'catalogue:it:1591': 'In italiano désigne l’italien, sans substitution par la langue de l’interface.', 'catalogue:it:1736': 'L’objet l’ est restitué ; la correction phonétique antérieure du même lot est conservée.', 'catalogue:it:1859': 'Domattina indique demain matin ; à la première heure garde ici l’idée de presto.', 'catalogue:it:4091': 'Direi est un conditionnel, rendu par dirais.', 'catalogue:it:2249': 'L’italien nommé dans la question est conservé dans le dialogue.', 'catalogue:it:2270': 'La question vise l’italien et le mot cité reste appuntamento ; sa traduction lexicale ne remplace pas la citation.', 'catalogue:it:2244': 'La question porte sur la maîtrise de l’italien.', 'catalogue:it:2360': 'Ravi de faire votre connaissance convient à cette formule de rencontre formelle.', 'heard-authored:fr-it:piste-depannage-connexion-received-01': 'Mi est restitué par m’ dans la question reçue.', 'heard-authored:fr-it:piste-vetement-taille-received-01': 'Prende est rendu par prenez dans la question sur la taille.', 'catalogue:it:2489': 'Faccio seguito alla mia mail est une relance professionnelle explicite ; l’ancienne formule n’interdit pas tout usage métaphorique de tornare.', 'catalogue:it:3879': 'La via amichevole explicite la voie amiable dans le litige ; soluzione amichevole serait une variante possible.', 'catalogue:it:4098': 'Offre un prezzo più basso fournit une comparaison de prix complète pour le fournisseur.'}

def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", commit + ":" + path], cwd=ROOT)


def walk(value, location=()):
    if isinstance(value, dict):
        if all(k in value for k in ("id", "study", "native", "phon", "source")):
            yield location, value
        for key, child in value.items():
            if isinstance(child, (dict, list)):
                yield from walk(child, location + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            if isinstance(child, (dict, list)):
                yield from walk(child, location + (index,))


def at(document, location):
    for part in location:
        document = document[part]
    return document


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    raw = git_bytes(COMMIT, EVIDENCE)
    assert hashlib.sha256(raw).hexdigest() == EVIDENCE_SHA
    source = json.loads(raw)
    assert source["reference"] == BASE
    certain = [row for row in source["items"] if row["certainty"] == "certain"]
    uncertain = [row for row in source["items"] if row["certainty"] != "certain"]
    bundles = source["linkedBundles"]
    assert len(certain) == source["certainCount"] == 34
    assert Counter(row["field"] for row in certain) == {"native": 34}
    assert len(uncertain) == 96 and len(bundles) == 3
    rows = certain + bundles
    ids = {row["id"] for row in rows}
    assert len(ids) == 37
    assert set(LINGUISTIC_NOTES) == ids
    phonetic = json.loads(git_bytes(COMMIT, PHONETIC_EVIDENCE))
    assert len(phonetic["events"]) == 70
    overlap = ids.intersection(row["id"] for row in phonetic["events"])
    assert overlap == {"catalogue:it:1736"}
    phonetic_events = {row["id"]: row for row in phonetic["events"]}
    files = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX],
        cwd=ROOT, text=True,
    ).splitlines()
    files = [path for path in files if path.endswith(".json") and not path.endswith("/manifest.json")]
    assert len(files) == 77
    found, current_found = defaultdict(list), defaultdict(list)
    runtime_documents = {}
    for path in files:
        document = json.loads(git_bytes(BASE, path))
        for location, phrase in walk(document):
            if phrase["id"] in ids:
                profile = "received-model" if "receivedModels" in location else "transport-phrase" if "/repertoires/" in path else "canonical"
                found[phrase["id"]].append({"path": path, "location": list(location), "profile": profile, "phrase": phrase})
        if args.runtime:
            runtime_documents[path] = json.loads((ROOT / path).read_text())
            for location, phrase in walk(runtime_documents[path]):
                if phrase["id"] in ids:
                    current_found[phrase["id"]].append((path, list(location)))
    assert set(found) == ids
    profiles = Counter(o["profile"] for entries in found.values() for o in entries)
    assert profiles == {"canonical": 35, "received-model": 2}
    assert all(len(entries) == 1 for entries in found.values())
    if args.runtime:
        assert set(current_found) == ids
        assert all(sorted(current_found[i], key=str) == sorted([(o["path"], o["location"]) for o in found[i]], key=str) for i in ids)
        registry_sha = hashlib.sha256((ROOT / REGISTRY).read_bytes()).hexdigest()
    else:
        registry_sha = None
    records = []
    field_counts, runtime_fields = Counter(), Counter()
    for row in rows:
        fields = {row["field"]: row["before"]} if "field" in row else row["before"]
        after = {row["field"]: row["after"]} if "field" in row else row["after"]
        if "field" in row:
            assert row["field"] in {"native", "study"}
        else:
            assert row["applyTogether"] and row["certainty"] == "certain"
            assert set(fields) == set(after) == {"study", "phon", "native"}
        assert all(fields[field] != value for field, value in after.items())
        field_counts.update(after.keys())
        occurrences = []
        for occurrence in found[row["id"]]:
            before = occurrence["phrase"]
            assert before.get("editorialLevel") == row["level"]
            if "field" in row:
                assert before["study"] == row["study"]
            assert all(before[field] == value for field, value in fields.items())
            assert not any(key.endswith("Correction") for key in before), "unexpected prior correction annotation"
            runtime_fields.update(after.keys())
            if args.runtime:
                current = at(runtime_documents[occurrence["path"]], occurrence["location"])
                immediate_before = copy.deepcopy(before)
                if row["id"] in overlap:
                    a = phonetic_events[row["id"]]
                    assert before["phon"] == a["beforePhon"]
                    a_registry = "docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json"
                    immediate_before["phon"] = a["afterPhon"]
                    immediate_before["phoneticReviewStatus"] = "corrected-by-Claude-lot9-" + "+".join(a["rules"])
                    immediate_before["lot9PhoneticCorrection"] = {
                        "id": row["id"], "registryPath": a_registry,
                        "registrySha256": hashlib.sha256((ROOT / a_registry).read_bytes()).hexdigest(),
                        "baseSnapshotCommit": BASE, "fields": ["phon"],
                        "beforeFields": {"phon": a["beforePhon"]},
                        "originalPhoneticReviewStatusPresent": "phoneticReviewStatus" in before,
                        "originalPhoneticReviewStatus": before.get("phoneticReviewStatus"),
                        "evidenceCommits": [COMMIT],
                    }
                assert all(current[field] == value for field, value in after.items())
                declaration = current.get("lot9ContentCorrection")
                assert isinstance(declaration, dict) and declaration["id"] == row["id"]
                assert set(declaration) == {"id", "registryPath", "registrySha256", "baseSnapshotCommit", "fields", "beforeFields", "originalPhoneticReviewStatusPresent", "originalPhoneticReviewStatus", "evidenceCommits"}
                assert declaration["fields"] == sorted(fields) and declaration["beforeFields"] == fields
                assert declaration["registryPath"] == REGISTRY and declaration["registrySha256"] == registry_sha
                assert declaration["baseSnapshotCommit"] == BASE and declaration["evidenceCommits"] == [COMMIT]
                assert declaration["originalPhoneticReviewStatusPresent"] is ("phoneticReviewStatus" in immediate_before)
                assert declaration["originalPhoneticReviewStatus"] == immediate_before.get("phoneticReviewStatus")
                expected = copy.deepcopy(immediate_before)
                expected.update(after)
                expected["lot9ContentCorrection"] = declaration
                if "phon" in after:
                    assert current["phoneticReviewStatus"] == "corrected-by-Claude-content-lot9"
                    expected["phoneticReviewStatus"] = current["phoneticReviewStatus"]
                assert current == expected, (row["id"], "undeclared field/source/status/annotation changed")
            occurrences.append(occurrence)
        records.append({
            "id": row["id"], "decision": "accepted-as-a-bounded-event",
            "individualLinguisticNote": LINGUISTIC_NOTES[row["id"]],
            "fields": sorted(after), "before": fields, "after": after,
            "nativeGuardsUnchanged": [o["phrase"]["native"] for o in found[row["id"]]] if "native" not in fields else [],
            "phoneticAndStatusGuardForStudyOnly": list(fields) == ["study"],
            "sourceOccurrences": occurrences, "runtimeChecked": args.runtime,
        })
    assert dict(field_counts) == {"native": 37, "study": 3, "phon": 3}
    assert dict(runtime_fields) == {"native": 37, "study": 3, "phon": 3}
    report = {
        "id": "codex-lot9-selected-content-counter-review",
        "reviewedAt": datetime.now(timezone.utc).isoformat(),
        "humanDateParis": datetime.now(ZoneInfo("Europe/Paris")).strftime("%d/%m/%Y"),
        "sourceCommit": COMMIT, "beforeSnapshotCommit": BASE,
        "evidencePathAtSource": EVIDENCE, "evidenceSha256": EVIDENCE_SHA,
        "status": "selected-content-accepted",
        "publicationApproved": False, "globalNativeApproval": False,
        "runtimeChecked": args.runtime, "runtimeDocumentsScanned": 77,
        "certainNativeGlosses": 34, "punctuationOnlyStudies": 0,
        "linkedBundles": 3, "selectedIds": 37, "canonicalObjects": 35,
        "transportCopies": 0, "receivedModels": 2,
        "approvedFieldCounts": dict(field_counts), "approvedFieldTotal": sum(field_counts.values()),
        "runtimeFieldCounts": dict(runtime_fields), "runtimeFieldTotal": sum(runtime_fields.values()),
        "beforeMismatches": 0, "overlapWithPhoneticRegistry": sorted(overlap),
        "priorCorrectionAnnotationsOnSelectedObjects": [],
        "unappliedUncertainContentItems": 96,
        "uncertainCountAnnouncedInSourceReadme": 93,
        "uncertainCountDiscrepancy": "The source JSON contains 130 items: 34 certain and 96 uncertain. Three linked bundles are in a separate array, not three of those uncertain items.",
        "linguisticQualifications": [
            "Il troppo stroppia is rendered by the accepted proverb L'exces nuit en tout; Trop c'est trop can also convey excess in context and is not universally a mistranslation.",
            "Biglietto can elliptically designate a business card in a suitable exchange; mon billet is the explicit reading retained for catalogue:it:1603 in the existing travel theme.",
            "Siete aperti is plural in Italian; the selected French agreement ouverts makes that plural explicit. French service questions can instead address one representative with polite singular agreement, depending on the addressee.",
            "Resti in linea is interpreted here as a formal telephone imperative. Resti can have other grammatical analyses outside this complete telephone request.",
            "Torno da voi may have a metaphorical discourse use. Faccio seguito alla mia mail is the explicit professional follow-up chosen for this card, not a general prohibition on every metaphorical tornare.",
            "La via amichevole is a valid amicable-settlement formulation; soluzione amichevole would be another valid choice, not a required substitution.",
            "Offre un prezzo piu basso explicitly supplies the price complement missing from the selected supplier comparison.",
            "The three complete replacement aids are copied whole; no segments are generated or joined by this checker.",
            "catalogue:it:1736 receives its complete phonetic event first, then its native-gloss event. Both provenance declarations and the phonetic status after the first event are preserved.",
        ],
        "limitations": [
            "Targeted individual counter-reading of 37 selected content records, not a second reading of all 4,756 positions.",
            "No real audio or native-speaker certification.",
            "280 placement proposals, 30 conventions and all 96 uncertain source-JSON content items are not applied.",
        ],
        "corrections": records,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
