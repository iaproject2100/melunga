#!/usr/bin/env python3
"""Freeze the separate situation ledgers and portable conversation search index.

Only documentation inputs are written. This tool never writes runtime data.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("situation_content", Path(__file__).with_name("situation_content.py"))
content = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(content)
PAIRS = {"fr-en": ("fr", "en"), "fr-es": ("fr", "es"), "fr-it": ("fr", "it"),
         "fr-zh": ("fr", "zh"), "fr-ja": ("fr", "ja"), "fr-ko": ("fr", "ko"), "zh-fr": ("zh", "fr")}


def utterances(value, pointer=""):
    if isinstance(value, dict):
        if all(isinstance(value.get(key), str) for key in ("study", "native", "phon")):
            yield pointer, value
        for key, child in value.items():
            token = key.replace("~", "~0").replace("/", "~1")
            yield from utterances(child, pointer + "/" + token)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from utterances(child, pointer + "/" + str(index))


def search_index(archive):
    result = {"version": 1, "status": "source-search-index-not-runtime-cards",
              "purpose": "Detect existing studied forms; no indexed entry is counted as a new phrase.", "pairs": {}}
    for pair, languages in PAIRS.items():
        files, entries = [], []
        for level in range(1, 11):
            path = archive / f"L{level}-{pair}.json"
            content.ensure(path.is_file(), f"Missing complete conversation source: {path.name}")
            document = json.loads(path.read_text())
            content.ensure((document.get("nativeLanguage"), document.get("studyLanguage")) == languages,
                           f"Wrong source pair: {path.name}")
            fingerprint = content.file_sha(path)
            files.append({"sourceFile": path.name, "fileSha256": fingerprint})
            for pointer, entry in utterances(document):
                entries.append({"sourceFile": path.name, "fileSha256": fingerprint, "jsonPointer": pointer,
                                "entrySha256": content.sha(entry), "study": entry["study"], "native": entry["native"]})
        result["pairs"][pair] = {"files": files, "entries": entries}
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=Path("/workspace/melunga-progression-corrections/melunga_deploy/content/conversation"))
    parser.add_argument("--index-only", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    directory = ROOT / content.DIRECTORY
    index_path = directory / "search-index.json"
    if args.archive.is_dir():
        index_text = json.dumps(search_index(args.archive), ensure_ascii=False, indent=2) + "\n"
        if args.check:
            content.ensure(index_path.is_file() and index_path.read_text() == index_text, "Stale portable source search index")
        else:
            directory.mkdir(parents=True, exist_ok=True)
            index_path.write_text(index_text)
    else:
        content.ensure(index_path.is_file(), "Supply the source archive once to prepare a portable search index")
    if args.index_only:
        print(json.dumps({"searchIndex": str(index_path.relative_to(ROOT)), "sha256": content.file_sha(index_path)}))
        return
    _plan, _intents, plan_hash = content.read_plan(ROOT)
    pair_files = []
    for pair in PAIRS:
        path = directory / f"{pair}.json"
        content.ensure(path.is_file(), f"Language ledger not ready: {pair}")
        pair_files.append({"pair": pair, "path": str(path.relative_to(ROOT)), "sha256": content.file_sha(path)})
    catalogue = {"version": 1, "status": "ready-for-preview", "publicationApproved": False,
                 "planSha256": plan_hash, "pairFiles": pair_files,
                 "searchIndexPath": str(index_path.relative_to(ROOT)), "searchIndexSha256": content.file_sha(index_path)}
    # Validate everything before activating the frozen catalogue. The temporary
    # validation path is private documentation, never a runtime publication.
    catalogue_path = directory / "catalogue.json"
    text = json.dumps(catalogue, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        content.ensure(catalogue_path.is_file() and catalogue_path.read_text() == text, "Stale situation catalogue freeze")
        content.read_frozen_inputs(ROOT, PAIRS)
    else:
        previous = catalogue_path.read_bytes() if catalogue_path.exists() else None
        catalogue_path.write_text(text)
        try:
            content.read_frozen_inputs(ROOT, PAIRS)
        except Exception:
            if previous is None:
                catalogue_path.unlink()
            else:
                catalogue_path.write_bytes(previous)
            raise
    print(json.dumps({"pairs": len(pair_files), "candidates": 80 * len(pair_files), "planSha256": plan_hash,
                      "catalogueSha256": content.file_sha(catalogue_path)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
