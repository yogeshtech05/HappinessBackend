-- CreateTable
CREATE TABLE "activity_logs" (
    "id" VARCHAR(64) NOT NULL,
    "admin_id" VARCHAR(64) NOT NULL,
    "admin_name" VARCHAR(128) NOT NULL,
    "admin_email" VARCHAR(128) NOT NULL,
    "action" VARCHAR(128) NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "entity_id" VARCHAR(64),
    "details" TEXT NOT NULL,
    "ip_address" VARCHAR(64),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" VARCHAR(64) NOT NULL,
    "role_name" VARCHAR(64) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    "avatar_url" TEXT,
    "last_login_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "tagline" TEXT,
    "icon" VARCHAR(64),
    "package_count" INTEGER DEFAULT 0,
    "gradient" TEXT,
    "accent_color" VARCHAR(32),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_content" (
    "id" VARCHAR(64) NOT NULL,
    "section_key" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "metadata" TEXT,
    "updated_by" VARCHAR(128) NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(32),
    "city" VARCHAR(64),
    "occasion" VARCHAR(64),
    "message" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" VARCHAR(64) NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "description" TEXT,
    "discount_type" VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_value" DECIMAL(10,2) DEFAULT 0.00,
    "max_discount_amount" DECIMAL(10,2),
    "usage_limit" INTEGER DEFAULT 100,
    "usage_count" INTEGER DEFAULT 0,
    "start_date" VARCHAR(32) NOT NULL,
    "expiry_date" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) DEFAULT 'ACTIVE',
    "total_orders" INTEGER DEFAULT 0,
    "total_spent" DECIMAL(12,2) DEFAULT 0.00,
    "city" VARCHAR(64),
    "address" TEXT,
    "pincode" VARCHAR(16),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" VARCHAR(64) NOT NULL,
    "order_id" VARCHAR(64) NOT NULL,
    "order_number" VARCHAR(64) NOT NULL,
    "customer_name" VARCHAR(128) NOT NULL,
    "customer_phone" VARCHAR(32) NOT NULL,
    "recipient_name" VARCHAR(128) NOT NULL,
    "recipient_phone" VARCHAR(32) NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "city" VARCHAR(64) NOT NULL,
    "pincode" VARCHAR(16) NOT NULL,
    "delivery_date" VARCHAR(32) NOT NULL,
    "delivery_time_slot" VARCHAR(64) NOT NULL,
    "assigned_presenter_id" VARCHAR(64),
    "assigned_presenter_name" VARCHAR(128),
    "status" VARCHAR(32) NOT NULL DEFAULT 'UNASSIGNED',
    "notes" TEXT,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "target_audience" VARCHAR(64) DEFAULT 'ALL_CUSTOMERS',
    "recipient_id" VARCHAR(64),
    "sent_by" VARCHAR(128) NOT NULL,
    "status" VARCHAR(32) DEFAULT 'SENT',
    "sent_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(64) NOT NULL,
    "order_number" VARCHAR(64) NOT NULL,
    "customer_id" VARCHAR(64) NOT NULL,
    "customer_name" VARCHAR(128) NOT NULL,
    "customer_email" VARCHAR(128) NOT NULL,
    "customer_phone" VARCHAR(32) NOT NULL,
    "recipient_name" VARCHAR(128) NOT NULL,
    "recipient_phone" VARCHAR(32) NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "city" VARCHAR(64) NOT NULL,
    "pincode" VARCHAR(16) NOT NULL,
    "landmark" TEXT,
    "delivery_date" VARCHAR(32) NOT NULL,
    "delivery_time_slot" VARCHAR(64) NOT NULL,
    "occasion" VARCHAR(64) NOT NULL,
    "presenter_required" BOOLEAN DEFAULT true,
    "presenter_note" TEXT,
    "special_instructions" TEXT,
    "items" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "addons_total" DECIMAL(10,2) DEFAULT 0.00,
    "delivery_fee" DECIMAL(10,2) DEFAULT 0.00,
    "discount_amount" DECIMAL(10,2) DEFAULT 0.00,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
    "payment_status" VARCHAR(32) NOT NULL DEFAULT 'PAID',
    "payment_method" VARCHAR(32) DEFAULT 'Razorpay',
    "assigned_staff_id" VARCHAR(64),
    "assigned_staff_name" VARCHAR(128),
    "internal_notes" TEXT,
    "timeline" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "occasion" VARCHAR(64) NOT NULL,
    "occasion_label" VARCHAR(64) NOT NULL,
    "category" VARCHAR(128) NOT NULL,
    "tagline" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2),
    "compare_at_price" DECIMAL(10,2),
    "rating" DECIMAL(3,2) DEFAULT 5.0,
    "review_count" INTEGER DEFAULT 0,
    "popular" BOOLEAN DEFAULT false,
    "featured" BOOLEAN DEFAULT false,
    "is_featured" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "badge" VARCHAR(64),
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "inclusions" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "addons" TEXT NOT NULL,
    "duration" VARCHAR(64) DEFAULT '30-45 Mins',
    "image_theme" VARCHAR(32) DEFAULT 'rose',
    "visual_icon" VARCHAR(64) DEFAULT 'Cake',
    "image" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "sku" VARCHAR(64) NOT NULL,
    "stock_quantity" INTEGER DEFAULT 100,
    "is_available" BOOLEAN DEFAULT true,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" VARCHAR(64) NOT NULL,
    "order_id" VARCHAR(64),
    "package_id" VARCHAR(64),
    "package_name" VARCHAR(128),
    "customer_name" VARCHAR(128) NOT NULL,
    "customer_email" VARCHAR(128) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "status" VARCHAR(32) DEFAULT 'APPROVED',
    "is_featured" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN DEFAULT false,
    "permissions" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_settings" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'main',
    "business_name" VARCHAR(128) NOT NULL DEFAULT 'Happiness Deliver',
    "brand_tagline" VARCHAR(255) DEFAULT 'Premium Surprise Gifting & Doorstep Delivery',
    "helpline_phone" VARCHAR(32) DEFAULT '+91 98765 43210',
    "helpline_email" VARCHAR(128) DEFAULT 'hello@happinessdeliver.com',
    "address" TEXT DEFAULT '100 Executive Boulevard, Suite 400',
    "city" VARCHAR(64) DEFAULT 'Mumbai',
    "state" VARCHAR(64) DEFAULT 'Maharashtra',
    "pincode" VARCHAR(16) DEFAULT '400001',
    "currency_symbol" VARCHAR(8) DEFAULT '₹',
    "tax_rate_percent" DECIMAL(5,2) DEFAULT 18.00,
    "default_delivery_fee" DECIMAL(8,2) DEFAULT 0.00,
    "free_delivery_threshold" DECIMAL(10,2) DEFAULT 1000.00,
    "order_prefix" VARCHAR(16) DEFAULT 'HD-',
    "allow_same_day_booking" BOOLEAN DEFAULT true,
    "booking_cutoff_time" VARCHAR(16) DEFAULT '18:00',
    "auto_assign_presenters" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_content_section_key_key" ON "cms_content"("section_key");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
