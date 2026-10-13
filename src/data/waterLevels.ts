export type WaterStatus = "laag" | "normaal" | "hoog";

export type WaterLevel = {
  id: string;
  name: string;
  river: string;
  levelCm: number;
  changeCm: number;
  status: WaterStatus;
};

export const waterLevels: WaterLevel[] = [
  {
    id: "kaub",
    name: "Kaub",
    river: "Rijn",
    levelCm: 168,
    changeCm: -4,
    status: "laag",
  },
  {
    id: "ruhrort",
    name: "Ruhrort",
    river: "Rijn",
    levelCm: 286,
    changeCm: 3,
    status: "normaal",
  },
  {
    id: "maxau",
    name: "Maxau",
    river: "Rijn",
    levelCm: 512,
    changeCm: -11,
    status: "normaal",
  },
];
