-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "allergens" TEXT;
ALTER TABLE "order_items" ADD COLUMN "customizations" TEXT;
ALTER TABLE "order_items" ADD COLUMN "preparationTime" INTEGER;

-- CreateTable
CREATE TABLE "kitchen_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedChef" TEXT,
    "tableNumber" INTEGER,
    "notes" TEXT,
    "estimatedTime" INTEGER,
    "startedAt" DATETIME,
    "readyAt" DATETIME,
    "servedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "kitchen_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kitchen_ticket_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitchenTicketId" TEXT NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "preparationTime" INTEGER,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kitchen_ticket_items_kitchenTicketId_fkey" FOREIGN KEY ("kitchenTicketId") REFERENCES "kitchen_tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "kitchen_ticket_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "name" TEXT,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INDOOR',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "qrCode" TEXT,
    "description" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "reservationDate" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "partySize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reservations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#1890ff',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "supplierName" TEXT,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "location" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "inventory_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL,
    "totalPrice" REAL,
    "reference" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "previousStock" INTEGER NOT NULL DEFAULT 0,
    "newStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_menu_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "discountPrice" REAL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "allergens" TEXT NOT NULL DEFAULT '[]',
    "preparationTime" INTEGER NOT NULL,
    "calories" INTEGER,
    "nutritionInfo" JSONB,
    "customizations" TEXT NOT NULL DEFAULT '[]',
    "availableHours" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "department" TEXT NOT NULL DEFAULT 'KITCHEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_menu_items" ("allergens", "availableHours", "calories", "categoryId", "createdAt", "customizations", "description", "discountPrice", "id", "images", "ingredients", "isAvailable", "isSpecial", "name", "nameAr", "nameEn", "nutritionInfo", "preparationTime", "price", "priority", "rating", "reviewCount", "soldCount", "tags", "updatedAt") SELECT "allergens", "availableHours", "calories", "categoryId", "createdAt", "customizations", "description", "discountPrice", "id", "images", "ingredients", "isAvailable", "isSpecial", "name", "nameAr", "nameEn", "nutritionInfo", "preparationTime", "price", "priority", "rating", "reviewCount", "soldCount", "tags", "updatedAt" FROM "menu_items";
DROP TABLE "menu_items";
ALTER TABLE "new_menu_items" RENAME TO "menu_items";
CREATE INDEX "menu_items_categoryId_idx" ON "menu_items"("categoryId");
CREATE INDEX "menu_items_isAvailable_idx" ON "menu_items"("isAvailable");
CREATE INDEX "menu_items_isSpecial_idx" ON "menu_items"("isSpecial");
CREATE INDEX "menu_items_priority_idx" ON "menu_items"("priority");
CREATE INDEX "menu_items_department_idx" ON "menu_items"("department");
CREATE TABLE "new_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "customerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'DINE_IN',
    "totalAmount" REAL NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "tableNumber" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "estimatedTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_orders" ("createdAt", "customerAddress", "customerId", "customerName", "customerPhone", "id", "notes", "orderNumber", "paymentMethod", "status", "totalAmount", "updatedAt") SELECT "createdAt", "customerAddress", "customerId", "customerName", "customerPhone", "id", "notes", "orderNumber", "paymentMethod", "status", "totalAmount", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_type_idx" ON "orders"("type");
CREATE INDEX "orders_tableNumber_idx" ON "orders"("tableNumber");
CREATE INDEX "orders_priority_idx" ON "orders"("priority");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_tickets_ticketNumber_key" ON "kitchen_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "kitchen_tickets_department_idx" ON "kitchen_tickets"("department");

-- CreateIndex
CREATE INDEX "kitchen_tickets_status_idx" ON "kitchen_tickets"("status");

-- CreateIndex
CREATE INDEX "kitchen_tickets_priority_idx" ON "kitchen_tickets"("priority");

-- CreateIndex
CREATE INDEX "kitchen_tickets_assignedChef_idx" ON "kitchen_tickets"("assignedChef");

-- CreateIndex
CREATE INDEX "kitchen_tickets_createdAt_idx" ON "kitchen_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "kitchen_ticket_items_kitchenTicketId_idx" ON "kitchen_ticket_items"("kitchenTicketId");

-- CreateIndex
CREATE INDEX "kitchen_ticket_items_orderItemId_idx" ON "kitchen_ticket_items"("orderItemId");

-- CreateIndex
CREATE INDEX "kitchen_ticket_items_status_idx" ON "kitchen_ticket_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tables_number_key" ON "tables"("number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_categories_name_key" ON "inventory_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_menuItemId_idx" ON "order_items"("menuItemId");
