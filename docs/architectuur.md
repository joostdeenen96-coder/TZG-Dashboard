# Architectuur planningscherm

Het scherm op 1920×1080 blijft hetzelfde: klok, vier KPI-kaarten, weer, nieuws en de projectcarrousel. De browser praat alleen met onze API. Er gaat geen request naar ELWIS, PEGELONLINE, HVZ of een andere externe site, en er is geen SharePoint-aanroep.

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
- `GET /stations/{uuid}/W/measurements.json?start=P2D` — ruwe reeks van de laatste twee dagen

Het verschil is de actuele centimeter minus de meting die het dichtst bij 24 uur eerder ligt. Ligt die meting meer dan 90 minuten van dat tijdstip af, dan faalt het station. `stateMnwMhw` wordt `low` → `laag`, `normal` → `normaal`, `high` → `hoog`. Andere toestanden (`unknown`, `commented`, `out-dated`) worden een fout, geen verzonnen status.

### Maxau — HVZ Baden-Württemberg

HVZ publiceert geen REST- of JSON-API voor de actuele waterstand. Gecontroleerd: `pegel.html`, losse paden als `php/getPegel.php`, `data/pegel.json` en `fsk/files/data/xml/hvz.xml` geven geen dataset. De HTML-pagina wordt niet gescrapet.

De publieke dataset die de HVZ-site zelf ververst, bestaat uit twee gestructureerde bestanden:

- `https://www.hvz.baden-wuerttemberg.de/js/hvz_peg_stmn.js` — actuele waterstand van pegel `09016` Maxau, eenheid `cm`, plus MNW (index 43) en de laagste hoogwaterstand (index 30)
- `https://www.hvz.baden-wuerttemberg.de/js/dat-peg-tmv.js` — dagwaarde (Tagesmittel) van de vorige kalenderdag, sleutel `9016`

`changeCm` is de actuele centimeter minus die dagwaarde. De dagwaarde moet op de kalenderdag vóór de meting staan. Status volgt dezelfde grenzen als PEGELONLINE: op of onder MNW is `laag`, op of boven de laagste hoogwaterstand is `hoog`, daartussen `normaal`. Ontbreekt een van die getallen, of staat de waterstand niet in centimeter, dan faalt Maxau.

## Dieseltoeslag

`DieselSurchargeProvider` heeft `getCurrentData()`. De registratie staat in `server/services/dieselSurchargeService.ts`. Standaard is SharePoint actief:

```ts
const activeDieselSource: DieselSource = "sharepoint";
```

`SharePointDieselProvider` leest via Microsoft Graph de site en de lijst uit de beheerinstellingen. Standaard is dat `https://teunesen.sharepoint.com/sites/Facturatie` en `Dieseltoeslagen Asvervoer`. Het record met `Actief = true` is de actuele toeslag. Bij meerdere actieve records wint de laatste peildatum.

Rechtsboven opent **Inloggen** het beheer. Eerste aanmelding is `admin` / `teunesen`. De tenant, client-id, client secret, site en lijst worden lokaal in `data/settings.json` gezet en niet in de repository. Omgevingsvariabelen `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID` en `GRAPH_CLIENT_SECRET` vullen lege velden nog aan. **Verbinding testen** controleert of Graph de lijst vindt.

Faalt Graph (ontbrekende variabelen, token, site, lijst of geen actief record), dan logt de service de fout en valt terug op `MockDieselProvider`. Die fallback blijft de laatste lokale cijfers: peildatum 2026-10-13, toeslag 12,4 procent, actief. Er is geen dieselprijs in die fallback (`dieselPrijs` is 0).

`GET /api/dieselsurcharge` geeft:

```json
{
  "peildatum": "2026-10-13",
  "dieselPrijs": 0,
  "toeslagPercentage": 12.4,
  "actief": true
}
```

`src/services/dieselService.ts` leest alleen dat pad. Componenten en `dashboardService` importeren geen dieselprovider.

## Wat live is en wat nog mock

| Gegeven | Herkomst | Status |
| --- | --- | --- |
| Kaub, Ruhrort | PEGELONLINE via onze API | live |
| Maxau | HVZ-dataset via onze API | live |
| Dieseltoeslag | SharePoint via Microsoft Graph, mock alleen bij een Graph-fout | live zodra de Graph-variabelen gezet zijn |
| Weer, nieuws, projectfoto’s | `src/services/dashboardService.ts` | mock, geen externe site |
