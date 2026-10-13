# Architectuur planningscherm

Het scherm is opgezet voor 2560×1440 en schaalt naar het venster. De browser praat alleen met onze API. Er gaat geen request naar ELWIS, PEGELONLINE, HVZ of SharePoint.

## Waterstanden

`GET /api/waterlevels` levert altijd de drie stations. Faalt één bron, dan krijgt dat station een `error` en blijven de andere stations gevuld. Er worden geen stille testdata ingevuld.

```json
{
  "kaub": {
    "id": "kaub",
    "name": "Kaub",
    "river": "Rijn",
    "levelCm": 19,
    "changeCm": -2,
    "trend": "dalend",
    "status": "laag",
    "updatedAt": "2026-10-13T16:30:00+02:00",
    "source": "PEGELONLINE",
    "error": null
  },
  "ruhrort": {},
  "maxau": {}
}
```

`ruhrort` en `maxau` hebben dezelfde velden. Een lege `{}` is hier alleen een verkorting in dit document.

| Veld | Betekenis |
| --- | --- |
| `levelCm` | Actuele waterstand in centimeter, afgerond |
| `status` | `laag`, `normaal` of `hoog` |
| `trend` | `stijgend`, `dalend` of `gelijk`, afgeleid van `changeCm` |
| `changeCm` | Verschil met de waterstand van ongeveer een dag eerder, in cm |
| `updatedAt` | Tijdstip van de actuele meting, ISO 8601 met offset |
| `source` | Naam van de bron |
| `series` | Uitgedunde meetreeks van de laatste vier dagen, `{ timestamp, levelCm }` |
| `forecast` | PEGELONLINE-tijdreeks `WV`: `kind` is `verwacht` of `inschatting` |
| `forecastError` | `null` als de verwachting geladen is, anders een tekst. De actuele stand blijft staan |
| `graphPath` | `null`. De kaarten tekenen zelf de donkere grafiek uit `series` en `forecast` |
| `error` | `null` bij een geslaagde meting, anders een tekst en lege getallen |

`useWaterLevels()` in `src/services/waterLevelService.ts` leest alleen `/api/waterlevels` en zet het object om naar de drie kaarten. Een station met `error` toont de fout op die kaart.

### Providers

`WaterLevelProvider` heeft `getCurrentData()`. De route en de frontend kennen de bron niet. Welke klasse een station vult, staat op één plek: `server/services/waterLevelService.ts`.

| Station | Provider | Bron | Live |
| --- | --- | --- | --- |
| Kaub | `KaubProvider` | PEGELONLINE, kortnaam `KAUB` | ja |
| Ruhrort | `RuhrortProvider` | PEGELONLINE, kortnaam `DUISBURG-RUHRORT` | ja |
| Maxau | `MaxauProvider` | HVZ Baden-Württemberg, pegel `09016` | ja |

### Kaub en Ruhrort — ELWIS / PEGELONLINE

ELWIS toont deze peilen, maar heeft geen eigen meet-API. De officiële REST-API is PEGELONLINE versie 2, zonder sleutel:

`https://www.pegelonline.wsv.de/webservices/rest-api/v2/`

Bevestigde stations op water `RHEIN`, tijdreeks `W` (Wasserstand Rohdaten), eenheid `cm`:

| Kortnaam | UUID | Kaart |
| --- | --- | --- |
| `KAUB` | `1d26e504-7f9e-480a-b52c-5932be6549ab` | Kaub |
| `DUISBURG-RUHRORT` | `c0f51e35-d0e8-4318-afaf-c5fcbc29f4c1` | Ruhrort |

Per station twee JSON-aanroepen, geen HTML:

- `GET /stations/{uuid}/W.json?includeCurrentMeasurement=true` — actuele waarde, tijdstip en `stateMnwMhw`
- `GET /stations/{uuid}/W/measurements.json?start=P4D` — ruwe reeks van de laatste vier dagen, uitgedund tot de grafiek
- `GET /stations/{uuid}/WV/measurements.json` — waterstandverwachting. `forecast` wordt `verwacht`, `estimate` wordt `inschatting`. Faalt deze reeks, dan blijft de actuele stand staan en vult `forecastError`

Het verschil is de actuele centimeter minus de meting die het dichtst bij 24 uur eerder ligt. Ligt die meting meer dan 90 minuten van dat tijdstip af, dan faalt het station. `stateMnwMhw` wordt `low` → `laag`, `normal` → `normaal`, `high` → `hoog`. Andere toestanden (`unknown`, `commented`, `out-dated`) worden een fout, geen verzonnen status.

### Maxau — HVZ Baden-Württemberg

