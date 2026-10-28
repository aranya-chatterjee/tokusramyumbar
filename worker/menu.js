// The order menu, from the owner's menu sheet (Ramen_Menu, 2026-10-28). Prices are in rupees, before GST.
// Keep each id the same once orders exist; change name, desc and price freely.
export const CATEGORIES = [
  { id: 'cheesy', name: "Cheesy & Creamy" },
  { id: 'mild', name: "Mild" },
  { id: 'mild-spicy', name: "Mild Spicy" },
  { id: 'spicy', name: "Spicy" },
  { id: 'addons', name: "Add ons" },
];

export const MENU = [
  { id: 'ottogi-cheddar-mascarpone', cat: 'cheesy', name: "Ottogi Cheddar & Mascarpone", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'ottogi-cheddar', cat: 'cheesy', name: "Ottogi Cheddar", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'ottogi-cheese-spicy', cat: 'cheesy', name: "Ottogi Cheese Spicy", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'nongshim-stir-fry-gourmet-spicy-with-cheese', cat: 'cheesy', name: "Nongshim Stir Fry Gourmet Spicy with Cheese", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'nongshim-toomba', cat: 'cheesy', name: "Nongshim Toomba", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'ottogi-stir-fry-cheesy-spicy-chilli-cheddar', cat: 'cheesy', name: "Ottogi Stir Fry Cheesy Spicy Chilli & Cheddar", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'samyang-buldak-quattro-cheese', cat: 'cheesy', name: "Samyang Buldak Quattro Cheese", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-carbonara', cat: 'cheesy', name: "Samyang Buldak Carbonara", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-cream-carbonara', cat: 'cheesy', name: "Samyang Buldak Cream Carbonara", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-cheese', cat: 'cheesy', name: "Samyang Buldak Cheese", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },

  { id: 'ottogi-jin-veggie-vegan', cat: 'mild', name: "Ottogi Jin Veggie", price: 280, veg: true, desc: "Vegetarian (vegan)" },
  { id: 'nongshim-soon-veggie-gourmet-mild', cat: 'mild', name: "Nongshim Soon Veggie Gourmet Mild", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'ottogi-jin-chicken', cat: 'mild', name: "Ottogi Jin Chicken", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-tangle-garlic-oil-16g-protein', cat: 'mild', name: "Samyang Tangle Garlic Oil (16g Protein)", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-tangle-creamy-mushroom-16g-protein', cat: 'mild', name: "Samyang Tangle Creamy Mushroom (16g Protein)", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-jjajang-black-bean-sauce', cat: 'mild', name: "Samyang Jjajang Black Bean Sauce", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'ottogi-kimchi', cat: 'mild', name: "Ottogi Kimchi", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },

  { id: 'ottogi-jin-mild', cat: 'mild-spicy', name: "Ottogi Jin Mild", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'nongshim-kimchi', cat: 'mild-spicy', name: "Nongshim Kimchi", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'samyang-mild-spicy', cat: 'mild-spicy', name: "Samyang Mild Spicy", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'nongshim-shin-ramyun', cat: 'mild-spicy', name: "Nongshim Shin Ramyun", price: 280, veg: true, desc: "Vegetarian" },

  { id: 'ottogi-jin-spicy', cat: 'spicy', name: "Ottogi Jin Spicy", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'ottogi-yeul', cat: 'spicy', name: "Ottogi Yeul", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'nongshim-red-super-spicy', cat: 'spicy', name: "Nongshim Red Super Spicy", price: 280, veg: true, desc: "Vegetarian" },
  { id: 'samyang-buldak-hot-chicken', cat: 'spicy', name: "Samyang Buldak Hot Chicken", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-stew-type', cat: 'spicy', name: "Samyang Buldak Stew Type", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-2x-spicy', cat: 'spicy', name: "Samyang Buldak 2× Spicy", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },
  { id: 'samyang-buldak-3x-spicy', cat: 'spicy', name: "Samyang Buldak 3× Spicy", price: 280, veg: false, desc: "Non-veg flavour, no meat pieces" },

  { id: 'add-boiled-egg', cat: 'addons', name: "Boiled Egg", price: 30, veg: false, desc: "Add to any bowl" },
  { id: 'add-cheese-slice', cat: 'addons', name: "Cheese Slice", price: 30, veg: true, desc: "Add to any bowl" },
  { id: 'add-tofu', cat: 'addons', name: "Tofu", price: 60, veg: true, desc: "Add to any bowl" },
  { id: 'add-paneer', cat: 'addons', name: "Paneer", price: 60, veg: true, desc: "Add to any bowl" },
  { id: 'add-nori-seaweed', cat: 'addons', name: "Nori (Seaweed)", price: 50, veg: true, desc: "Add to any bowl" },
  { id: 'add-tteokbokki', cat: 'addons', name: "Tteokbokki", price: 50, veg: true, desc: "Add to any bowl" },
];

// Null prototype, so ids like "constructor" or "__proto__" are not found as dishes
export const MENU_BY_ID = Object.assign(Object.create(null), Object.fromEntries(MENU.map((m) => [m.id, m])));
