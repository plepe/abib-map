# Wie funktioniert karte.a-bibliothek.org
## Drupal
Eine Drupal 10 Installation ist installiert im User ‘karte’ auf karte.a-bibliothek.org

Pfade:
* /home/karte/drupal – Drupal Installation
* /home/karte/htdocs – Root Verzeichnis für Apache2 (symbolic Link zu /home/karte/drupal/web)

How to Upgrade Drupal:
```
cd drupal ; ./drupal-upgrade
```

## Karte
Die Karte ist selbst entwickelt und besteht aus zwei Repositories:
* https://github.com/plepe/timeline-map, geclont in /home/karte/htdocs/map
* https://github.com/plepe/abib-map, geclont in /home/karte/htdocs/map/a-bib-geschichte

In /home/karte/htdocs/map sind einige Dateien durch Symlinks auf Dateien in a-bib-geschichte ersetzt: config.yaml, local.css, local.html, modules.js.

How to upgrade:
```
cd htdocs/map/a-bib-geschichte ; git pull
cd htdocs/map ; git pull ; npm install
```

Um die Daten für die Karte zu extrahieren, wird die View “Node Info” (https://karte.a-bibliothek.org/admin/structure/views/view/node_info) verwendet. Da das Live-Exportieren aus der Webseite viel zu lange dauern und den Speicher überfordern würde, werden die Daten mit “drush vde_drush:views-data-export” durch das Script “update-info-json.php” (im abib-map Repo) exportiert. Dort werden die Daten gleich noch überarbeitet.

Die Daten werden von der Karte mit dem Script “info-json.php” angefordert. Dieses checkt, ob die aktuell gecachten Daten veraltet sind. Wenn ja, wird ein neu-export ausgelöst. Es werden aber noch die veralteten Daten ausgeliefert, da der Export einige Zeit dauert.
