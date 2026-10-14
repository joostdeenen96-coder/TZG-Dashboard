# Teunesen TV-dashboard

Volledig scherm voor de werkvloer en de kantine: waterstanden met bron-grafiek en verwachting, dieseltoeslag, een klein weerbericht in de balk en Nederlandse WijTeunesen-berichten met foto. Donker industrieel thema, Nederlandse teksten. De indeling is getekend op 2560×1440 en schaalt mee met het venster, ook op 3840×2160.

## Starten

```bash
npm install
npm run dev
```

`npm run dev` start de waterstanden-API op poort `43124` en Vite op `0.0.0.0:43123`. Open [http://127.0.0.1:43123](http://127.0.0.1:43123). Alleen de API: `npm run server`.

Productiebuild (frontend en backend):

```bash
npm run build
npm run preview
```

## Opbouw

- Bovenbalk met logo en live klok (Europe/Amsterdam)
- Vier kaarten: Kaub, Ruhrort, Maxau en dieseltoeslag
- Groot WijTeunesen-overzicht (`/sites/wt-nieuws`), laatste vijftien Nederlandse berichten van de hele site, met categorie, wissel elke 20 seconden, met foto als die er is

Het scherm is bedoeld om aan te blijven staan. Waterstanden, dieseltoeslag en nieuws verversen standaard elke 5 minuten (het interval uit `/admin`, anders 300 seconden). Valt het netwerk weg, dan blijft de laatste bekende tegel staan, komt er een nieuwe poging en toont de balk “Laatste bekende gegevens”. Een tegel die vastloopt blijft op die kaart; de rest van het scherm gaat door. Laden, een fout en een lege bron hebben elk een eigen staat. Logregels beginnen met `[teunesen-tv]` in de browserconsole en op de API.

De browser praat alleen met deze API. Waterstanden: `GET /api/waterlevels`. Kaub, Ruhrort en Maxau tekenen dezelfde donkere grafiek uit de meetreeks. Dieseltoeslag: `GET /api/dieselsurcharge` leest de SharePoint-lijst uit `config.json` (standaard `Dieseltoeslagen Asvervoer` op `sites/Facturatie`) één keer per weekvenster, vanaf woensdag 18:00 Amsterdam-tijd, en toont de laatste vier bekende weken in `weken`. Het verborgen beheer staat op `/admin` en schrijft die instellingen, de nieuwssite, de bibliotheek, de plaatsnaam, het verversinterval en het aantal nieuwsitems naar `config.json`. WijTeunesen-nieuws: `GET /api/news`, gefilterd op SharePoint-veld `Nieuws taal` = NL. Een foto komt binnen via `GET /api/news/:id/image`. Rechtsboven staat **Inloggen**. Daarmee kan een beheerder de Graph client-id en secret zetten. De diesel-lijst zelf staat in de code. Het nieuws komt alleen van `https://teunesen.sharepoint.com/sites/wt-nieuws`. Eerste aanmelding: `admin` / `teunesen`. Het wachtwoord en de sleutels blijven lokaal in `data/settings.json` en gaan niet de repository in. Zonder geldige Graph-gegevens valt de dieseltoeslag terug op de lokale cijfers en blijft het nieuws leeg, met voorbeeldkaarten. Details staan in `docs/architectuur.md`.

## Foto’s

De projectfoto’s komen van Wikimedia Commons en staan lokaal in `public/projects/`. Valt een afbeelding weg, dan blijft de dia leesbaar op een kleurverloop.

- Zandwinning — [Kongensbro gravel pit](https://commons.wikimedia.org/wiki/File:Kongensbro_gravel_pit_2014-09-17.jpg), Slaunger, CC BY-SA 3.0
- Grondwerk — [Excavator and earthworks by Bluestone](https://commons.wikimedia.org/wiki/File:Excavator_and_earthworks_by_Bluestone_-_geograph.org.uk_-_7512741.jpg), TCExplorer / Geograph, CC BY-SA 2.0
- Infra — [Vögele Super 1303-3i paver and asphalt roller](https://commons.wikimedia.org/wiki/File:V%C3%B6gele_Super_1303-3i_paver_and_asphalt_roller_(1).jpg), Peulle, CC BY-SA 4.0
- Binnenvaart — [Veronieke ship R01](https://commons.wikimedia.org/wiki/File:Veronieke_ship_R01.jpg), Marc Ryckaert, CC BY-SA 4.0
- Oeverwerk — [Bolotnaya Embankment earthworks](https://commons.wikimedia.org/wiki/File:2026-03-03_Construction_of_Bolotnaya_Embankment_footbridge,_earthworks_56.jpg), Retired electrician, CC0
