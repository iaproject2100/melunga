# Vérification indépendante de la tranche de contenu

Les **638 décisions sources** sont auditées. **637 sont appliquées** : **478 gloses et 159 blocs atomiques**. L’événement italien 211 est officiellement retiré par l’erratum auteur 4247ca4 et reste entièrement à son état avant. Les 145 propositions initialement écartées restent absentes.

Le contrôle indépendant vérifie **654 objets / 887 champs** dans les 70 cellules et 7 banques de transport, ainsi que le manifeste. Il compare les objets complets, les valeurs après et les champs inchangés aux documents Git figés et aux seuls événements autorisés. Les anciennes annotations, positions, rôles, étapes, accès et copies restent exacts. La projection inverse privée est construite seulement après ces contrôles.

Les compteurs de concepts sont recalculés depuis les objets corrigés et leurs références explicites. La projection historique restaure les compteurs sources uniquement après validation de leur valeur corrigée.

La contrelecture intégrale qualifie les variantes et reformulations contextuelles. Ce résultat mécanique ne constitue pas une certification native globale.

Tests négatifs propres à cette couche : **39 fautes rejetées**. La suite historique complète n’est pas relancée par cette commande.

Reproduction :

```sh
python3 tools/maquette-guidee/check_uncertain_content_independent.py --self-test --check-report
python3 tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report
```

SHA du registre : `3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130`.
SHA des fichiers runtime réels : `096ecf05c3239ac494e8f94960208af4903b605f479990e31c2492ca101ab7f3`.
