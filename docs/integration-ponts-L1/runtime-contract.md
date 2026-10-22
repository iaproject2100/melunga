# L1 café runtime contract

This review bundle contains exactly seven reader/study pairs (`fr-en`, `fr-es`,
`fr-it`, `fr-zh`, `fr-ja`, `fr-ko`, `zh-fr`). Native review is pending. Integration
does not approve production, certify acquisition, or grade answers. Existing
entitlements and prices are preserved; the seven added scenes are free L1 content
for paying and non-paying users, an explicit extension of the free offering.

Rebuild and verify from the repository root:

```sh
python3 tools/pedagogy/build_l1_runtime.py
python3 tools/pedagogy/build_l1_runtime.py --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_l1_runtime.py'
```

The builder uses `git show` for ten exact objects from commit
`30e7d40a8af3f51ee186bf83f983596b8ca8798f`: the approved bridge plan, main phrase
bank, fragment bank, and seven canonical L1 conversation files. Fixed SHA256
values verify raw bytes before JSON parsing. Older `sourceSnapshot` labels inside
those source documents are preserved source metadata, not the runtime's source
commit. No preview generator, unmerged PR, local source checkout, or other
conversation file is needed. The client fetches only `content/l1-cafe.json`.

The bundle has `version: 1`, `sourceCommit`, `sourceFilesSha256`,
`status: "integration-review-not-production-approved"`, `nativeReviewPending: true`,
`doesNotChangeAccess: true`, and `pairs`.

Each pair contains `id` (native-study), `nativeLanguage`, `studyLanguage`, `level: 1`,
canonical `roles` and `learnerRole: "A"`, `sourceDialogueId`, `dialogueId`, and
`contextReader: {scene, greeting, refusal}` copied from the approved reader context.
Its ordered `phrases` array has exactly seven entries:

| Position | Reference suffix | Speaker | Kind |
| --- | --- | --- | --- |
| 1 | `d1:t0` | A | learner |
| 2 | `d1:t1` | B | received |
| 3 | `09:v0` | A | learner |
| 4 | `d1:t3` | B | received |
| 5 | `d1:t4:refusal` | A | learner |
| 6 | `d1:t4:price` | A | learner |
| 7 | `d1:t5` | B | received |

Each phrase has `id` (the complete approved utterance reference), `kind`, `speaker`,
`study`, `native`, and every present aid key copied verbatim at the same level.
All entries contain `phon`; all fr-zh/fr-ja/fr-ko entries also contain `reading`.
No key or pronunciation is inferred. Greetings and server phrases are whole bank
copies. Orders match both unit 09 variant 0 and canonical turn 2. Refusal and price
are raw-parent-checked Unicode slices with the approved per-field boundaries and
separators; normalization or trimming would invalidate them.

Each pair also retains the two complete approved `bridgeUnits` (three steps each),
11 `preparation` steps, three scene `steps`, three `received` contracts, and the
pending `nativeReview` object. Every `utterance`, `utteranceId`, and phase `turns`
reference resolves against the seven phrase IDs. Bridge units prepare greeting
and refusal as whole expressions. The separate exact price question is prepared
in the scene; unit 10 does not implicitly prepare it.

The three scene phases are `listen-whole-dialogue`, `reply-with-help`, and
`reply-without-model`. Received server phrases stay visible in recall, with help
restorable. Welcome accepts the prepared order; the milk question accepts only
the prepared refusal; the amount requires no reply. Received content neither
requires learner production nor counts as production.

During learner recall, the ear remains visible and keyboard accessible. An
explicit activation restores the exact model and its aids, then reads the study
phrase. This is help, with no grade or mastery claim. Generic background audio
calls do not reveal a hidden answer. On received turns the ear reads directly;
received content is never hidden. The `doesNotChangeAccess` flag describes the
preservation of existing entitlements; it must not be read as saying that the
new free L1 entry offers no additional content.

The builder writes only `melunga_deploy/content/l1-cafe.json`; `--check` writes
nothing and requires byte-identical output. Tests independently read the pinned
Git sources, exercise corrupt pair/role/answer/aid/parent/span contracts, and build
twice in an isolated destination while checking that app bytes, its complete
current `DECKS` value, and all seven canonical files remain unchanged.
