export const NEWS2_THRESHOLDS = {
  RESPIRATORY_RATE: {
    THREE_LOW: 8,
    ONE_LOW: 11,
    ZERO_HIGH: 20,
    TWO_HIGH: 24,
  },
  SPO2_SCALE_1: {
    THREE_LOW: 91,
    TWO_LOW: 93,
    ONE_LOW: 95,
  },
  SPO2_SCALE_2: {
    THREE_LOW: 83,
    TWO_LOW: 85,
    ONE_LOW: 87,
    ZERO_HIGH: 92,
    ONE_HIGH: 94,
    TWO_HIGH: 96,
  },
  SYSTOLIC_BP: {
    THREE_LOW: 90,
    TWO_LOW: 100,
    ONE_LOW: 110,
    ZERO_HIGH: 219,
  },
  HEART_RATE: {
    THREE_LOW: 40,
    ONE_LOW: 50,
    ZERO_HIGH: 90,
    ONE_HIGH: 110,
    TWO_HIGH: 130,
  },
  TEMPERATURE: {
    THREE_LOW: 35.0,
    ONE_LOW: 36.0,
    ZERO_HIGH: 38.0,
    ONE_HIGH: 39.0,
  },
  HIGH_RISK: 7,
  MEDIUM_RISK: 5,
} as const
