# Food 3D Model Definition Reference

## Data Contract

Output a single JSON-compatible object:

```ts
type FoodModel = {
  schemaVersion: "food-model-v1";
  id: string;
  displayName: string;
  category: "ingredient" | "cut-ingredient" | "intermediate" | "dish";
  frontDirection: "-Z";
  unitScale: number;
  bounds: {
    size: [number, number, number];
    center: [number, number, number];
  };
  parts: FoodModelPart[];
  designNotes: string[];
};
```

Use lower kebab-case for `id`. Use stable English identifiers unless the user requests another locale. Keep all numeric values concise, usually 2 decimal places.

## Coordinate System

- Use X for left/right, Y for up/down, Z for depth.
- Face the model toward negative Z.
- Put the object base near `y = 0`.
- Keep ordinary foods near `unitScale = 1`.
- Keep most objects within width/depth `0.8-1.6` and height `0.4-1.4`.
- Set `bounds.size` and `bounds.center` to approximate overall dimensions, not exact geometry bounds.

## Part Fields

Each part must include:

```ts
type FoodModelPart = {
  id: string;
  shape:
    | "roundedBox"
    | "box"
    | "cylinder"
    | "cone"
    | "sphere"
    | "capsule"
    | "wedge"
    | "fanWedge";
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  color: string;
  material?: {
    roughness?: number;
    metalness?: 0;
    opacity?: number;
  };
  appearance?: {
    radius?: number;
    bevel?: number;
    segments?: number;
    flatShading?: boolean;
  };
};
```

### Shape Semantics

- `roundedBox`: Main voxel shape. Interpret `size` as width, height, depth. Use `appearance.radius`.
- `box`: Sharp cuboid for flat bands, wrappers, or cut marks.
- `cylinder`: Round slices, bowls, stems, rolls, or disks. Default cylinder axis is Y.
- `cone`: Tapered tips, carrot points, dollops, or stylized peaks. Default cone axis is Y.
- `sphere`: Soft round fruit, berries, dumplings, or highlights. Scale by `size`.
- `capsule`: Sausages, beans, fries, or elongated soft pieces.
- `wedge`: Triangular prism-like piece, such as cheese, cake slices, or cut fruit.
- `fanWedge`: Sector-like wedge, such as citrus segments or gyoza fan forms.

## Appearance Defaults

Use these defaults unless a part needs a distinct value:

```json
{
  "material": { "roughness": 0.85, "metalness": 0 },
  "appearance": { "radius": 0.08, "segments": 4, "flatShading": false }
}
```

Use larger radii for plush food bodies (`0.1-0.18`) and smaller radii for toppings or bands (`0.02-0.06`). Avoid high segment counts; `4-8` is enough.

## Color Guidance

Choose warm, readable colors:

- Tomato: body `#D84A3A`, stem `#4F8A3D`, highlight `#F27A66`
- Carrot: body `#E67E2E`, leaves `#4F9A4A`
- Rice: `#F4EAD2`, shadow grains `#E7D6B7`
- Nori: `#24342C`
- Bread/crust: `#C8843E`, inner bread `#F0C978`
- Cheese: `#F6C84B`
- Meat: `#B85A45`, seared accent `#7A3B2C`
- Leafy greens: `#4E9B52`, darker accent `#2F6F3B`

Do not rely on subtle gradients. Use separate highlight or accent parts instead.

## Example: Tomato

