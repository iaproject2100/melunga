# Release validation

Final controller SHA-256: `9a7b4eddbef7fa74b09063a11d06be4621eabb5fa763780597e2ad0bf84ba5d3`.

- Current browser Next/progress acceptance: 6 tests pass, 150 stable input fingerprints. See `../progress-chinese-completion/acceptance-after.json`.
- Current desktop readability acceptance: 16 cases pass, 169 stable input fingerprints. See `acceptance.json`.
- Startup browser acceptance: 12 cases pass, 215 stable input fingerprints.
- Entry/access browser acceptance: 6 groups / 29 cases pass, 208 stable input fingerprints.
- Finite Chirp/server audio source gates: 12 tests pass.
- Approved shared audio integration: 15 tests pass.
- Chirp layer, native routing layer and entry asset validation pass. Four runtime pins changed; the other 20 retained their prior hashes. The finite inventory remains 13 modified and 11 added assets. The seven protected progress functions, 78 runtime course JSON files, rights, billing and audio selection remain protected.
- Three historical browser fixtures received only the assertions required by the approved Next decision. Their syntax was checked; these historical fixtures were not executed as current acceptance suites. The new browser suites exercise the delivered current scripts and content.

All browser runs used local Chromium and explicit local access/catalogue/media fixtures. No real account or provider calls were made. Physical devices and Safari were not tested. No earlier unrecorded user completion can be reconstructed by this change.

Public production UI was not verified from this managed environment. Source publication and a public preview image are verified separately after commit.
