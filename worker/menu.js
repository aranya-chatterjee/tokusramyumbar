// The order menu. Prices are in rupees. SAMPLE PRICES: replace with the real menu.
// Keep each id the same once orders exist; change name, desc and price freely.
export const CATEGORIES = [
  { id: 'ramen', name: 'Ramen' },
  { id: 'plates', name: 'Add ons' },
  { id: 'drinks', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' },
];

export const MENU = [
  { id: 'rabokki', cat: 'ramen', name: 'Rabokki', price: 279, veg: true, desc: 'Ramen and rice cakes in one sweet-spicy bowl.' },
  { id: 'signature-ramen', cat: 'ramen', name: "Toku's Signature Ramen", price: 349, veg: false, desc: 'Springy noodles, rich broth, soft egg.' },
  { id: 'cheese-ramen', cat: 'ramen', name: 'Cheese Ramen', price: 299, veg: true, desc: 'Spicy noodles under melted cheese.' },
  { id: 'fire-noodles', cat: 'ramen', name: 'Fire Noodles', price: 269, veg: true, desc: 'For people who are sure they can handle it.' },
  { id: 'jjamppong', cat: 'ramen', name: 'Jjamppong', price: 379, veg: false, desc: 'Spicy seafood noodle soup, smoky broth.' },
  { id: 'udon', cat: 'ramen', name: 'Udon Bowl', price: 289, veg: true, desc: 'Thick, chewy noodles in a light broth.' },
  { id: 'tonkotsu', cat: 'ramen', name: 'Tonkotsu Ramen', price: 399, veg: false, desc: 'Creamy pork-bone broth, chashu, spring onion.' },
  { id: 'miso-ramen', cat: 'ramen', name: 'Miso Ramen', price: 299, veg: true, desc: 'Nutty miso broth with corn and soft egg.' },
  { id: 'seafood-ramen', cat: 'ramen', name: 'Seafood Ramen', price: 389, veg: false, desc: 'Prawns and squid in a clear, spicy broth.' },
  { id: 'kimchi-ramen', cat: 'ramen', name: 'Kimchi Ramen', price: 279, veg: true, desc: 'Tangy kimchi broth with silky noodles.' },

  { id: 'tteokbokki', cat: 'plates', name: 'Tteokbokki', price: 229, veg: true, desc: 'Rice cakes in a glossy chilli sauce.' },
  { id: 'corn-dog', cat: 'plates', name: 'Korean Corn Dog', price: 179, veg: true, desc: 'Crunchy outside, stretchy cheese inside.' },
  { id: 'kimchi-rice', cat: 'plates', name: 'Kimchi Fried Rice', price: 249, veg: false, desc: 'Smoky rice, kimchi, fried egg on top.' },
  { id: 'mandu', cat: 'plates', name: 'Mandu', price: 199, veg: true, desc: 'Pan-fried dumplings, sesame dip.' },
  { id: 'kimbap', cat: 'plates', name: 'Kimbap', price: 219, veg: true, desc: 'Seaweed rolls with egg, carrot, radish.' },
  { id: 'eomuk', cat: 'plates', name: 'Eomuk Skewers', price: 199, veg: false, desc: 'Fish cake skewers in peppery broth.' },
  { id: 'fried-chicken', cat: 'plates', name: 'Korean Fried Chicken', price: 329, veg: false, desc: 'Twice-fried, sweet gochujang glaze.' },
  { id: 'pajeon', cat: 'plates', name: 'Pajeon', price: 209, veg: true, desc: 'Crisp spring onion pancake.' },
  { id: 'japchae', cat: 'plates', name: 'Japchae', price: 239, veg: true, desc: 'Glass noodles, vegetables, sesame.' },

  { id: 'bingsu', cat: 'desserts', name: 'Bingsu', price: 249, veg: true, desc: 'Shaved ice with fruit and sweet toppings.' },
  { id: 'mochi', cat: 'desserts', name: 'Mochi (2 pc)', price: 149, veg: true, desc: 'Soft rice cakes with a creamy centre.' },
  { id: 'hotteok', cat: 'desserts', name: 'Hotteok', price: 129, veg: true, desc: 'Brown sugar and nut pancake.' },
  { id: 'pudding', cat: 'desserts', name: 'Caramel Pudding', price: 139, veg: false, desc: 'Silky custard, dark caramel.' },
  { id: 'waffle', cat: 'desserts', name: 'Waffle', price: 199, veg: true, desc: 'Cream, berries and syrup.' },
  { id: 'soft-serve', cat: 'desserts', name: 'Soft Serve', price: 99, veg: true, desc: 'Vanilla, cone or cup.' },
  { id: 'strawberry-bingsu', cat: 'desserts', name: 'Strawberry Bingsu', price: 269, veg: true, desc: 'Milk ice with fresh strawberries.' },
  { id: 'lava-cake', cat: 'desserts', name: 'Choco Lava Cake', price: 179, veg: true, desc: 'Warm cake, molten centre.' },

  { id: 'banana-milk', cat: 'drinks', name: 'Banana Milk', price: 129, veg: true, desc: 'The Korean classic, chilled.' },
  { id: 'peach-iced-tea', cat: 'drinks', name: 'Peach Iced Tea', price: 119, veg: true, desc: 'Sweet, cold, fizzy-free.' },
  { id: 'lemon-mint', cat: 'drinks', name: 'Lemon Mint Cooler', price: 109, veg: true, desc: 'Fresh lime, mint, soda.' },
  { id: 'cold-coffee', cat: 'drinks', name: 'Cold Coffee', price: 149, veg: true, desc: 'Blended with ice cream.' },
  { id: 'dalgona', cat: 'drinks', name: 'Dalgona Coffee', price: 159, veg: true, desc: 'Whipped coffee over cold milk.' },
  { id: 'soft-drink', cat: 'drinks', name: 'Soft Drink', price: 69, veg: true, desc: 'Coke, Sprite or Fanta.' },
  { id: 'water', cat: 'drinks', name: 'Mineral Water', price: 30, veg: true, desc: '1 litre bottle.' },
];

export const MENU_BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));
