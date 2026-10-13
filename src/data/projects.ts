export type ProjectSlide = {
  id: string;
  title: string;
  location: string;
  image: string;
  gradient: string;
  objectPosition: string;
};

export const SLIDE_MS = 8000;

export const projects: ProjectSlide[] = [
  {
    id: "zandwinning",
    title: "Zandwinning Milsbeek",
    location: "Milsbeek",
    image: "/projects/zandwinning.jpg",
    gradient: "from-[#4a3418] via-[#1c2818] to-[#0c1410]",
    objectPosition: "center center",
  },
  {
    id: "grondwerk",
    title: "Grondwerk bedrijventerrein",
    location: "Heijen",
    image: "/projects/grondwerk.jpg",
    gradient: "from-[#24502c] via-[#14301c] to-[#0b140f]",
    objectPosition: "center 42%",
  },
  {
    id: "infra",
    title: "Onderhoud N271",
    location: "Gennep — Boxmeer",
    image: "/projects/infra.jpg",
    gradient: "from-[#1e4a30] via-[#143024] to-[#0a120e]",
    objectPosition: "center 70%",
  },
  {
    id: "binnenvaart",
    title: "Grindtransport Maas",
    location: "Loswal Gennep",
    image: "/projects/binnenvaart.jpg",
    gradient: "from-[#1a3c52] via-[#143028] to-[#0a120e]",
    objectPosition: "center 38%",
  },
  {
    id: "oever",
    title: "Oeverwerk aan de kade",
    location: "Gennep",
    image: "/projects/oeverwerk.jpg",
    gradient: "from-[#2a3c4a] via-[#1a2c22] to-[#0c1210]",
    objectPosition: "center 55%",
  },
];
