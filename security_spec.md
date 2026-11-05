# Security Specification for OGYA Marketplace Firestore

## 1. Data Invariants
- Listings must have an ID matching `^[a-zA-Z0-9_\-]+$` under 128 characters.
- Listings must have a title, non-negative price, valid currency (GHS / GH₵), location string, and seller map with WhatsApp number.
- Users collection (`/users/{userId}`) documents are keyed by user uid with `isValidId(userId)`.
- User profiles enforce required fields: `email` (string <= 256), `createdAt`, `role = 'customer'` or `'vendor'`, and `displayName = email`.
- Products collection (`/products/{productId}`) validates non-negative price, non-negative stock, valid category enum (Fire Extinguisher, Smoke Detector, Fire Blanket, Alarm, Hose), vendor details.
- Vendors collection (`/vendors/{vendorId}`) validates ownerId, shopName, phone, location.
- Orders collection (`/orders/{orderId}`) validates userId, items array, total in GHS, delivery address, phone, and payment method (MTN MoMo, Telecel Cash, Cash on Delivery).
- Public read access is permitted for verified marketplace browsing and product discovery.
- Updates and creates validate schema properties to prevent malformed or malicious documents.

## 2. Payloads Tested
- Missing title or negative price
- Excessively large strings (> 200 chars for title, > 256 for location)
- Invalid document ID poisoning
- User registration payload with invalid role or oversized email
- Product payload with negative stock or unrecognized category
- Order payload with negative total or empty items array
