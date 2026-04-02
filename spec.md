# Mahalaxmi Homoe Pharmacy

## Current State
- Products are stored in localStorage (`mlp_products`) and reset on browser clear; no backend storage.
- Product images are represented by emojis (`imageEmoji` field), not real images.
- The `blob-storage` component is already installed in `caffeine.lock.json` and `StorageClient.ts` exists.
- The backend `main.mo` is empty (`actor {}`) -- no Motoko data persistence.
- Admin panel allows adding/editing/deleting products with emoji picker only.
- ProductCard and ProductDetailPage render emojis in the image area.

## Requested Changes (Diff)

### Add
- Motoko backend with persistent product storage (stable variables): CRUD operations for products.
- Image upload support: admin can pick an image file when adding/editing a product; image is uploaded via blob-storage to the ICP storage gateway and the returned hash is stored with the product.
- `imageHash` field on Product (optional, alongside kept `imageEmoji` for backwards compatibility/fallback).
- Image rendering: ProductCard and ProductDetailPage show the real uploaded image (resolved via StorageClient.getDirectURL) when `imageHash` is present, otherwise fall back to emoji.
- Upload progress indicator in the admin product dialog.

### Modify
- `Product` type: add optional `imageHash?: string` field.
- `AdminPage.tsx` ProductDialog: replace emoji picker with file input + optional emoji fallback; show upload progress; call backend to save product.
- Product data source: load products from backend canister instead of localStorage.
- ProductCard and ProductDetailPage: render `<img>` from resolved hash URL when available.

### Remove
- Products no longer sourced from localStorage `mlp_products`.
- Emoji picker (EMOJIS array) can be removed or kept as optional fallback.

## Implementation Plan
1. Generate Motoko backend with stable product storage (add/update/delete/list products, each product has id, name, description, price, category, imageEmoji, imageHash, stock, active).
2. blob-storage component already selected; wire StorageClient in admin for image upload.
3. Update frontend:
   a. Add `imageHash` to Product type.
   b. Update AdminPage ProductDialog: file input, upload via StorageClient on save, show progress.
   c. Update AdminPage: load/save products from backend actor instead of localStorage.
   d. Update ProductCard + ProductDetailPage: show `<img>` when imageHash present, else emoji.
   e. Update CartContext: it uses `emoji` from product -- keep imageEmoji as fallback.
