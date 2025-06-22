// Menu Items Data for Artisan Boulangerie
const menuItems = [
  // Artisan Breads
  {
    id: 1,
    name: "Heritage Sourdough",
    price: 18.0,
    category: "Artisan Breads",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691220106350642/sourdough.jpg?ex=684fb65e&is=684e64de&hm=5e7fefbfba4465f47dd23f13d8bda91a98f0673be367755d64d8dabdf45e635e&=&format=webp&width=704&height=704",
    description:
      "Our signature wild yeast sourdough, fermented for 24 hours with organic stone-ground flour.",
    allergens: ["Wheat"],
    customizations: {
      slice: [
        { name: "Whole Loaf", price: 0 },
        { name: "Half Loaf", price: -9.0 },
        { name: "Sliced", price: 0 },
      ],
    },
  },
  {
    id: 2,
    name: "Pain de Campagne",
    price: 16.5,
    category: "Artisan Breads",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
    description:
      "Country-style bread with a blend of wheat and rye flours, perfect rustic crust.",
    allergens: ["Wheat", "Rye"],
    customizations: {
      slice: [
        { name: "Whole Loaf", price: 0 },
        { name: "Half Loaf", price: -8.0 },
      ],
    },
  },
  {
    id: 3,
    name: "Brioche de Nanterre",
    price: 22.0,
    category: "Artisan Breads",
    img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600",
    description:
      "Rich, buttery brioche loaf made with European butter and farm-fresh eggs.",
    allergens: ["Wheat", "Dairy", "Eggs"],
    customizations: {
      slice: ["Whole Loaf", "Sliced"],
    },
  },

  // French Patisserie
  {
    id: 4,
    name: "Almond Croissant",
    price: 7.5,
    category: "French Patisserie",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691220668252201/crossiant.jpg?ex=684fb65e&is=684e64de&hm=5bdd4b747ef554c8039517f54f3c72ace18fe91a36bd6bd043c9c7f8e8a61954&=&format=webp&width=704&height=704",
    description:
      "Buttery croissant filled with almond cream and topped with sliced almonds.",
    allergens: ["Wheat", "Dairy", "Eggs", "Tree Nuts"],
  },
  {
    id: 5,
    name: "Pain au Chocolat",
    price: 6.5,
    category: "French Patisserie",
    img: "https://i.ibb.co/rRrTXJm/Painauchocolat.jpg",
    description: "Classic French pastry with premium Valrhona dark chocolate.",
    allergens: ["Wheat", "Dairy", "Eggs", "Soy"],
  },
  {
    id: 6,
    name: "Canelé de Bordeaux",
    price: 5.5,
    category: "French Patisserie",
    img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600",
    description:
      "Traditional French cake with a caramelized crust and custard center, infused with rum and vanilla.",
    allergens: ["Wheat", "Dairy", "Eggs"],
  },
  {
    id: 7,
    name: "Mille-feuille",
    price: 8.5,
    category: "French Patisserie",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
    description:
      "Delicate puff pastry layers with vanilla pastry cream and fondant icing.",
    allergens: ["Wheat", "Dairy", "Eggs"],
  },

  // Artisan Cakes
  {
    id: 8,
    name: "Opera Cake",
    price: 12.5,
    category: "Artisan Cakes",
    img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600",
    description:
      "Layers of almond sponge cake, chocolate ganache, and coffee buttercream.",
    allergens: ["Wheat", "Dairy", "Eggs", "Tree Nuts"],
  },
  {
    id: 9,
    name: "Lemon Tart",
    price: 9.5,
    category: "Artisan Cakes",
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600",
    description:
      "Buttery pâte sucrée filled with silky lemon curd and topped with Swiss meringue.",
    allergens: ["Wheat", "Dairy", "Eggs"],
  },
  {
    id: 10,
    name: "Chocolate Éclair",
    price: 7.0,
    category: "Artisan Cakes",
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600",
    description:
      "Choux pastry filled with vanilla pastry cream and topped with dark chocolate glaze.",
    allergens: ["Wheat", "Dairy", "Eggs", "Soy"],
  },

  // Seasonal Specialties
  {
    id: 11,
    name: "Croquembouche",
    price: 45.0,
    category: "Seasonal Specialties",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
    description:
      "Traditional French celebration cake made of choux pastry balls bound with caramel. (Pre-order required)",
    allergens: ["Wheat", "Dairy", "Eggs"],
  },
  {
    id: 12,
    name: "King Cake",
    price: 28.0,
    category: "Seasonal Specialties",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
    description:
      "Traditional braided cake filled with cinnamon and decorated with royal icing. (Seasonal)",
    allergens: ["Wheat", "Dairy", "Eggs"],
  },

  // Specialty Coffee
  {
    id: 13,
    name: "Single-Origin Espresso",
    price: 4.5,
    category: "Specialty Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691218260852766/esperro.jpg?ex=684fb65e&is=684e64de&hm=a0aa94dc266e87bb0a6255100358110652ac8035ad70677920838556aaae4b8c&=&format=webp&width=704&height=704",
    description:
      "Carefully curated single-origin beans, expertly roasted in small batches.",
    allergens: [],
  },
  {
    id: 14,
    name: "Cortado",
    price: 5.5,
    category: "Specialty Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691219153981512/artisan.jpg?ex=684fb65e&is=684e64de&hm=438a32e3463de1c3c9dd9732fa1462e9f5797393669ffcbbe1639f464aa6c41f&=&format=webp&width=704&height=704",
    description:
      "Equal parts espresso and warm milk, served in a small glass for perfect balance.",
    allergens: ["Dairy"],
  },
  {
    id: 15,
    name: "Cold Brew Reserve",
    price: 6.0,
    category: "Specialty Coffee",
    img: "https://media.discordapp.net/attachments/1141574690025001060/1383691218890002533/coldbrew.jpg?ex=684fb65e&is=684e64de&hm=4bbf54e70fc6f307e5ae4ccfc1a3761d365de941f7bf9d9e4df79992b10c4a82&=&format=webp&width=704&height=704",
    description:
      "24-hour slow extraction of premium beans, smooth and naturally sweet.",
    allergens: [],
  },

  // Premium Macarons
  {
    id: 16,
    name: "Macaron Collection",
    price: 24.0,
    category: "Premium Macarons",
    img: "https://i.ibb.co/VpgsSqM/Macarons.jpg",
    description:
      "Box of 6 artisan macarons: vanilla, chocolate, pistachio, raspberry, salted caramel, and lavender.",
    allergens: ["Tree Nuts", "Dairy", "Eggs"],
  },
  {
    id: 17,
    name: "Single Macaron",
    price: 4.5,
    category: "Premium Macarons",
    img: "https://i.ibb.co/VpgsSqM/Macarons.jpg",
    description: "Individual handcrafted macaron in your choice of flavor.",
    allergens: ["Tree Nuts", "Dairy", "Eggs"],
    customizations: {
      flavor: [
        "Vanilla",
        "Chocolate",
        "Pistachio",
        "Raspberry",
        "Salted Caramel",
        "Lavender",
        "Rose",
        "Earl Grey",
      ],
    },
  },

  // Artisan Tea
  {
    id: 18,
    name: "Earl Grey Bergamot",
    price: 4.5,
    category: "Artisan Tea",
    img: "https://i.ibb.co/Hf6ZhbZ/Earlgrey.jpg",
    description:
      "Premium Ceylon black tea infused with oil of bergamot and cornflower petals.",
    allergens: [],
    customizations: {
      service: ["Pot for One", "Pot for Two (+$3)"],
    },
  },
  {
    id: 19,
    name: "Jasmine Phoenix Pearls",
    price: 5.5,
    category: "Artisan Tea",
    img: "https://i.ibb.co/SDHkcTj/Greentea.jpg",
    description:
      "Hand-rolled green tea pearls scented with fresh jasmine flowers.",
    allergens: [],
    customizations: {
      service: ["Pot for One", "Pot for Two (+$3)"],
    },
  },
  {
    id: 20,
    name: "Chamomile Honey",
    price: 4.0,
    category: "Artisan Tea",
    img: "https://i.ibb.co/xtPyRd9/Chamomile.jpg",
    description: "Organic chamomile flowers with a touch of wildflower honey.",
    allergens: [],
    customizations: {
      service: ["Pot for One", "Pot for Two (+$3)"],
    },
  },
];

// Application Constants
const APP_CONFIG = {
  NJ_SALES_TAX_RATE: 0.06625,
  MAX_QUANTITY_PER_ITEM: 25,
  MAX_ORDER_AMOUNT: 300,
  MIN_TIP_PERCENTAGE: 15,
  STORE_HOURS: {
    open: 7,
    close: 18,
  },
  PICKUP_TIME_INCREMENT: 30, // minutes
  MIN_PICKUP_TIME: 45, // minutes from now
  MAX_INITIAL_TIME_SLOTS: 3,
};

// Contact Information
const CONTACT_INFO = {
  phone: "(908) 555-BAKE",
  email: "hello@artisanboulangerie.com",
  address: {
    street: "512 Springfield Ave",
    city: "Berkeley Heights",
    state: "NJ",
    zip: "07922",
  },
};
