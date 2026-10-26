# Rétablir la disposition mobile de l’en-tête

L’image `melunga-logo.png` est identique depuis la version précédente ; son empreinte est `1aa277028faa2128c78405c839748dff8b1497827c04b02610216056c92b18c0`. C’était l’affichage en leçon qui compactait le logo et déplaçait les quatre commandes sur la même ligne.

Treize règles CSS propres à la leçon et au bilan sont retirées. Sur téléphone étroit, le logo retrouve son rang centré et sa taille normale, les commandes reprennent la ligne du dessous. Sur les écrans intermédiaires, la disposition responsive normale est conservée ; le rail ordinateur est inchangé. L1–L10 gardent leurs couleurs et le menu reste accessible. Seuls le CSS et son cache-busting dans les deux HTML changent.

Sept contrôles indépendants réussis, 13 cas, cinq formats : contre-épreuve du compactage précédent, positions de l’en-tête, contenu complet de la carte avec Pinyin, bilan, deux phrases longues L10 chinoise/espagnole, géométrie desktop identique et menus fonctionnels. Chromium local, tailles simulées, aucun téléphone physique. Les seuls appels d’accès sont des GET simulés ; aucune opération de compte.

Les 78 JSON, le JavaScript, les deux copies du logo, les droits, comptes et prix sont identiques à la base publiée `05c5110`. Les huit assets finis sont épinglés et quatre altérations sont refusées. L’audit de données précédent est réutilisé explicitement ; aucune grande matrice de contenu n’est prétendue rejouée. La PR des séquences reste séparée et non fusionnée.
