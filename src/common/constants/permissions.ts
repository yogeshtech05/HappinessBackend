import { RoleName } from 'src/common/types/domain';

export interface Permission {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
}

export const PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: 'p-dash-view',
    code: 'dashboard.view',
    name: 'View Dashboard',
    category: 'Dashboard',
    description: 'Access main admin dashboard metrics and charts',
  },

  // Customers
  {
    id: 'p-cust-view',
    code: 'customers.view',
    name: 'View Customers',
    category: 'Customers',
    description: 'View customer profiles and order histories',
  },
  {
    id: 'p-cust-create',
    code: 'customers.create',
    name: 'Create Customer',
    category: 'Customers',
    description: 'Register new customer profiles manually',
  },
  {
    id: 'p-cust-update',
    code: 'customers.update',
    name: 'Update Customer',
    category: 'Customers',
    description: 'Modify customer details and statuses',
  },
  {
    id: 'p-cust-delete',
    code: 'customers.delete',
    name: 'Delete Customer',
    category: 'Customers',
    description: 'Remove customer records or block users',
  },

  // Packages
  {
    id: 'p-pkg-view',
    code: 'packages.view',
    name: 'View Packages',
    category: 'Packages',
    description: 'Browse surprise package listings',
  },
  {
    id: 'p-pkg-create',
    code: 'packages.create',
    name: 'Create Package',
    category: 'Packages',
    description: 'Create new surprise package offerings',
  },
  {
    id: 'p-pkg-update',
    code: 'packages.update',
    name: 'Update Package',
    category: 'Packages',
    description: 'Edit package details, prices, and addons',
  },
  {
    id: 'p-pkg-delete',
    code: 'packages.delete',
    name: 'Delete Package',
    category: 'Packages',
    description: 'Delete surprise packages',
  },
  {
    id: 'p-pkg-publish',
    code: 'packages.publish',
    name: 'Publish Package',
    category: 'Packages',
    description: 'Toggle package active and featured status',
  },

  // Products
  {
    id: 'p-prod-view',
    code: 'products.view',
    name: 'View Products & Services',
    category: 'Products',
    description: 'View inventory items, cakes, flowers, addons',
  },
  {
    id: 'p-prod-create',
    code: 'products.create',
    name: 'Create Product',
    category: 'Products',
    description: 'Add new products and service items',
  },
  {
    id: 'p-prod-update',
    code: 'products.update',
    name: 'Update Product',
    category: 'Products',
    description: 'Modify product pricing and stock status',
  },
  {
    id: 'p-prod-delete',
    code: 'products.delete',
    name: 'Delete Product',
    category: 'Products',
    description: 'Remove product listings',
  },

  // Orders
  {
    id: 'p-ord-view',
    code: 'orders.view',
    name: 'View Orders',
    category: 'Orders',
    description: 'View customer orders and details',
  },
  {
    id: 'p-ord-update',
    code: 'orders.update',
    name: 'Update Orders',
    category: 'Orders',
    description: 'Change order status and delivery details',
  },
  {
    id: 'p-ord-cancel',
    code: 'orders.cancel',
    name: 'Cancel Orders',
    category: 'Orders',
    description: 'Cancel active or pending customer orders',
  },

  // Deliveries
  {
    id: 'p-del-view',
    code: 'deliveries.view',
    name: 'View Deliveries',
    category: 'Deliveries',
    description: 'Track surprise delivery schedules',
  },
  {
    id: 'p-del-assign',
    code: 'deliveries.assign',
    name: 'Assign Presenters',
    category: 'Deliveries',
    description: 'Assign staff/presenters to surprise deliveries',
  },
  {
    id: 'p-del-update',
    code: 'deliveries.update',
    name: 'Update Delivery Status',
    category: 'Deliveries',
    description: 'Mark deliveries as out or completed',
  },

  // Coupons
  {
    id: 'p-cup-view',
    code: 'coupons.view',
    name: 'View Coupons',
    category: 'Coupons',
    description: 'View promotional coupons',
  },
  {
    id: 'p-cup-create',
    code: 'coupons.create',
    name: 'Create Coupon',
    category: 'Coupons',
    description: 'Generate new discount codes',
  },
  {
    id: 'p-cup-update',
    code: 'coupons.update',
    name: 'Update Coupon',
    category: 'Coupons',
    description: 'Modify coupon limits and expiry',
  },
  {
    id: 'p-cup-delete',
    code: 'coupons.delete',
    name: 'Delete Coupon',
    category: 'Coupons',
    description: 'Deactivate or delete coupons',
  },

  // Reviews
  {
    id: 'p-rev-view',
    code: 'reviews.view',
    name: 'View Reviews',
    category: 'Reviews',
    description: 'View customer feedback',
  },
  {
    id: 'p-rev-update',
    code: 'reviews.update',
    name: 'Moderate Reviews',
    category: 'Reviews',
    description: 'Approve or reject customer reviews',
  },
  {
    id: 'p-rev-delete',
    code: 'reviews.delete',
    name: 'Delete Reviews',
    category: 'Reviews',
    description: 'Delete invalid reviews',
  },

  // Notifications
  {
    id: 'p-notif-view',
    code: 'notifications.view',
    name: 'View Notifications',
    category: 'Notifications',
    description: 'View broadcast notification logs',
  },
  {
    id: 'p-notif-send',
    code: 'notifications.send',
    name: 'Send Notifications',
    category: 'Notifications',
    description: 'Send announcements to customers or staff',
  },

  // Reports
  {
    id: 'p-rep-view',
    code: 'reports.view',
    name: 'View Reports',
    category: 'Reports',
    description: 'Access financial and operational analytics',
  },
  {
    id: 'p-rep-export',
    code: 'reports.export',
    name: 'Export Reports',
    category: 'Reports',
    description: 'Export report datasets as CSV/Excel',
  },

  // Content (CMS)
  {
    id: 'p-cnt-view',
    code: 'content.view',
    name: 'View CMS Content',
    category: 'Content',
    description: 'View website hero and banner sections',
  },
  {
    id: 'p-cnt-update',
    code: 'content.update',
    name: 'Update Content',
    category: 'Content',
    description: 'Edit homepage banners, FAQs, hero text',
  },

  // Admin Users & Roles
  {
    id: 'p-admin-view',
    code: 'admin_users.view',
    name: 'View Admin Users',
    category: 'Admin Users',
    description: 'View team staff profiles',
  },
  {
    id: 'p-admin-create',
    code: 'admin_users.create',
    name: 'Create Admin User',
    category: 'Admin Users',
    description: 'Add new staff or manager accounts',
  },
  {
    id: 'p-admin-update',
    code: 'admin_users.update',
    name: 'Update Admin User',
    category: 'Admin Users',
    description: 'Edit admin profiles and role assignments',
  },
  {
    id: 'p-admin-delete',
    code: 'admin_users.delete',
    name: 'Delete Admin User',
    category: 'Admin Users',
    description: 'Revoke admin user access',
  },

  {
    id: 'p-roles-view',
    code: 'roles.view',
    name: 'View Roles & Permissions',
    category: 'Roles',
    description: 'View RBAC roles and permissions',
  },
  {
    id: 'p-roles-manage',
    code: 'roles.manage',
    name: 'Manage Roles',
    category: 'Roles',
    description: 'Configure role permissions matrix',
  },

  // Activity Logs
  {
    id: 'p-log-view',
    code: 'activity_logs.view',
    name: 'View Activity Logs',
    category: 'Audit Logs',
    description: 'Inspect administrative audit logs',
  },

  // Settings
  {
    id: 'p-set-view',
    code: 'settings.view',
    name: 'View Store Settings',
    category: 'Settings',
    description: 'View operational store configuration',
  },
  {
    id: 'p-set-update',
    code: 'settings.update',
    name: 'Update Settings',
    category: 'Settings',
    description: 'Edit business details, tax rates, delivery fees',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  'Super Admin': PERMISSIONS.map((p) => p.code),
  Admin: PERMISSIONS.filter(
    (p) => !p.code.startsWith('roles.') && p.code !== 'admin_users.delete',
  ).map((p) => p.code),
  Manager: [
    'dashboard.view',
    'customers.view',
    'customers.update',
    'packages.view',
    'packages.update',
    'packages.publish',
    'products.view',
    'products.update',
    'orders.view',
    'orders.update',
    'deliveries.view',
    'deliveries.assign',
    'deliveries.update',
    'coupons.view',
    'reviews.view',
    'reviews.update',
    'notifications.view',
    'reports.view',
    'reports.export',
    'content.view',
    'activity_logs.view',
    'settings.view',
  ],
  Staff: [
    'dashboard.view',
    'orders.view',
    'orders.update',
    'deliveries.view',
    'deliveries.update',
    'customers.view',
    'packages.view',
    'products.view',
  ],
};
