# SVGEditor

Ein moderner, modularer SVG-Editor mit Gruppenfunktion, Drag & Drop, Rechteck-Tool und Import/Export.

## Features

- **SVG- und Bild-Elemente hinzufügen:** SVG-Vorlagen oder eigene Bilder einfügen.
- **Rechteck-Tool:** SVG-Rechtecke als editierbare Elemente einfügen.
- **Drag & Drop, Resize, Rotate:** Elemente und Gruppen verschieben, skalieren und drehen (Interact.js).
- **Gruppieren:** Mehrere Elemente per Rechteckauswahl gruppieren, gemeinsam verschieben, klonen und löschen.
- **Mehrere Gruppen:** Beliebig viele Gruppen, übersichtlich im Overlay dargestellt, Umschalten zwischen Gruppen.
- **Element- und Gruppen-Overlay:** Kompaktes, verschiebbares Overlay mit allen Elementen und Gruppen.
- **Eigenschaften-Panel:** Live-Update für Slider (z.B. Transparenz), Farbauswahl, Größe, Position, Drehung.
- **Klonen & Löschen:** Einzelne Elemente oder ganze Gruppen klonen/löschen.
- **Import/Export:** Layouts (inkl. Hintergrundbild als DataURL) als JSON speichern und laden.
- **Hintergrundbild:** Bild-Upload als echtes Hintergrund-DIV, Deckkraft steuerbar.
- **SVG-Vorlagen-Auswahl:** Auswahl aus mehreren SVG-Templates.
- **Skalierung:** SVG- und Bild-Inhalte werden beim Resizing korrekt skaliert.
- **Kompaktes, responsives UI:** Moderne, verschiebbare Overlays für Menü und Elementeliste.
- **Grid:** Optionales Raster für präzises Platzieren.

## Installation

1. Projekt-Ordner (z.B. `SVGEditor`) in einen Webserver-Ordner (z.B. XAMPP `htdocs`) kopieren.
2. Im Browser aufrufen: `http://localhost/SVGEditor/index.html`.
3. Keine weitere Installation nötig – alle Module sind als ES-Module eingebunden.

## Schnellstart & Nutzung

1. **Elemente hinzufügen:**
   - SVG: Über das Menü "SVG hinzufügen" eine Vorlage wählen.
   - Bild: Über "Bild hinzufügen" ein Bild hochladen.
   - Rechteck: Über den "Rechteck"-Button ein SVG-Rechteck einfügen.
2. **Elemente auswählen:**
   - Klick auf ein Element im Editor oder in der Elementeliste.
3. **Eigenschaften ändern:**
   - Im Property-Panel Größe, Position, Drehung, Farbe, Transparenz etc. anpassen.
4. **Drag & Drop:**
   - Elemente direkt im Editor verschieben, skalieren, rotieren.
5. **Gruppieren:**
   - "Gruppieren"-Button aktivieren, mit der Maus ein Rechteck aufziehen, alle darin liegenden Elemente werden gruppiert.
   - Gruppen im Overlay sichtbar, per Klick auswählbar.
6. **Multi-Drag, Multi-Clone, Multi-Delete:**
   - Gruppen können gemeinsam verschoben, geklont oder gelöscht werden.
7. **Import/Export:**
   - Über die Buttons "Speichern" (JSON-Export) und "Importieren" (JSON-Import) Layouts sichern und laden.
   - Hintergrundbild wird als DataURL mitgespeichert.
8. **Hintergrundbild:**
   - Über "Bild als Hintergrund" ein Bild als Editor-Hintergrund setzen, Deckkraft per Slider steuern.
9. **SVG-Vorlagen:**
   - Über "SVG hinzufügen" verschiedene Vorlagen einfügen.
10. **Grid:**
    - Optionales Raster über die Checkbox aktivieren.

## Hinweise zu Import/Export

- Beim Export wird das gesamte Layout inkl. aller Elemente, Gruppen und Hintergrundbild als JSON gespeichert.
- Beim Import werden alle Elemente, Gruppen und das Hintergrundbild wiederhergestellt.
- Das Hintergrundbild wird als DataURL gespeichert (keine externe Bild-URL nötig).

## Hinweise zu Gruppen

- Gruppen werden im Overlay als eigene Einträge mit Unterelementen angezeigt.
- Es können beliebig viele Gruppen existieren, Umschalten per Klick.
- Aktionen wie Verschieben, Klonen, Löschen wirken auf die gesamte Gruppe.
- Gruppieren per Rechteckauswahl ("Gruppieren"-Button), Auflösen durch Auswahl einzelner Elemente.

## Rechteck-Tool

- Über den "Rechteck"-Button kann ein beliebiges SVG-Rechteck eingefügt werden.
- Rechtecke sind wie andere SVG-Elemente voll editierbar.

## Technische Hinweise

- **Modularer Aufbau:** Alle Logik in ES-Modulen (`main.js`, `editor-elements.js`, `element-interaction.js`, `file-handling.js`, `property-panel.js`, `background.js`, `grid.js`, `svg-templates.js`, `color-handling.js`, `variable-event-handler.js`).
- **UI:** Kompakte, verschiebbare und responsive Overlays für Menü, Elementeliste und Eigenschaften.
- **Drag/Drop/Resize/Rotate:** Realisiert mit Interact.js.
- **Datenhaltung:** Layouts und Hintergrundbild werden als JSON (inkl. DataURL) gespeichert.

## Lizenz

Dieses Projekt ist Open Source und kann frei verwendet und angepasst werden.
