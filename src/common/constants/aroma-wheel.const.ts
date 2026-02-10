import type { AromaCategory } from '@/common/types/explore';

export const AROMA_CATEGORIES: AromaCategory[] = [
  {
    id: 'fruit',
    label: 'Fruit',
    color: '#E74C3C',
    subcategories: [
      {
        id: 'citrus',
        label: 'Citrus',
        aromas: [
          { id: 'lemon', label: 'Lemon', description: 'Bright, zesty citrus. Sharp and refreshing.', commonIn: ['Sauvignon Blanc', 'Riesling', 'Verdicchio'] },
          { id: 'lime', label: 'Lime', description: 'Tart and green. Slightly more herbal than lemon.', commonIn: ['Sauvignon Blanc', 'Grüner Veltliner'] },
          { id: 'grapefruit', label: 'Grapefruit', description: 'Pink or white grapefruit pith and juice.', commonIn: ['Rosé', 'Sauvignon Blanc', 'Vermentino'] },
          { id: 'orange-peel', label: 'Orange Peel', description: 'Bitter, aromatic citrus rind.', commonIn: ['Viognier', 'Orange Wine', 'Muscat'] },
        ],
      },
      {
        id: 'tree-fruit',
        label: 'Tree Fruit',
        aromas: [
          { id: 'apple', label: 'Apple', description: 'Green apple (tart) or red apple (sweeter).', commonIn: ['Chardonnay', 'Chenin Blanc', 'Pinot Grigio'] },
          { id: 'pear', label: 'Pear', description: 'Soft, juicy pear. Slightly floral.', commonIn: ['Chardonnay', 'Pinot Blanc', 'Viognier'] },
          { id: 'peach', label: 'Peach', description: 'Sweet stone fruit with velvety skin notes.', commonIn: ['Viognier', 'Riesling', 'Moscato'] },
          { id: 'apricot', label: 'Apricot', description: 'Concentrated stone fruit, sometimes dried.', commonIn: ['Viognier', 'Chenin Blanc', 'Tokaji'] },
        ],
      },
      {
        id: 'red-fruit',
        label: 'Red Fruit',
        aromas: [
          { id: 'strawberry', label: 'Strawberry', description: 'Fresh or jammy strawberry notes.', commonIn: ['Pinot Noir', 'Grenache', 'Rosé'] },
          { id: 'raspberry', label: 'Raspberry', description: 'Bright, slightly tart red berry.', commonIn: ['Pinot Noir', 'Grenache', 'Zinfandel'] },
          { id: 'cherry', label: 'Cherry', description: 'Red cherry (bright) or black cherry (richer).', commonIn: ['Pinot Noir', 'Sangiovese', 'Merlot'] },
          { id: 'cranberry', label: 'Cranberry', description: 'Tart, acidic red berry.', commonIn: ['Pinot Noir', 'Nebbiolo', 'Barbera'] },
        ],
      },
      {
        id: 'dark-fruit',
        label: 'Dark Fruit',
        aromas: [
          { id: 'blackberry', label: 'Blackberry', description: 'Rich, dark, slightly sweet berry.', commonIn: ['Cabernet Sauvignon', 'Syrah', 'Malbec'] },
          { id: 'black-currant', label: 'Black Currant', description: 'Intense, slightly herbaceous dark fruit. Classic Cabernet.', commonIn: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc'] },
          { id: 'plum', label: 'Plum', description: 'Ripe, juicy dark stone fruit.', commonIn: ['Merlot', 'Malbec', 'Zinfandel'] },
          { id: 'fig', label: 'Fig', description: 'Rich, jammy dried fruit character.', commonIn: ['Shiraz', 'Zinfandel', 'Port'] },
        ],
      },
      {
        id: 'tropical',
        label: 'Tropical',
        aromas: [
          { id: 'pineapple', label: 'Pineapple', description: 'Sweet, tangy tropical fruit.', commonIn: ['Chardonnay', 'Chenin Blanc', 'Viognier'] },
          { id: 'mango', label: 'Mango', description: 'Lush, aromatic tropical sweetness.', commonIn: ['Gewürztraminer', 'Viognier', 'Muscat'] },
          { id: 'passionfruit', label: 'Passionfruit', description: 'Exotic, tart-sweet tropical aroma.', commonIn: ['Sauvignon Blanc', 'Sémillon'] },
          { id: 'lychee', label: 'Lychee', description: 'Perfumed, sweet tropical note.', commonIn: ['Gewürztraminer', 'Muscat', 'Torrontés'] },
        ],
      },
    ],
  },
  {
    id: 'floral',
    label: 'Floral',
    color: '#9B59B6',
    subcategories: [
      {
        id: 'white-flowers',
        label: 'White Flowers',
        aromas: [
          { id: 'jasmine', label: 'Jasmine', description: 'Heady, sweet white floral perfume.', commonIn: ['Gewürztraminer', 'Moscato', 'Torrontés'] },
          { id: 'honeysuckle', label: 'Honeysuckle', description: 'Sweet, nectar-like floral note.', commonIn: ['Riesling', 'Viognier', 'Chenin Blanc'] },
          { id: 'acacia', label: 'Acacia', description: 'Delicate, soft white blossom.', commonIn: ['Chardonnay', 'Pinot Blanc'] },
        ],
      },
      {
        id: 'red-flowers',
        label: 'Red Flowers',
        aromas: [
          { id: 'rose', label: 'Rose', description: 'Classic floral perfume. Dried or fresh rose petals.', commonIn: ['Gewürztraminer', 'Nebbiolo', 'Pinot Noir'] },
          { id: 'violet', label: 'Violet', description: 'Purple floral, slightly powdery.', commonIn: ['Malbec', 'Syrah', 'Nebbiolo'] },
          { id: 'lavender', label: 'Lavender', description: 'Herbal-floral, aromatic and calming.', commonIn: ['Grenache', 'Mourvèdre', 'Rosé'] },
        ],
      },
      {
        id: 'dried-flowers',
        label: 'Dried Flowers',
        aromas: [
          { id: 'potpourri', label: 'Potpourri', description: 'Complex mix of dried floral and spice.', commonIn: ['Nebbiolo', 'Sangiovese', 'Pinot Noir'] },
          { id: 'chamomile', label: 'Chamomile', description: 'Soft, herbal floral with a calming quality.', commonIn: ['Sherry', 'Orange Wine'] },
          { id: 'dried-rose', label: 'Dried Rose', description: 'Deeper, more concentrated than fresh rose.', commonIn: ['Nebbiolo', 'Barolo'] },
        ],
      },
    ],
  },
  {
    id: 'herbal',
    label: 'Herbal & Vegetal',
    color: '#27AE60',
    subcategories: [
      {
        id: 'green-herb',
        label: 'Green Herb',
        aromas: [
          { id: 'grass', label: 'Fresh Grass', description: 'Freshly cut lawn. Bright and green.', commonIn: ['Sauvignon Blanc', 'Grüner Veltliner'] },
          { id: 'basil', label: 'Basil', description: 'Sweet, aromatic herb.', commonIn: ['Sangiovese', 'Sauvignon Blanc'] },
          { id: 'mint', label: 'Mint', description: 'Cool, refreshing menthol note.', commonIn: ['Cabernet Sauvignon', 'Shiraz'] },
          { id: 'eucalyptus', label: 'Eucalyptus', description: 'Cooling, mentholated character.', commonIn: ['Cabernet Sauvignon', 'Australian Shiraz'] },
        ],
      },
      {
        id: 'dried-herb',
        label: 'Dried Herb',
        aromas: [
          { id: 'thyme', label: 'Thyme', description: 'Earthy, savory Mediterranean herb.', commonIn: ['Grenache', 'Mourvèdre', 'Rhône blends'] },
          { id: 'oregano', label: 'Oregano', description: 'Warm, slightly bitter herb.', commonIn: ['Sangiovese', 'Nero d\'Avola'] },
          { id: 'sage', label: 'Sage', description: 'Soft, silvery herbaceous note.', commonIn: ['Cabernet Franc', 'Sangiovese'] },
        ],
      },
      {
        id: 'vegetal',
        label: 'Vegetal',
        aromas: [
          { id: 'bell-pepper', label: 'Bell Pepper', description: 'Green, herbaceous pyrazine character.', commonIn: ['Cabernet Franc', 'Carmenère', 'Cabernet Sauvignon'] },
          { id: 'olive', label: 'Olive', description: 'Green or black olive, briny and savory.', commonIn: ['Sangiovese', 'Tempranillo', 'Mourvèdre'] },
          { id: 'tomato-leaf', label: 'Tomato Leaf', description: 'Green, herbaceous tomato vine.', commonIn: ['Sangiovese', 'Cabernet Franc'] },
        ],
      },
    ],
  },
  {
    id: 'spice',
    label: 'Spice',
    color: '#E67E22',
    subcategories: [
      {
        id: 'sweet-spice',
        label: 'Sweet Spice',
        aromas: [
          { id: 'vanilla', label: 'Vanilla', description: 'Sweet, creamy vanillin. Usually from oak aging.', commonIn: ['Oaked Chardonnay', 'Rioja', 'Cabernet Sauvignon'] },
          { id: 'cinnamon', label: 'Cinnamon', description: 'Warm, sweet baking spice.', commonIn: ['Grenache', 'Zinfandel', 'Tempranillo'] },
          { id: 'clove', label: 'Clove', description: 'Intense, warm, slightly numbing spice.', commonIn: ['Syrah', 'Mourvèdre', 'Barolo'] },
          { id: 'nutmeg', label: 'Nutmeg', description: 'Warm, slightly sweet, woody spice.', commonIn: ['Gewürztraminer', 'Oaked Chardonnay'] },
        ],
      },
      {
        id: 'savory-spice',
        label: 'Savory Spice',
        aromas: [
          { id: 'black-pepper', label: 'Black Pepper', description: 'Pungent, spicy kick. Rotundone compound.', commonIn: ['Syrah', 'Grüner Veltliner', 'Zinfandel'] },
          { id: 'white-pepper', label: 'White Pepper', description: 'Subtler, slightly musty pepper.', commonIn: ['Grenache', 'Malbec'] },
          { id: 'licorice', label: 'Licorice', description: 'Sweet anise, sometimes from oak or grape skin.', commonIn: ['Cabernet Sauvignon', 'Nebbiolo', 'Syrah'] },
        ],
      },
      {
        id: 'exotic-spice',
        label: 'Exotic Spice',
        aromas: [
          { id: 'ginger', label: 'Ginger', description: 'Warm, zesty, slightly sweet root spice.', commonIn: ['Gewürztraminer', 'Riesling'] },
          { id: 'star-anise', label: 'Star Anise', description: 'Sweet, licorice-like warming spice.', commonIn: ['Syrah', 'Grenache'] },
          { id: 'saffron', label: 'Saffron', description: 'Exotic, slightly bitter, golden spice.', commonIn: ['Nebbiolo', 'Sangiovese'] },
        ],
      },
    ],
  },
  {
    id: 'earth',
    label: 'Earth & Mineral',
    color: '#795548',
    subcategories: [
      {
        id: 'earth-notes',
        label: 'Earth',
        aromas: [
          { id: 'wet-earth', label: 'Wet Earth', description: 'Petrichor. That smell after rain on dry soil.', commonIn: ['Pinot Noir', 'Nebbiolo', 'Tempranillo'] },
          { id: 'mushroom', label: 'Mushroom', description: 'Earthy, umami forest floor character.', commonIn: ['Pinot Noir', 'Nebbiolo', 'aged Burgundy'] },
          { id: 'forest-floor', label: 'Forest Floor', description: 'Damp leaves, bark, and soil. Complex tertiary note.', commonIn: ['Pinot Noir', 'Barolo', 'aged Bordeaux'] },
          { id: 'truffle', label: 'Truffle', description: 'Luxurious, funky earth note. Sign of age.', commonIn: ['Nebbiolo', 'Pinot Noir', 'aged Barolo'] },
        ],
      },
      {
        id: 'mineral',
        label: 'Mineral',
        aromas: [
          { id: 'flint', label: 'Flint', description: 'Strike-a-match, smoky mineral quality.', commonIn: ['Chablis', 'Sancerre', 'Riesling'] },
          { id: 'chalk', label: 'Chalk', description: 'Dry, powdery mineral texture.', commonIn: ['Champagne', 'Chablis'] },
          { id: 'wet-stone', label: 'Wet Stone', description: 'Clean, rain-on-rocks minerality.', commonIn: ['Riesling', 'Albariño', 'Chablis'] },
          { id: 'slate', label: 'Slate', description: 'Sharp, angular mineral note.', commonIn: ['Mosel Riesling', 'Mencia'] },
        ],
      },
      {
        id: 'wood',
        label: 'Wood & Smoke',
        aromas: [
          { id: 'cedar', label: 'Cedar', description: 'Classic "cigar box" aroma. From aging.', commonIn: ['Cabernet Sauvignon', 'Bordeaux', 'Rioja'] },
          { id: 'oak', label: 'Oak', description: 'Toasty, woody character from barrel aging.', commonIn: ['Oaked Chardonnay', 'Rioja', 'Barolo'] },
          { id: 'smoke', label: 'Smoke', description: 'Campfire, charred, or toasty quality.', commonIn: ['Syrah', 'Pinotage', 'Pouilly-Fumé'] },
          { id: 'tobacco', label: 'Tobacco', description: 'Dried tobacco leaf. Aged character.', commonIn: ['Cabernet Sauvignon', 'Nebbiolo', 'Tempranillo'] },
        ],
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    color: '#34495E',
    subcategories: [
      {
        id: 'dairy',
        label: 'Dairy & Nutty',
        aromas: [
          { id: 'butter', label: 'Butter', description: 'Rich, creamy diacetyl from malolactic fermentation.', commonIn: ['Oaked Chardonnay', 'Viognier'] },
          { id: 'cream', label: 'Cream', description: 'Smooth, lactic richness.', commonIn: ['Champagne', 'Oaked Chardonnay'] },
          { id: 'almond', label: 'Almond', description: 'Nutty, slightly sweet.', commonIn: ['Sherry', 'Chenin Blanc', 'Viognier'] },
          { id: 'hazelnut', label: 'Hazelnut', description: 'Toasted, warm nut character.', commonIn: ['Champagne', 'Oaked Chardonnay', 'Sherry'] },
        ],
      },
      {
        id: 'sweet',
        label: 'Sweet & Baked',
        aromas: [
          { id: 'honey', label: 'Honey', description: 'Golden, sweet nectar. Common in aged whites.', commonIn: ['Riesling', 'Sauternes', 'Chenin Blanc'] },
          { id: 'caramel', label: 'Caramel', description: 'Toasty, burnt sugar sweetness.', commonIn: ['Oaked Chardonnay', 'Tawny Port', 'Sherry'] },
          { id: 'brioche', label: 'Brioche', description: 'Yeasty, baked bread character from lees aging.', commonIn: ['Champagne', 'Traditional Method sparkling'] },
          { id: 'chocolate', label: 'Chocolate', description: 'Dark cocoa or milk chocolate richness.', commonIn: ['Merlot', 'Cabernet Sauvignon', 'Zinfandel'] },
        ],
      },
      {
        id: 'savory',
        label: 'Savory & Funky',
        aromas: [
          { id: 'leather', label: 'Leather', description: 'Aged, animal character. Sign of development.', commonIn: ['Nebbiolo', 'Syrah', 'aged Bordeaux'] },
          { id: 'meat', label: 'Cured Meat', description: 'Charcuterie, game, or bacon notes.', commonIn: ['Syrah', 'Mourvèdre', 'Nebbiolo'] },
          { id: 'beeswax', label: 'Beeswax', description: 'Waxy, honeyed texture and aroma.', commonIn: ['aged Riesling', 'Sémillon', 'Chenin Blanc'] },
        ],
      },
    ],
  },
];

// Quick-access flat list of aromas commonly used in SmellStep
export const COMMON_AROMAS: Record<string, string[]> = {
  primary: [
    'lemon', 'lime', 'grapefruit', 'apple', 'pear', 'peach',
    'strawberry', 'raspberry', 'cherry', 'blackberry', 'plum',
    'pineapple', 'passionfruit', 'lychee',
  ],
  secondary: [
    'vanilla', 'butter', 'cream', 'brioche', 'oak',
    'cinnamon', 'clove', 'nutmeg', 'honey', 'caramel',
    'chocolate', 'almond', 'hazelnut',
  ],
  tertiary: [
    'leather', 'tobacco', 'cedar', 'mushroom', 'truffle',
    'wet-earth', 'forest-floor', 'smoke', 'dried-rose',
    'potpourri', 'meat', 'beeswax',
  ],
};

// Helper to look up aroma data by ID
export function findAromaById(id: string) {
  for (const cat of AROMA_CATEGORIES) {
    for (const sub of cat.subcategories) {
      const aroma = sub.aromas.find((a) => a.id === id);
      if (aroma) return { ...aroma, category: cat.label, subcategory: sub.label, color: cat.color };
    }
  }
  return null;
}
