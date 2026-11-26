# MVP hybride mobile — candidat à validation

Entrée dédiée : `/BET-ANALYST-P31-PREVIEW/mobile/`. Le site historique, OpenLigaDB, P3.2-B et C4 restent inchangés.

Parcours : choisir Football/NBA/Tennis ou une rencontre du calendrier football importé ; ajouter facultativement un dossier texte/JSON ; copier la demande complète ; ouvrir ChatGPT, coller et envoyer ; coller ensuite le rapport dans la même rencontre et l'enregistrer. Historique texte intégral, téléchargement TXT, sauvegarde JSON et restauration fusionnée sans doublons. Les brouillons restent locaux ; changement de rencontre bloqué tant qu'un rapport non enregistré est présent.

Le transfert et le retour du rapport sont manuels. Aucun appel API payant ni synchronisation ChatGPT automatique. Aucune collecte statistique automatique supplémentaire : ChatGPT recherche les données à la demande. Les calendriers NBA/Tennis ne sont pas intégrés ; leur recherche libre fonctionne via la même demande d'analyse. Dossier importé non validé et conservé en quarantaine ; aucun raccordement réel à C4.

## Méthode et provenance

KRAFT V3.0 intégral réutilisé sans modification depuis `BET-ANALYST-C3-TEST/experimental/KRAFT_V3_REFERENCE.txt`, identique à la référence archivée, 24 189 octets, SHA-256 `4ec636f1d6b135ffa79446c4782adb28255eb44a4daa28ed2f69e834975f7f67`. Chargement refusé si empreinte différente. Le cahier des charges 0.2, DM V1.0 et registre v3.5 ont été lus dans les archives. DM reste indépendant, sans module financier ajouté. Les textes intégraux originaux de G0, IO V1.0 et LAB L1.1 n'ont pas encore été retrouvés ; les résumés de continuité ne les remplacent pas. C1/C2/C3 conservent leur statut expérimental. Cette réserve empêche de déclarer la mission intégrale terminée ou une conformité complète.

## Données et sauvegardes

Clés historiques conservées : `bet.mobile.calendar.v1`, `bet.mobile.reports.v1`. Brouillon : `bet.mobile.draft.v2`. Les anciennes entrées sont lues sans effacement ni migration destructive. Une histoire corrompue bloque sauvegarde/restauration plutôt que d'être remplacée par une liste vide. Export local privé contenant dossiers et calendrier ; aucun envoi réseau de ces contenus par l'application. La restauration fusionne les rapports ; le calendrier de sauvegarde est contrôlé et récupérable séparément, sans remplacement silencieux du calendrier actuel. Empreinte interne = intégrité, pas authenticité.

Le navigateur peut supprimer le stockage local. Sauvegarde externe recommandée aux jalons utiles. Un autre onglet ouvert simultanément peut entraîner un conflit de dernière écriture : usage dans un seul onglet conseillé pour cette version.

## Hors ligne

Après première ouverture en ligne et activation du service worker : interface, recherche locale du calendrier déjà importé, dossiers, copie KRAFT, brouillon, rapports et sauvegardes. Rechargement racine/index avec UTM couvert par la régression dédiée. ChatGPT et toute nouvelle collecte exigent une connexion. Le cache mobile ne supprime aucun cache historique.

## Vérification

`node --test mobile/store.test.js` : validation du stockage, sauvegardes, héritage, refus conservateurs et calendrier. `mobile-regression.cjs`, workflow `Mobile hybrid end-to-end` : parcours fictifs des trois sports, viewport 393x851, brouillon, sauvegarde, refus d'import, calendrier en quarantaine, rechargement hors ligne avec UTM et préservation d'historique. Ces tests ne prouvent aucune validité sportive. Résultat CI et validation Android physique à consigner au jalon.

Android : ouvrir le lien mobile dans Chrome connecté ; préparer une rencontre, copier et envoyer la demande dans ChatGPT ; revenir enregistrer le rapport. Menu Chrome > Ajouter à l'écran d'accueil > Installer si proposé. Tester ensuite un rechargement en mode avion et l'ouverture du rapport. Ne pas déduire la validation physique de Chromium.
