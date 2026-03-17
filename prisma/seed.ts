import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { getConfiguredAdminEmails, isProductionSeedEnvironment } from "../src/lib/admin-config";
import { getDatabaseUrl, getLibSqlAuthToken } from "../src/lib/database-config";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql(
    getLibSqlAuthToken()
      ? {
          url: getDatabaseUrl(),
          authToken: getLibSqlAuthToken(),
        }
      : {
          url: getDatabaseUrl(),
        }
  ),
});

async function main() {
  console.log("Seeding database...");
  const isProductionSeed = isProductionSeedEnvironment();
  const configuredAdminEmails = getConfiguredAdminEmails();
  let adminUserId: string | null = null;
  let defaultUserId: string | null = null;

  if (isProductionSeed) {
    const [promotedAdmins, existingConfiguredAdmin, genericAdminResult, genericUserResult] =
      await Promise.all([
        configuredAdminEmails.length > 0
          ? prisma.user.updateMany({
              where: { email: { in: configuredAdminEmails } },
              data: { role: "ADMIN" },
            })
          : Promise.resolve({ count: 0 }),
        configuredAdminEmails.length > 0
          ? prisma.user.findFirst({
              where: { email: { in: configuredAdminEmails } },
              select: { id: true },
            })
          : Promise.resolve(null),
        prisma.user.updateMany({
          where: { email: "admin@dailyfooddeals.com" },
          data: {
            role: "USER",
            password: null,
          },
        }),
        prisma.user.updateMany({
          where: { email: "user@example.com" },
          data: {
            password: null,
          },
        }),
      ]);

    adminUserId = existingConfiguredAdmin?.id ?? null;

    if (configuredAdminEmails.length > 0 && promotedAdmins.count === 0) {
      console.warn("No existing users matched ADMIN_EMAILS, so no production admin was promoted.");
    }
    if (genericAdminResult.count > 0) {
      console.log("Disabled the generic seeded admin account for production.");
    }
    if (genericUserResult.count > 0) {
      console.log("Disabled the generic seeded user password for production.");
    }
  } else {
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@dailyfooddeals.com" },
      update: {},
      create: {
        email: "admin@dailyfooddeals.com",
        name: "Admin User",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    const userPassword = await bcrypt.hash("user1234", 12);
    const user = await prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        email: "user@example.com",
        name: "Test User",
        password: userPassword,
        role: "USER",
      },
    });

    adminUserId = admin.id;
    defaultUserId = user.id;
  }

  const whataburgerBrand = !isProductionSeed
    ? await prisma.brand.upsert({
        where: { slug: "whataburger" },
        update: {},
        create: {
          name: "Whataburger",
          slug: "whataburger",
          website: "https://whataburger.com",
          description: "Brand-wide sample offers used to demonstrate multi-location deal support.",
        },
      })
    : null;

  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: "Joe's Burger Shack",
        address: "123 Main St",
        city: "Austin",
        state: "TX",
        zip: "78701",
        latitude: 30.2672,
        longitude: -97.7431,
        phone: "(512) 555-0101",
        website: "https://example.com/joes",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Taco Fiesta",
        address: "456 Oak Ave",
        city: "Austin",
        state: "TX",
        zip: "78702",
        latitude: 30.2648,
        longitude: -97.7342,
        phone: "(512) 555-0102",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Sakura Japanese Kitchen",
        address: "789 Elm St",
        city: "Austin",
        state: "TX",
        zip: "78703",
        latitude: 30.2711,
        longitude: -97.7605,
        phone: "(512) 555-0103",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "The Italian Garden",
        address: "321 Pine Rd",
        city: "Austin",
        state: "TX",
        zip: "78704",
        latitude: 30.2475,
        longitude: -97.7654,
        phone: "(512) 555-0104",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Dragon Palace",
        address: "654 Maple Blvd",
        city: "Austin",
        state: "TX",
        zip: "78705",
        latitude: 30.2748,
        longitude: -97.7326,
        phone: "(512) 555-0105",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "The Pub & Grill",
        address: "987 Cedar Lane",
        city: "Austin",
        state: "TX",
        zip: "78706",
        latitude: 30.2583,
        longitude: -97.7514,
        phone: "(512) 555-0106",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Family Pizza Palace",
        address: "135 Birch St",
        city: "Austin",
        state: "TX",
        zip: "78707",
        latitude: 30.2503,
        longitude: -97.7487,
        phone: "(512) 555-0107",
      },
    }),
  ]);

  const [joes, tacoFiesta, sakura, italianGarden, dragonPalace, pubGrill, pizzaPalace] = restaurants;
  let whataburgerDowntown: { id: string } | null = null;
  let whataburgerSouth: { id: string } | null = null;
  let whataburgerNorth: { id: string } | null = null;

  if (whataburgerBrand) {
    const whataburgerRestaurants = await Promise.all([
      prisma.restaurant.create({
        data: {
          brandId: whataburgerBrand.id,
          name: "Whataburger - Downtown",
          address: "201 Congress Ave",
          city: "Austin",
          state: "TX",
          zip: "78701",
          latitude: 30.2641,
          longitude: -97.7426,
          phone: "(512) 555-0201",
          website: "https://whataburger.com",
          isSampleData: true,
        },
      }),
      prisma.restaurant.create({
        data: {
          brandId: whataburgerBrand.id,
          name: "Whataburger - South Lamar",
          address: "2400 S Lamar Blvd",
          city: "Austin",
          state: "TX",
          zip: "78704",
          latitude: 30.2437,
          longitude: -97.7794,
          phone: "(512) 555-0202",
          website: "https://whataburger.com",
          isSampleData: true,
        },
      }),
      prisma.restaurant.create({
        data: {
          brandId: whataburgerBrand.id,
          name: "Whataburger - North Austin",
          address: "10400 Research Blvd",
          city: "Austin",
          state: "TX",
          zip: "78759",
          latitude: 30.3909,
          longitude: -97.7467,
          phone: "(512) 555-0203",
          website: "https://whataburger.com",
          isSampleData: true,
        },
      }),
    ]);

    [whataburgerDowntown, whataburgerSouth, whataburgerNorth] = whataburgerRestaurants;
  }

  const deals = [
    ...(whataburgerBrand && whataburgerDowntown
      ? [
          {
            restaurantId: whataburgerDowntown.id,
            brandId: whataburgerBrand.id,
            title: "Whataburger App Free Fries",
            description: "Use the app offer for a free medium fry with any combo meal at participating Whataburger locations.",
            priceInfo: "Free medium fries with combo",
            dineIn: true,
            toGo: true,
            kidFriendly: true,
            familyFriendly: true,
            cuisineType: "Burgers",
            category: "Daily Special",
            scope: "ALL_LOCATIONS",
            status: "APPROVED" as const,
            verified: true,
            isSampleData: true,
            verifiedAt: new Date(),
            submittedById: adminUserId,
            schedules: {
              create: [
                { dayOfWeek: 1, startTime: "10:00", endTime: "22:00" },
                { dayOfWeek: 2, startTime: "10:00", endTime: "22:00" },
                { dayOfWeek: 3, startTime: "10:00", endTime: "22:00" },
                { dayOfWeek: 4, startTime: "10:00", endTime: "22:00" },
                { dayOfWeek: 5, startTime: "10:00", endTime: "22:00" },
              ],
            },
          },
        ]
      : []),
    {
      restaurantId: joes.id,
      title: "Monday Burger Night",
      description: "All burgers half off every Monday! Choose from our classic, BBQ, or mushroom Swiss burgers. Includes fries.",
      priceInfo: "50% off all burgers",
      dineIn: true,
      toGo: true,
      kidFriendly: true,
      familyFriendly: true,
      cuisineType: "Burgers",
      category: "Daily Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 1, startTime: "11:00", endTime: "21:00" }] },
    },
    {
      restaurantId: joes.id,
      title: "Happy Hour Wings",
      description: "50 cents wings during happy hour. Choose from 12 flavors. Minimum order 10 wings.",
      priceInfo: "$0.50/wing",
      dineIn: true,
      toGo: false,
      kidFriendly: false,
      alcoholAvailable: true,
      cuisineType: "American",
      category: "Happy Hour",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: "16:00", endTime: "18:00" },
          { dayOfWeek: 2, startTime: "16:00", endTime: "18:00" },
          { dayOfWeek: 3, startTime: "16:00", endTime: "18:00" },
          { dayOfWeek: 4, startTime: "16:00", endTime: "18:00" },
          { dayOfWeek: 5, startTime: "16:00", endTime: "18:00" },
        ],
      },
    },
    {
      restaurantId: tacoFiesta.id,
      title: "Taco Tuesday Specials",
      description: "Street tacos for just $2 each every Tuesday! Includes al pastor, carnitas, or veggie options.",
      priceInfo: "$2/taco",
      dineIn: true,
      toGo: true,
      kidFriendly: true,
      vegetarianFriendly: true,
      familyFriendly: true,
      cuisineType: "Mexican",
      category: "Daily Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 2, startTime: "11:00", endTime: "22:00" }] },
    },
    {
      restaurantId: tacoFiesta.id,
      title: "Kids Eat Free Friday",
      description: "One free kids meal with each adult entree purchase every Friday. Perfect for family nights out!",
      priceInfo: "Free kids meal",
      dineIn: true,
      toGo: false,
      kidFriendly: true,
      kidsEatFree: true,
      familyFriendly: true,
      cuisineType: "Mexican",
      category: "Kids Meal",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: adminUserId,
      schedules: { create: [{ dayOfWeek: 5, startTime: "17:00", endTime: "21:00" }] },
    },
    {
      restaurantId: sakura.id,
      title: "Sushi Wednesday Special",
      description: "All rolls 30% off on Wednesdays. Includes specialty rolls and sake specials.",
      priceInfo: "30% off all rolls",
      dineIn: true,
      toGo: false,
      alcoholAvailable: true,
      cuisineType: "Japanese",
      category: "Daily Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 3, startTime: "17:00", endTime: "22:00" }] },
    },
    {
      restaurantId: sakura.id,
      title: "Lunch Bento Box Deal",
      description: "Complete bento box with rice, miso soup, salad, and choice of protein for an unbeatable price.",
      priceInfo: "$10.99 bento box",
      dineIn: true,
      toGo: true,
      cuisineType: "Japanese",
      category: "Lunch Special",
      status: "APPROVED" as const,
      verified: false,
      submittedById: defaultUserId,
      schedules: {
        create: [
          { dayOfWeek: 1, startTime: "11:00", endTime: "14:00" },
          { dayOfWeek: 2, startTime: "11:00", endTime: "14:00" },
          { dayOfWeek: 3, startTime: "11:00", endTime: "14:00" },
          { dayOfWeek: 4, startTime: "11:00", endTime: "14:00" },
          { dayOfWeek: 5, startTime: "11:00", endTime: "14:00" },
        ],
      },
    },
    {
      restaurantId: italianGarden.id,
      title: "Thursday Pasta Night",
      description: "All pasta dishes $2 off every Thursday. Includes fettuccine, lasagna, spaghetti, and more.",
      priceInfo: "$2 off pasta",
      dineIn: true,
      toGo: true,
      vegetarianFriendly: true,
      familyFriendly: true,
      cuisineType: "Italian",
      category: "Daily Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: adminUserId,
      schedules: { create: [{ dayOfWeek: 4, startTime: "17:00", endTime: "22:00" }] },
    },
    {
      restaurantId: italianGarden.id,
      title: "Sunday Family Brunch",
      description: "All-you-can-eat brunch buffet with Italian specialties, desserts, and mimosas.",
      priceInfo: "$24.99/person",
      dineIn: true,
      toGo: false,
      kidFriendly: true,
      familyFriendly: true,
      alcoholAvailable: true,
      cuisineType: "Italian",
      category: "Weekend Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: adminUserId,
      schedules: { create: [{ dayOfWeek: 0, startTime: "10:00", endTime: "14:00" }] },
    },
    {
      restaurantId: dragonPalace.id,
      title: "Dim Sum Saturday Morning",
      description: "Traditional dim sum served fresh from the cart every Saturday morning. Come early for best selection!",
      priceInfo: "$3-8/plate",
      dineIn: true,
      toGo: false,
      kidFriendly: true,
      familyFriendly: true,
      cuisineType: "Chinese",
      category: "Weekend Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 6, startTime: "09:00", endTime: "13:00" }] },
    },
    {
      restaurantId: dragonPalace.id,
      title: "Monday Lunch Combo",
      description: "Choose any 2 dishes from the lunch menu with fried rice or lo mein and a spring roll.",
      priceInfo: "$12.99 combo",
      dineIn: true,
      toGo: true,
      cuisineType: "Chinese",
      category: "Lunch Special",
      status: "APPROVED" as const,
      verified: false,
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 1, startTime: "11:30", endTime: "15:00" }] },
    },
    {
      restaurantId: pubGrill.id,
      title: "Late Night Happy Hour",
      description: "Half price apps and $3 drafts every night from 10pm to midnight. Burgers, nachos, and more!",
      priceInfo: "50% off apps + $3 beers",
      dineIn: true,
      toGo: false,
      alcoholAvailable: true,
      lateNight: true,
      cuisineType: "American",
      category: "Late Night",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: defaultUserId,
      schedules: {
        create: [
          { dayOfWeek: 4, startTime: "22:00", endTime: "00:00" },
          { dayOfWeek: 5, startTime: "22:00", endTime: "00:00" },
          { dayOfWeek: 6, startTime: "22:00", endTime: "00:00" },
        ],
      },
    },
    {
      restaurantId: pubGrill.id,
      title: "Weekend Wing Feast",
      description: "All-you-can-eat wings on weekends! Choose from 8 sauces. Served with celery, carrots, and blue cheese.",
      priceInfo: "$19.99/person",
      dineIn: true,
      toGo: false,
      alcoholAvailable: true,
      cuisineType: "American",
      category: "Weekend Special",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: adminUserId,
      schedules: {
        create: [
          { dayOfWeek: 0, startTime: "12:00", endTime: "20:00" },
          { dayOfWeek: 6, startTime: "12:00", endTime: "20:00" },
        ],
      },
    },
    {
      restaurantId: pizzaPalace.id,
      title: "Kids Eat Free Tuesday",
      description: "Every Tuesday, kids under 12 eat free with purchase of adult entree. Includes pizza or pasta.",
      priceInfo: "Free kids meal",
      dineIn: true,
      toGo: false,
      kidFriendly: true,
      kidsEatFree: true,
      familyFriendly: true,
      cuisineType: "Pizza",
      category: "Kids Meal",
      status: "APPROVED" as const,
      verified: true,
      verifiedAt: new Date(),
      submittedById: adminUserId,
      schedules: { create: [{ dayOfWeek: 2, startTime: "17:00", endTime: "21:00" }] },
    },
    {
      restaurantId: pizzaPalace.id,
      title: "Pizza Monday Deal",
      description: "Large 2-topping pizza for just $9.99 every Monday. Dine in or carry out.",
      priceInfo: "$9.99 large pizza",
      dineIn: true,
      toGo: true,
      kidFriendly: true,
      cuisineType: "Pizza",
      category: "Daily Special",
      status: "APPROVED" as const,
      verified: false,
      submittedById: defaultUserId,
      schedules: { create: [{ dayOfWeek: 1, startTime: "11:00", endTime: "22:00" }] },
    },
    {
      restaurantId: joes.id,
      title: "Weekend Brunch Special",
      description: "Build your own brunch burger with eggs, cheese, and your choice of toppings. Served with hash browns.",
      priceInfo: "$11.99 brunch burger",
      dineIn: true,
      toGo: false,
      kidFriendly: true,
      familyFriendly: true,
      cuisineType: "Burgers",
      category: "Weekend Special",
      status: "PENDING" as const,
      verified: false,
      submittedById: defaultUserId,
      schedules: {
        create: [
          { dayOfWeek: 0, startTime: "10:00", endTime: "14:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
        ],
      },
    },
  ];

  let whataburgerDealId: string | null = null;
  for (const dealData of deals) {
    const createdDeal = await prisma.deal.create({ data: dealData });
    if (createdDeal.title === "Whataburger App Free Fries") {
      whataburgerDealId = createdDeal.id;
    }
  }

  if (whataburgerDealId && whataburgerNorth && whataburgerSouth) {
    await prisma.dealLocationParticipation.create({
      data: {
        dealId: whataburgerDealId,
        restaurantId: whataburgerNorth.id,
        status: "NON_PARTICIPATING",
        source: "REVIEW_APPROVED",
        notes: "Sample excluded location for multi-location deal demos.",
        updatedById: adminUserId,
      },
    });

    await prisma.dealLocationParticipationReview.create({
      data: {
        dealId: whataburgerDealId,
        restaurantId: whataburgerSouth.id,
        requestedStatus: "NON_PARTICIPATING",
        status: "PENDING",
        notes: "Community report: app coupon was not accepted at this location last week.",
        submittedById: defaultUserId,
      },
    });
  }

  console.log("✅ Seed complete!");
  if (isProductionSeed) {
    if (configuredAdminEmails.length > 0) {
      console.log("  Applied any production admin promotions from ADMIN_EMAILS.");
    } else {
      console.log("  No ADMIN_EMAILS configured. Production seed did not create a generic admin account.");
    }
  } else {
    console.log("  Admin: admin@dailyfooddeals.com / admin123");
    console.log("  User:  user@example.com / user1234");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
