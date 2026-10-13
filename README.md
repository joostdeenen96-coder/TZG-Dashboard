# Teunesen TV-dashboard

Volledig scherm voor de werkvloer en de kantine: waterstanden, dieseltoeslag, weer in Gennep, bedrijfsnieuws en projectfoto’s. Donker industrieel thema, Nederlandse teksten, bedoeld voor een scherm van 1920×1080.

## Starten

```bash
npm install
npm run dev
```

De ontwikkelserver luistert op `0.0.0.0:43123`. Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Productiebuild:

```bash
npm run build
npm run preview
```

## Opbouw

- Bovenbalk met woordmerk en live klok (Europe/Amsterdam)
- Vier kaarten: Kaub, Ruhrort, Maxau en dieseltoeslag
- Weerbericht Gennep en laatste bedrijfsnieuws
- Diavoorstelling van projecten, wisselt elke 8 seconden

De cijfers en berichten staan in `src/services/dashboardService.ts` en zijn voorbeelddata.

## Foto’s

De projectfoto’s komen van Wikimedia Commons en staan lokaal in `public/projects/`. Valt een afbeelding weg, dan blijft de dia leesbaar op een kleurverloop.

- Zandwinning — [Kongensbro gravel pit](https://commons.wikimedia.org/wiki/File:Kongensbro_gravel_pit_2014-09-17.jpg), Slaunger, CC BY-SA 3.0
- Grondwerk — [Excavator and earthworks by Bluestone](https://commons.wikimedia.org/wiki/File:Excavator_and_earthworks_by_Bluestone_-_geograph.org.uk_-_7512741.jpg), TCExplorer / Geograph, CC BY-SA 2.0
- Infra — [Vögele Super 1303-3i paver and asphalt roller](https://commons.wikimedia.org/wiki/File:V%C3%B6gele_Super_1303-3i_paver_and_asphalt_roller_(1).jpg), Peulle, CC BY-SA 4.0
- Binnenvaart — [Veronieke ship R01](https://commons.wikimedia.org/wiki/File:Veronieke_ship_R01.jpg), Marc Ryckaert, CC BY-SA 4.0
- Oeverwerk — [Bolotnaya Embankment earthworks](https://commons.wikimedia.org/wiki/File:2026-03-03_Construction_of_Bolotnaya_Embankment_footbridge,_earthworks_56.jpg), Retired electrician, CC0
