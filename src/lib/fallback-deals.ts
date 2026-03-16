import type { DealWithRelations } from "@/types";

const restaurants = {
  joes: {
    id: "fallback-restaurant-joes",
    name: "Joe's Burger Shack",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    latitude: null,
    longitude: null,
    phone: "(512) 555-0101",
    website: "https://example.com/joes",
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  },
  taco: {
    id: "fallback-restaurant-taco",
    name: "Taco Fiesta",
    address: "456 Oak Ave",
    city: "Austin",
    state: "TX",
    zip: "78702",
    latitude: null,
    longitude: null,
    phone: "(512) 555-0102",
    website: null,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  },
  dragon: {
    id: "fallback-restaurant-dragon",
    name: "Dragon Palace",
    address: "654 Maple Blvd",
    city: "Austin",
    state: "TX",
    zip: "78705",
    latitude: null,
    longitude: null,
    phone: "(512) 555-0105",
    website: null,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  },
  pub: {
    id: "fallback-restaurant-pub",
    name: "The Pub & Grill",
    address: "987 Cedar Lane",
    city: "Austin",
    state: "TX",
    zip: "78706",
    latitude: null,
    longitude: null,
    phone: "(512) 555-0106",
    website: null,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  },
  pizza: {
    id: "fallback-restaurant-pizza",
    name: "Family Pizza Palace",
    address: "135 Birch St",
    city: "Austin",
    state: "TX",
    zip: "78707",
    latitude: null,
    longitude: null,
    phone: "(512) 555-0107",
    website: null,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    updatedAt: new Date("2026-01-01T12:00:00.000Z"),
  },
} as const;

type RestaurantKey = keyof typeof restaurants;

type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type DealInput = {
  id: string;
  restaurantKey: RestaurantKey;
  title: string;
  description: string;
  priceInfo: string;
  dineIn?: boolean;
  toGo?: boolean;
  kidFriendly?: boolean;
  alcoholAvailable?: boolean;
  kidsEatFree?: boolean;
  vegetarianFriendly?: boolean;
  familyFriendly?: boolean;
  lateNight?: boolean;
  cuisineType: string;
  category: string;
  verified?: boolean;
  createdAt: string;
  schedules: ScheduleInput[];
};

function createDeal(input: DealInput): DealWithRelations {
  const restaurant = restaurants[input.restaurantKey];
  const createdAt = new Date(input.createdAt);

  return {
    id: input.id,
    restaurantId: restaurant.id,
    title: input.title,
    description: input.description,
    priceInfo: input.priceInfo,
    dineIn: input.dineIn ?? true,
    toGo: input.toGo ?? false,
    kidFriendly: input.kidFriendly ?? false,
    alcoholAvailable: input.alcoholAvailable ?? false,
    kidsEatFree: input.kidsEatFree ?? false,
    vegetarianFriendly: input.vegetarianFriendly ?? false,
    familyFriendly: input.familyFriendly ?? false,
    lateNight: input.lateNight ?? false,
    cuisineType: input.cuisineType,
    category: input.category,
    status: "APPROVED",
    verified: input.verified ?? false,
    verifiedAt: input.verified ? createdAt : null,
    lastConfirmedAt: createdAt,
    sourceUrl: null,
    notes: null,
    submittedById: null,
    createdAt,
    updatedAt: createdAt,
    restaurant,
    schedules: input.schedules.map((schedule, index) => ({
      id: `${input.id}-schedule-${index + 1}`,
      dealId: input.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })),
    votes: [],
    favorites: [],
    submittedBy: null,
  };
}

