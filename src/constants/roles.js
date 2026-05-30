export const ROLES = [
  { id: 'admin', label: 'Admin', icon: '👑', description: 'Manage restaurant & staff' },
  { id: 'waiter', label: 'Waiter', icon: '🍽️', description: 'Take and serve orders' },
  { id: 'kitchen', label: 'Kitchen', icon: '👨‍🍳', description: 'Prepare food orders' },
  { id: 'cashier', label: 'Cashier', icon: '💰', description: 'Billing & payments' },
];

export const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  waiter: '/waiter',
  kitchen: '/kitchen',
  cashier: '/cashier',
};
