---
name: generate-food-3d-model
description: Generate structured, reviewable 3D model definitions for food ingredients, intermediate ingredients, and finished dishes. Use when Codex needs to turn a food name into a lightweight warm voxel-style model made from rounded cuboids and simple primitives for Vite + React / React Three Fiber rendering, without external 3D models, image textures, high-poly meshes, or per-food hardcoded renderers.
---

# Generate Food 3D Model

## Overview

Create compact JSON-compatible model definitions for food items that can be rendered by a generic Vite + React 3D renderer. Favor recognizable color, silhouette, and a small number of warm rounded voxel-like primitives over geometric detail.

For the full data contract, primitive fields, coordinate rules, and examples, read `references/model-definition.md` before producing final model data.

## Workflow

1. Identify the food category: single ingredient, cut ingredient, intermediate material, or finished dish.
2. List 3-5 visible traits that make the item recognizable at small size: dominant color, silhouette, key garnish, cut face, stem, wrapper, bowl, crust, sauce, or layered structure.
3. Reduce the traits into 4-14 parts using mostly rounded cuboids. Add cylinders, cones, spheres, capsules, wedges, or fan wedges only when they materially improve recognition.
4. Keep the whole model inside an approximate `[-0.8, 0.8]` footprint on X/Z and `0-1.4` on Y unless a requested game scale says otherwise.
5. Make the front face point toward negative Z. Put the object base near `y = 0`.
6. Output structured data only, unless the user explicitly asks for explanation. Use stable part names and deterministic choices for the same food name.
7. Include a short `designNotes` array with the visual decisions most useful for human review.

## Modeling Rules

- Prefer 4-10 parts for ordinary ingredients; allow up to 16 for dishes with layers or toppings.
- Use large readable shapes before small decorative parts.
- Use saturated but soft colors; avoid photo-realistic material names, image textures, or noise maps.
- Use color contrast for identity: for example, red body plus green stem for tomato, orange body plus green top for carrot, white rice plus dark nori band for onigiri.
- Use small repeated parts sparingly and make them optional-looking details, not the core silhouette.
- Avoid thin wires, fragile slivers, complex mesh contours, or shapes that only read from one exact camera angle.
- Keep each part human-editable: explicit `position`, `size`, `rotation`, `color`, and appearance values.
- Do not specify renderer implementation details beyond generic geometry, material, and transform properties.

## Output Contract

Return one JSON object matching the reference schema. Minimum top-level fields:

```json
{
  "schemaVersion": "food-model-v1",
  "id": "tomato",
  "displayName": "Tomato",
  "category": "ingredient",
  "frontDirection": "-Z",
  "unitScale": 1,
  "bounds": { "size": [1.2, 1.0, 1.2], "center": [0, 0.5, 0] },
  "parts": [],
  "designNotes": []
}
```

## Review Checklist

Before finalizing, verify:

- The food is identifiable without reading `displayName`.
- The silhouette remains readable when rendered small.
- Rounded cuboids provide the main visual language.
- No external model files or image textures are required.
- The part count stays lightweight.
- The data can be rendered by one generic primitive renderer.
