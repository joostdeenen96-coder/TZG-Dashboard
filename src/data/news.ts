export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "grindafvaart",
    title: "Extra grindafvaart naar Rotterdam",
    summary: "Twee duwbakken vertrekken vanavond vanaf de loswal in Gennep.",
    publishedAt: "2026-10-13T14:05:00+02:00",
  },
  {
    id: "n271",
    title: "Nachtwerk asfalt op de N271",
    summary: "De ploeg rijdt woensdag tot en met vrijdag tussen 20:00 en 05:00.",
    publishedAt: "2026-10-13T08:40:00+02:00",
  },
  {
    id: "dijk",
    title: "Dijkversterking Maas ligt voor",
    summary: "Het grondwerk bij het Genneperhuis loopt twee dagen voor op schema.",
    publishedAt: "2026-10-12T16:15:00+02:00",
  },
  {
    id: "milsbeek",
    title: "Nieuwe put zandwinning Milsbeek",
    summary: "De winvergunning is rond; de put gaat volgende week open.",
    publishedAt: "2026-10-11T11:00:00+02:00",
  },
];