```json
{
  "schemaVersion": "food-model-v1",
  "id": "tomato",
  "displayName": "Tomato",
  "category": "ingredient",
  "frontDirection": "-Z",
  "unitScale": 1,
  "bounds": { "size": [1.1, 0.95, 1.1], "center": [0, 0.48, 0] },
  "parts": [
    {
      "id": "body",
      "shape": "sphere",
      "position": [0, 0.52, 0],
      "size": [1.0, 0.88, 1.0],
      "rotation": [0, 0, 0],
      "color": "#D84A3A",
      "material": { "roughness": 0.85, "metalness": 0 },
      "appearance": { "radius": 0.12, "segments": 8, "flatShading": false }
    },
    {
      "id": "front-highlight",
      "shape": "roundedBox",
      "position": [-0.22, 0.68, -0.42],
      "size": [0.22, 0.14, 0.04],
      "rotation": [0, -0.25, 0.2],
      "color": "#F27A66",
      "material": { "roughness": 0.9, "metalness": 0 },
      "appearance": { "radius": 0.04, "segments": 4, "flatShading": false }
    },
    {
      "id": "leaf-star-a",
      "shape": "roundedBox",
      "position": [0, 0.99, -0.08],
      "size": [0.12, 0.05, 0.42],
      "rotation": [0.15, 0, 0],
      "color": "#4F8A3D",
      "material": { "roughness": 0.9, "metalness": 0 },
      "appearance": { "radius": 0.03, "segments": 4, "flatShading": false }
    },
    {
      "id": "leaf-star-b",
      "shape": "roundedBox",
      "position": [0, 1.0, 0],
      "size": [0.42, 0.05, 0.12],
      "rotation": [0, 0.15, 0],
      "color": "#4F8A3D",
      "material": { "roughness": 0.9, "metalness": 0 },
      "appearance": { "radius": 0.03, "segments": 4, "flatShading": false }
    },
    {
      "id": "stem",
      "shape": "cylinder",
      "position": [0, 1.08, 0],
      "size": [0.12, 0.16, 0.12],
      "rotation": [0.25, 0, 0.15],
      "color": "#3E6F35",
      "material": { "roughness": 0.9, "metalness": 0 },
      "appearance": { "radius": 0.02, "segments": 6, "flatShading": false }
    }
  ],
  "designNotes": [
    "Round red body carries the silhouette.",
    "Green star leaves and short stem make it readable as tomato from above and front.",
    "One front highlight adds toy-like warmth without texture dependency."
  ]
}
```

## Example: Onigiri

```json
{
  "schemaVersion": "food-model-v1",
  "id": "onigiri",
  "displayName": "Onigiri",
  "category": "dish",
  "frontDirection": "-Z",
  "unitScale": 1,
  "bounds": { "size": [1.15, 1.05, 0.72], "center": [0, 0.52, 0] },
  "parts": [
    {
      "id": "rice-body",
      "shape": "wedge",
      "position": [0, 0.55, 0],
      "size": [1.08, 1.0, 0.62],
      "rotation": [0, 0, 0],
      "color": "#F4EAD2",
      "material": { "roughness": 0.88, "metalness": 0 },
      "appearance": { "radius": 0.1, "segments": 4, "flatShading": false }
    },
    {
      "id": "nori-band",
      "shape": "roundedBox",
      "position": [0, 0.34, -0.34],
      "size": [0.42, 0.48, 0.08],
      "rotation": [0, 0, 0],
      "color": "#24342C",
      "material": { "roughness": 0.92, "metalness": 0 },
      "appearance": { "radius": 0.03, "segments": 4, "flatShading": false }
    },
    {
      "id": "rice-grain-left",
      "shape": "roundedBox",
      "position": [-0.32, 0.58, -0.34],
      "size": [0.12, 0.05, 0.04],
      "rotation": [0, 0, 0.3],
      "color": "#E7D6B7",
      "material": { "roughness": 0.9, "metalness": 0 },
      "appearance": { "radius": 0.02, "segments": 4, "flatShading": false }
    }
  ],
  "designNotes": [
    "Triangular rice silhouette and front nori band are the main identifiers.",
    "Single grain accent suggests rice while keeping the model lightweight."
  ]
}
```

## Determinism Rules

- For the same food name, keep the same category, dominant colors, major parts, and orientation unless the user requests a variant.
- Prefer canonical versions over rare regional variants.
- When uncertain, choose the most visually iconic form for a cooking game.
- If the food is ambiguous, include the assumption in `designNotes` rather than asking unless the ambiguity blocks the task.