HVZ publiceert geen REST- of JSON-API voor de actuele waterstand. Gecontroleerd: `pegel.html`, losse paden als `php/getPegel.php`, `data/pegel.json` en `fsk/files/data/xml/hvz.xml` geven geen dataset. De HTML-pagina wordt niet gescrapet.

De publieke dataset die de HVZ-site zelf ververst, bestaat uit twee gestructureerde bestanden:

- `https://www.hvz.baden-wuerttemberg.de/js/hvz_peg_stmn.js` — actuele waterstand van pegel `09016` Maxau, eenheid `cm`, plus MNW (index 43) en de laagste hoogwaterstand (index 30)
- `https://www.hvz.baden-wuerttemberg.de/js/dat-peg-tmv.js` — dagwaarde (Tagesmittel) van de vorige kalenderdag, sleutel `9016`

`changeCm` is de actuele centimeter minus die dagwaarde. De dagwaarde moet op de kalenderdag vóór de meting staan. Status volgt dezelfde grenzen als PEGELONLINE: op of onder MNW is `laag`, op of boven de laagste hoogwaterstand is `hoog`, daartussen `normaal`. Ontbreekt een van die getallen, of staat de waterstand niet in centimeter, dan faalt Maxau.

De kaart tekent dezelfde donkere grafiek als Kaub en Ruhrort. De lijn komt uit de PEGELONLINE-tijdreeks `W` van station `b6c6d5c8-e2d5-4469-8dd8-fa972ef7eaea`, de laatste vier dagen, uitgedund tot 48 punten. De actuele centimeter, status en daggemiddelde blijven van HVZ. PEGELONLINE heeft voor Maxau geen tijdreeks `WV`, dus de kaart toont geen verwachtingscijfers en geen fouttekst daarover. Faalt de reeks, dan blijft de HVZ-stand staan en is `series` leeg.

## Dieseltoeslag

`DieselSurchargeProvider` heeft `getCurrentData()`. De registratie staat in `server/services/dieselSurchargeService.ts`. Standaard is SharePoint actief:

```ts
const activeDieselSource: DieselSource = "sharepoint";
```

`SharePointDieselProvider` leest de lijst uit `config.json`: standaard `Dieseltoeslagen Asvervoer` op `https://teunesen.sharepoint.com/sites/Facturatie`. Die waarden wijzigt het verborgen beheer op `/admin`. De tenant blijft `ca0e0118-1eb1-4661-bd22-8ca64479f1d3`. Het record met `Actief = true` is de actuele toeslag. Bij meerdere actieve records wint de laatste peildatum. `weken` bevat hoogstens de laatste vijf ISO-weken uit de lijst, chronologisch, één record per week (de laatste peildatum in die week). Ontbreken er weken, dan blijven die weg. Er worden geen percentages bijverzonnen.

De dieselkaart gebruikt die vaste lijst. Client-id en client secret komen uit `GRAPH_CLIENT_ID` en `GRAPH_CLIENT_SECRET`, of uit `data/settings.json` als die er al staan. Zonder die twee waarden kan Graph de lijst niet lezen. De tenant voor deze lijst is `ca0e0118-1eb1-4661-bd22-8ca64479f1d3`.

Faalt Graph (ontbrekende variabelen, token, site, lijst of geen actief record), dan logt de service de fout en valt terug op `MockDieselProvider`. Die fallback blijft de laatste lokale cijfers: peildatum 2026-10-13, toeslag 12,4 procent, actief. Er is geen dieselprijs in die fallback (`dieselPrijs` is 0). `weken` bevat dan alleen die ene bekende week.

`GET /api/dieselsurcharge` geeft:

```json
{
  "peildatum": "2026-10-13",
  "dieselPrijs": 0,
  "toeslagPercentage": 12.4,
  "actief": true,
  "weken": [
    {
      "peildatum": "2026-10-13",
      "dieselPrijs": 0,
      "toeslagPercentage": 12.4,
      "actief": true
    }
  ]
}
```

`src/services/dieselService.ts` leest alleen dat pad. Componenten en `dashboardService` importeren geen dieselprovider.

## Wat live is en wat nog mock

| Gegeven | Herkomst | Status |
| --- | --- | --- |
| Kaub, Ruhrort | PEGELONLINE via onze API | live |
| Maxau | HVZ-dataset via onze API | live |
| Dieseltoeslag | SharePoint via Microsoft Graph, mock alleen bij een Graph-fout | live zodra de Graph-variabelen gezet zijn |
| Weer, projectfoto’s | `src/services/dashboardService.ts` | mock, geen externe site |
| WijTeunesen-nieuws | `GET /api/news`, site `https://teunesen.sharepoint.com/sites/wt-nieuws` | alleen `promotionKind = newsPost` op die site. Zonder Graph-gegevens blijft de lijst leeg en toont het scherm voorbeeldkaarten |
