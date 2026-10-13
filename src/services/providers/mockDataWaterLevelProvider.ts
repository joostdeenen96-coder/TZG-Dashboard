import type { WaterLevelProvider, WaterLevelReading } from "../../types";

const mockLevels: WaterLevelReading[] = [
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

export class MockDataWaterLevelProvider implements WaterLevelProvider {
  readonly kind = "mock" as const;

  getLevels() {
    return mockLevels;
  }

  loadLevels() {
    return Promise.resolve(mockLevels);
  }
}
