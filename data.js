// Menu Items Data for Bread N' Brew
const menuItems = [
  // Pastries
  {
    id: 1,
    name: "Butter Croissant",
    price: 4.5,
    category: "Pastries",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691220668252201/crossiant.jpg?ex=684fb65e&is=684e64de&hm=5bdd4b747ef554c8039517f54f3c72ace18fe91a36bd6bd043c9c7f8e8a61954&=&format=webp&width=704&height=704",
    description:
      "Flaky, buttery, and baked to golden perfection. A classic favorite made with European butter and traditional techniques.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },
  {
    id: 3,
    name: "Cinnamon Bun",
    price: 5.5,
    category: "Pastries",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691219783254066/cinnamon.jpg?ex=684fb65e&is=684e64de&hm=438a302406c57b668859321e0e0e2aaa50b3962de71d79603c26bc119f3f47cf&=&format=webp&width=704&height=704",
    description:
      "Sweet, gooey, and topped with a decadent cream cheese frosting. Made fresh daily with Madagascar cinnamon.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },
  {
    id: 4,
    name: "Chocolate Muffin",
    price: 4.0,
    category: "Pastries",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691219531599902/chocolate.jpg?ex=684fb65e&is=684e64de&hm=2865dad7a85b970cf99605477b589d374dc048d0b39bff9d05ad8c4fdedd9c92&=&format=webp&width=704&height=704",
    description:
      "A rich, moist chocolate muffin packed with Belgian semi-sweet chocolate chips and finished with a subtle cocoa glaze.",
    allergens: ["Wheat", "Dairy", "Eggs", "Soy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 9,
    name: "Almond Croissant",
    price: 5.25,
    category: "Pastries",
    img: "https://i.ibb.co/gZQQBFX/Almondcros.jpg",
    description:
      "Filled with a sweet almond paste and topped with toasted almonds. A French bakery classic.",
    allergens: ["Wheat", "Dairy", "Eggs", "Tree Nuts"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 10,
    name: "Pain au Chocolat",
    price: 5.0,
    category: "Pastries",
    img: "https://i.ibb.co/rRrTXJm/Painauchocolat.jpg",
    description:
      "A classic French pastry with two batons of premium dark chocolate wrapped in buttery, flaky pastry.",
    allergens: ["Wheat", "Dairy", "Eggs", "Soy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 11,
    name: "Blueberry Scone",
    price: 4.25,
    category: "Pastries",
    img: "https://i.ibb.co/bgz2DNx/blueberry.jpg",
    description:
      "A tender, crumbly scone bursting with fresh wild blueberries and finished with a light glaze.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Breads
  {
    id: 2,
    name: "Sourdough",
    price: 17.0,
    category: "Breads",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691220106350642/sourdough.jpg?ex=684fb65e&is=684e64de&hm=5e7fefbfba4465f47dd23f13d8bda91a98f0673be367755d64d8dabdf45e635e&=&format=webp&width=704&height=704",
    description:
      "Our signature wild yeast sourdough with a crispy crust and a soft, chewy interior. Fermented for 24 hours for complex flavor.",
    allergens: ["Wheat"],
    customizations: {
      slice: [
        { name: "Loaf", price: 0 },
        { name: "Slice", price: -14.5 },
      ],
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },

  // Coffee
  {
    id: 5,
    name: "Artisan Latte",
    price: 5.0,
    category: "Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691219153981512/artisan.jpg?ex=684fb65e&is=684e64de&hm=438a32e3463de1c3c9dd9732fa1462e9f5797393669ffcbbe1639f464aa6c41f&=&format=webp&width=704&height=704",
    description:
      "Rich espresso with perfectly steamed milk and a touch of latte art. Made with our signature house blend.",
    allergens: ["Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },
  {
    id: 6,
    name: "Signature Cold Brew",
    price: 5.25,
    category: "Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691218890002533/coldbrew.jpg?ex=684fb65e&is=684e64de&hm=4bbf54e70fc6f307e5ae4ccfc1a3761d365de941f7bf9d9e4df79992b10c4a82&=&format=webp&width=704&height=704",
    description:
      "Slow-steeped for 18 hours using premium beans for a smooth, bold, and naturally refreshing taste.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },
  {
    id: 7,
    name: "Classic Cappuccino",
    price: 4.75,
    category: "Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691218537545839/cappucino.jpg?ex=684fb65e&is=684e64de&hm=f8b3ea4b02483ea0149d66c4c11f88bd159f512720b6b567eb847d3dca900264&=&format=webp&width=704&height=704",
    description:
      "A perfect balance of espresso, steamed milk, and a thick layer of velvety foam. Traditional Italian style.",
    allergens: ["Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 8,
    name: "Americano",
    price: 3.75,
    category: "Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691218260852766/esperro.jpg?ex=684fb65e&is=684e64de&hm=a0aa94dc266e87bb0a6255100358110652ac8035ad70677920838556aaae4b8c&=&format=webp&width=704&height=704",
    description:
      "A double shot of our signature espresso, gently lengthened with hot water for a clean, bold flavor.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Sweets
  {
    id: 25,
    name: "Cake Pop",
    price: 3.0,
    category: "Sweets",
    img: "https://i.ibb.co/C51QZ50/Cakepop.jpg",
    description:
      "A bite-sized treat of vanilla or chocolate cake mixed with frosting and dipped in colored chocolate coating.",
    allergens: ["Wheat", "Dairy", "Eggs", "Soy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 26,
    name: "Assorted Macarons",
    price: 3.5,
    category: "Sweets",
    img: "https://i.ibb.co/VpgsSqM/Macarons.jpg",
    description:
      "Delicate French almond cookies with creamy ganache filling. Available in seasonal flavors that change daily.",
    allergens: ["Tree Nuts", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
    featured: true,
  },
  {
    id: 27,
    name: "Cannoli",
    price: 4.5,
    category: "Sweets",
    img: "https://i.ibb.co/Rkg5z02/Cannoli.jpg",
    description:
      "A crispy pastry shell filled with a sweet, creamy ricotta filling and finished with chocolate chips and powdered sugar.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Tea
  {
    id: 12,
    name: "Earl Grey Tea",
    price: 3.5,
    category: "Tea",
    img: "https://i.ibb.co/Hf6ZhbZ/Earlgrey.jpg",
    description:
      "A classic black tea blend, fragrant with bergamot oil and cornflower petals. Served with honey and lemon.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 13,
    name: "Chamomile Tea",
    price: 3.5,
    category: "Tea",
    img: "https://i.ibb.co/xtPyRd9/Chamomile.jpg",
    description:
      "A soothing herbal tea with a delicate, floral aroma. Perfect for relaxation and naturally caffeine-free.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 14,
    name: "Green Tea",
    price: 3.5,
    category: "Tea",
    img: "https://i.ibb.co/SDHkcTj/Greentea.jpg",
    description:
      "A refreshing and vibrant green tea full of antioxidants. Light, grassy flavor with a clean finish.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Seasonal Drinks
  {
    id: 15,
    name: "Fresh Lemonade",
    price: 4.5,
    category: "Seasonal",
    img: "https://i.ibb.co/Kcjj58b/Lemonade.jpg",
    description:
      "Made fresh daily with hand-squeezed lemons, pure cane sugar, and a hint of mint. Perfectly sweet and tart.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 16,
    name: "Matcha Latte",
    price: 5.75,
    category: "Seasonal",
    img: "https://i.ibb.co/gZsZj1T/latte.jpg",
    description:
      "Ceremonial grade matcha whisked to perfection with steamed milk and lightly sweetened with honey.",
    allergens: ["Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 17,
    name: "Strawberry Acai",
    price: 5.5,
    category: "Seasonal",
    img: "https://i.ibb.co/4RJF4wm/Strawberryacai.jpg",
    description:
      "A vibrant and fruity refresher with notes of strawberry and acai, topped with freeze-dried strawberries.",
    allergens: [],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Breakfast
  {
    id: 18,
    name: "Bacon, Egg & Cheese",
    price: 8.5,
    category: "Breakfast",
    img: "https://i.ibb.co/kgc9xzr/BEC.jpg",
    description:
      "Crispy applewood bacon, fluffy scrambled egg, and melted cheddar cheese on a fresh brioche bun.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 19,
    name: "Avocado Toast",
    price: 9.5,
    category: "Breakfast",
    img: "https://i.ibb.co/cKzs0GN/AvocadoT.jpg",
    description:
      "Fresh smashed avocado on our signature sourdough toast, topped with everything seasoning and a drizzle of olive oil.",
    allergens: ["Wheat", "Sesame"],
    customizations: {
      toppings: [
        {
          name: "Add Bacon",
          price: 2.0,
          img: "https://i.ibb.co/hxBK09R/Bacon-Avocado.jpg",
        },
      ],
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Lunch
  {
    id: 20,
    name: "Turkey & Swiss",
    price: 12.0,
    category: "Lunch",
    img: "https://i.ibb.co/JRBSS1c/Turk-Swiss.jpg",
    description:
      "Roasted turkey breast, Swiss cheese, fresh lettuce, and ripe tomato on our house-made sourdough bread.",
    allergens: ["Wheat", "Dairy"],
    customizations: {
      toppings: [
        { name: "Add Bacon", price: 1.5 },
        { name: "Add Avocado", price: 2.5 },
      ],
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 21,
    name: "Caprese Sandwich",
    price: 11.5,
    category: "Lunch",
    img: "https://i.ibb.co/Fqw9f19/Caprese.jpg",
    description:
      "Fresh mozzarella, ripe heirloom tomatoes, basil leaves, and balsamic glaze on toasted focaccia bread.",
    allergens: ["Wheat", "Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },

  // Pizza
  {
    id: 22,
    name: "Margherita Pizza",
    price: 21.0,
    category: "Pizza",
    img: "https://i.ibb.co/G4SQQ4w/Margherita.jpg",
    description:
      "Classic Neapolitan pizza with fresh mozzarella, San Marzano tomatoes, fresh basil, and extra virgin olive oil.",
    allergens: ["Wheat", "Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 23,
    name: "Classic Cheese Pizza",
    price: 14.0,
    category: "Pizza",
    img: "https://placehold.co/400x400/d3d3d3/ffffff?text=Classic+Pizza",
    description:
      "A simple cheese pizza with our signature tomato sauce and mozzarella cheese. Add pepperoni for $2.00.",
    allergens: ["Wheat", "Dairy"],
    customizations: {
      toppings: [{ name: "Add Pepperoni", price: 2.0 }],
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    id: 24,
    name: "Spicy Brooklyn Pizza",
    price: 24.0,
    category: "Pizza",
    img: "https://i.ibb.co/cSDF23Q/Spicy-Brooklyn.jpg",
    description:
      "Tomato sauce, mozzarella, spicy pepperoni, pickled long hot peppers, and a drizzle of hot honey for the perfect kick.",
    allergens: ["Wheat", "Dairy"],
    customizations: {
      test: ["Option 1", "Option 2", "Option 3"],
    },
  },
];

// Application Constants
const APP_CONFIG = {
  NJ_SALES_TAX_RATE: 0.06625,
  MAX_QUANTITY_PER_ITEM: 25,
  MAX_ORDER_AMOUNT: 200,
  MIN_TIP_PERCENTAGE: 15,
  STORE_HOURS: {
    weekday: { open: 7, close: 17.5 }, // 7:00 AM to 5:30 PM
    sunday: { open: 9, close: 16 }, // 9:00 AM to 4:00 PM
  },
  PICKUP_TIME_INCREMENT: 15, // minutes
  MIN_PICKUP_TIME: 15, // minutes from now
  MAX_INITIAL_TIME_SLOTS: 3,
};

// Contact Information
const CONTACT_INFO = {
  phone: "(908) 933-0123",
  email: "breadnbrew512@gmail.com",
  address: {
    street: "512 Springfield Ave",
    city: "Berkeley Heights",
    state: "NJ",
    zip: "07922",
  },
};
