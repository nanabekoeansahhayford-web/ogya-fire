# Security Specification for OGYA FIRE Marketplace Firestore

## 1. Access Control & Data Invariants
- **Public Read (Guest Browsing Enabled)**:
  - `/products/{productId}`: Unauthenticated guests can `get` and `list` products across all general marketplace categories (`Food`, `Phones`, `Laptops`, `Cars`, `Car Accessories`, `Phone Accessories`, `Fashion`, `Home Items`, `Electronics`, `Everything`).
  - `/categories/{categoryId}`: Unauthenticated guests can `get` and `list` categories; client writes are denied.
  - `/vendors/{vendorId}` & `/sellers/{sellerId}`: Unauthenticated guests can `get` and `list` public seller profiles.
  - `/listings/{listingId}` & `/wanted_items/{wantedItemId}`: Public read enabled for browsing; writes require Firebase Authentication and ownership.
- **Products Ownership (`/products/{productId}`)**:
  - `create` requires `request.auth != null` AND `request.resource.data.sellerId == request.auth.uid`.
  - `update` and `delete` strictly require `request.auth != null` AND `existing.sellerId == request.auth.uid`. No user can modify or delete another seller's product.
- **Orders Isolation (`/orders/{orderId}`)**:
  - `create` requires `request.auth != null` AND `userId == request.auth.uid` AND `buyerId == request.auth.uid`. Guest buyers must log in (Email, Phone OTP, or Google) before placing an order.
  - `get` & `list` require `request.auth != null` AND (`userId == request.auth.uid || buyerId == request.auth.uid || request.auth.uid in sellerIds || sellerId == request.auth.uid || vendorId == request.auth.uid`). Buyers only see their own orders; sellers only see orders containing their own products.
  - `update` is restricted to status transitions by the buyer or involved seller; `delete` is denied (`false`).
- **Private User Profiles (`/users/{userId}`)**:
  - `get`, `create`, `update`, `delete` strictly scoped to `request.auth.uid == userId`; `list` is denied to prevent PII enumeration.
- **Admin & Database Lockdown**:
  - `/admin/**`, `/admins/**`, `/admin_logs/**`, `/system/**` deny all client reads and writes (`if false`).
  - Root catch-all `/{document=**}` denies all unexpected operations (`allow read, write: if false`).

## 2. Adversarial Payloads Tested ("Dirty Dozen")
1. Unauthenticated `create` on `/products/{id}` -> `PERMISSION_DENIED`.
2. Authenticated `create` on `/products/{id}` spoofing another `sellerId != request.auth.uid` -> `PERMISSION_DENIED`.
3. Authenticated `update` or `delete` on another seller's `/products/{id}` -> `PERMISSION_DENIED`.
4. Unauthenticated `create` on `/orders/{id}` as guest -> `PERMISSION_DENIED`.
5. Authenticated `list` on `/orders` without buyer/seller filter (`collection(db, 'orders')`) -> `PERMISSION_DENIED`.
6. Authenticated `get` on another buyer's/seller's `/orders/{id}` -> `PERMISSION_DENIED`.
7. Any read or write on `/admins/{id}`, `/admin/{id}`, `/system/{id}` -> `PERMISSION_DENIED`.
8. Unauthenticated or cross-user `get` or `list` on `/users/{userId}` -> `PERMISSION_DENIED`.
9. Document ID poisoning (`../evil` or >128 chars) -> `PERMISSION_DENIED`.
10. Shadow field injection on `/products/{id}` or `/orders/{id}` -> `PERMISSION_DENIED` (`hasOnly` check).
11. Order tampering (`update` modifying `total` or `items`) -> `PERMISSION_DENIED`.
12. Negative price (`price: -50`) or negative stock (`stock: -1`) or oversized strings -> `PERMISSION_DENIED`.