export const fallbackDeals: DealWithRelations[] = [
  createDeal({
    id: "fallback-pizza-monday",
    restaurantKey: "pizza",
    title: "Pizza Monday Deal",
    description: "Large 2-topping pizza for just $9.99 every Monday. Dine in or carry out.",
    priceInfo: "$9.99 large pizza",
    toGo: true,
    kidFriendly: true,
    cuisineType: "Pizza",
    category: "Daily Special",
    createdAt: "2026-01-15T12:00:00.000Z",
    schedules: [{ dayOfWeek: 1, startTime: "11:00", endTime: "22:00" }],
  }),
  createDeal({
    id: "fallback-kids-free-tuesday",
    restaurantKey: "pizza",
    title: "Kids Eat Free Tuesday",
    description: "Every Tuesday, kids under 12 eat free with purchase of adult entree. Includes pizza or pasta.",
    priceInfo: "Free kids meal",
    kidFriendly: true,
    kidsEatFree: true,
    familyFriendly: true,
    cuisineType: "Pizza",
    category: "Kids Meal",
    verified: true,
    createdAt: "2026-01-14T12:00:00.000Z",
    schedules: [{ dayOfWeek: 2, startTime: "17:00", endTime: "21:00" }],
  }),
  createDeal({
    id: "fallback-weekend-wing-feast",
    restaurantKey: "pub",
    title: "Weekend Wing Feast",
    description: "All-you-can-eat wings on weekends! Choose from 8 sauces. Served with celery, carrots, and blue cheese.",
    priceInfo: "$19.99/person",
    alcoholAvailable: true,
    cuisineType: "American",
    category: "Weekend Special",
    verified: true,
    createdAt: "2026-01-13T12:00:00.000Z",
    schedules: [
      { dayOfWeek: 0, startTime: "12:00", endTime: "20:00" },
      { dayOfWeek: 6, startTime: "12:00", endTime: "20:00" },
    ],
  }),
  createDeal({
    id: "fallback-late-night-happy-hour",
    restaurantKey: "pub",
    title: "Late Night Happy Hour",
    description: "Half price apps and $3 drafts every night from 10pm to midnight. Burgers, nachos, and more!",
    priceInfo: "50% off apps + $3 beers",
    alcoholAvailable: true,
    lateNight: true,
    cuisineType: "American",
    category: "Late Night",
    verified: true,
    createdAt: "2026-01-12T12:00:00.000Z",
    schedules: [{ dayOfWeek: 4, startTime: "22:00", endTime: "00:00" }],
  }),
  createDeal({
    id: "fallback-monday-lunch-combo",
    restaurantKey: "dragon",
    title: "Monday Lunch Combo",
    description: "Choose any 2 dishes from the lunch menu with fried rice or lo mein and a spring roll.",
    priceInfo: "$12.99 combo",
    toGo: true,
    cuisineType: "Chinese",
    category: "Lunch Special",
    createdAt: "2026-01-11T12:00:00.000Z",
    schedules: [{ dayOfWeek: 1, startTime: "11:30", endTime: "15:00" }],
  }),
  createDeal({
    id: "fallback-dim-sum-saturday",
    restaurantKey: "dragon",
    title: "Dim Sum Saturday Morning",
    description: "Traditional dim sum served fresh from the cart every Saturday morning. Come early for best selection!",
    priceInfo: "$3-8/plate",
    kidFriendly: true,
    familyFriendly: true,
    cuisineType: "Chinese",
    category: "Weekend Special",
    verified: true,
    createdAt: "2026-01-10T12:00:00.000Z",
    schedules: [{ dayOfWeek: 6, startTime: "09:00", endTime: "13:00" }],
  }),
  createDeal({
    id: "fallback-happy-hour-wings",
    restaurantKey: "joes",
    title: "Happy Hour Wings",
    description: "50 cents wings during happy hour. Choose from 12 flavors. Minimum order 10 wings.",
    priceInfo: "$0.50/wing",
    alcoholAvailable: true,
    cuisineType: "American",
    category: "Happy Hour",
    verified: true,
    createdAt: "2026-01-09T12:00:00.000Z",
    schedules: [{ dayOfWeek: 4, startTime: "16:00", endTime: "18:00" }],
  }),
  createDeal({
    id: "fallback-monday-burger-night",
    restaurantKey: "joes",
    title: "Monday Burger Night",
    description: "All burgers half off every Monday, including classic, BBQ, and mushroom Swiss burgers.",
    priceInfo: "50% off all burgers",
    toGo: true,
    kidFriendly: true,
    familyFriendly: true,
    cuisineType: "Burgers",
    category: "Daily Special",
    verified: true,
    createdAt: "2026-01-08T12:00:00.000Z",
    schedules: [{ dayOfWeek: 1, startTime: "11:00", endTime: "21:00" }],
  }),
  createDeal({
    id: "fallback-taco-tuesday",
    restaurantKey: "taco",
    title: "Taco Tuesday Specials",
    description: "Street tacos for just $2 each every Tuesday with al pastor, carnitas, or veggie options.",
    priceInfo: "$2/taco",
    toGo: true,
    kidFriendly: true,
    vegetarianFriendly: true,
    familyFriendly: true,
    cuisineType: "Mexican",
    category: "Daily Special",
    verified: true,
    createdAt: "2026-01-07T12:00:00.000Z",
    schedules: [{ dayOfWeek: 2, startTime: "11:00", endTime: "22:00" }],
  }),
];
