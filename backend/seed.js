const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');

const seedData = async () => {
  try {
    const fresh = process.argv.includes('--fresh');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const userCount = await User.countDocuments();
    if (!fresh && userCount > 0) {
      console.log('\n--- Seed skipped: database already has data ---');
      console.log('Your menu, staff, orders, and bills are kept safe.');
      console.log('To wipe and reload demo data only, run: npm run seed:fresh');
      process.exit(0);
    }

    if (fresh) {
      console.log('Fresh seed: clearing users, menu, categories, tables (orders & bills kept)...');
      await User.deleteMany({});
      await Category.deleteMany({});
      await MenuItem.deleteMany({});
      await Table.deleteMany({});
    } else {
      console.log('First-time seed: loading demo data...');
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@restaurant.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);

    // Create sample staff
    await User.create([
      { name: 'John Waiter', email: 'waiter@restaurant.com', phone: '9876543211', password: 'waiter123', role: 'waiter' },
      { name: 'Sarah Kitchen', email: 'kitchen@restaurant.com', phone: '9876543212', password: 'kitchen123', role: 'kitchen' },
      { name: 'Mike Cashier', email: 'cashier@restaurant.com', phone: '9876543213', password: 'cashier123', role: 'cashier' }
    ]);
    console.log('Staff created');

    // Create categories
    const categories = await Category.create([
      { name: 'Appetizers' },
      { name: 'Main Course' },
      { name: 'Desserts' },
      { name: 'Beverages' },
      { name: 'Soups' },
      { name: 'Salads' },
      { name: 'Breads' },
      { name: 'Rice & Biryani' }
    ]);
    console.log('Categories created');

    const catMap = {};
    categories.forEach(c => catMap[c.name] = c._id);

    // Create menu items
    await MenuItem.create([
      // Appetizers
      { name: 'Paneer Tikka', price: 280, category: catMap['Appetizers'], description: 'Grilled cottage cheese marinated in spices and yogurt', isAvailable: true },
      { name: 'Chicken Seekh Kebab', price: 320, category: catMap['Appetizers'], description: 'Minced chicken kebabs grilled on skewers', isAvailable: true },
      { name: 'Samosa (2 pcs)', price: 120, category: catMap['Appetizers'], description: 'Crispy pastry filled with spiced potatoes and peas', isAvailable: true },
      { name: 'Spring Rolls (4 pcs)', price: 180, category: catMap['Appetizers'], description: 'Crispy rolls stuffed with vegetables', isAvailable: true },
      { name: 'Fish Fingers', price: 350, category: catMap['Appetizers'], description: 'Golden fried fish strips with tartar sauce', isAvailable: true },
      { name: 'Mushroom Manchurian', price: 240, category: catMap['Appetizers'], description: 'Indo-Chinese style crispy mushroom in tangy sauce', isAvailable: true },

      // Main Course
      { name: 'Butter Chicken', price: 380, category: catMap['Main Course'], description: 'Tender chicken in rich tomato-butter gravy', isAvailable: true },
      { name: 'Paneer Butter Masala', price: 320, category: catMap['Main Course'], description: 'Cottage cheese cubes in creamy tomato sauce', isAvailable: true },
      { name: 'Dal Makhani', price: 260, category: catMap['Main Course'], description: 'Slow-cooked black lentils in buttery gravy', isAvailable: true },
      { name: 'Chicken Biryani', price: 350, category: catMap['Rice & Biryani'], description: 'Fragrant basmati rice layered with spiced chicken', isAvailable: true },
      { name: 'Veg Biryani', price: 280, category: catMap['Rice & Biryani'], description: 'Aromatic rice with mixed vegetables and spices', isAvailable: true },
      { name: 'Mutton Rogan Josh', price: 450, category: catMap['Main Course'], description: 'Kashmiri-style mutton in aromatic red gravy', isAvailable: true },
      { name: 'Palak Paneer', price: 290, category: catMap['Main Course'], description: 'Cottage cheese in creamy spinach gravy', isAvailable: true },
      { name: 'Chole Bhature', price: 220, category: catMap['Main Course'], description: 'Spiced chickpea curry served with fried bread', isAvailable: true },
      { name: 'Fish Curry', price: 380, category: catMap['Main Course'], description: 'Fresh fish cooked in tangy coconut curry', isAvailable: true },
      { name: 'Chicken Tikka Masala', price: 360, category: catMap['Main Course'], description: 'Grilled chicken tikka in spiced creamy gravy', isAvailable: true },

      // Breads
      { name: 'Butter Naan', price: 60, category: catMap['Breads'], description: 'Soft leavened bread brushed with butter', isAvailable: true },
      { name: 'Garlic Naan', price: 70, category: catMap['Breads'], description: 'Naan bread topped with garlic and herbs', isAvailable: true },
      { name: 'Tandoori Roti', price: 40, category: catMap['Breads'], description: 'Whole wheat bread baked in tandoor', isAvailable: true },
      { name: 'Laccha Paratha', price: 70, category: catMap['Breads'], description: 'Layered flaky whole wheat bread', isAvailable: true },
      { name: 'Cheese Naan', price: 90, category: catMap['Breads'], description: 'Naan stuffed with melted cheese', isAvailable: true },

      // Rice
      { name: 'Steamed Rice', price: 120, category: catMap['Rice & Biryani'], description: 'Plain steamed basmati rice', isAvailable: true },
      { name: 'Jeera Rice', price: 150, category: catMap['Rice & Biryani'], description: 'Cumin-tempered aromatic basmati rice', isAvailable: true },

      // Soups
      { name: 'Tomato Soup', price: 150, category: catMap['Soups'], description: 'Classic creamy tomato soup with croutons', isAvailable: true },
      { name: 'Hot & Sour Soup', price: 170, category: catMap['Soups'], description: 'Spicy and tangy Indo-Chinese style soup', isAvailable: true },
      { name: 'Cream of Mushroom', price: 180, category: catMap['Soups'], description: 'Rich and velvety mushroom soup', isAvailable: true },
      { name: 'Chicken Sweet Corn', price: 190, category: catMap['Soups'], description: 'Hearty chicken soup with sweet corn kernels', isAvailable: true },

      // Salads
      { name: 'Greek Salad', price: 220, category: catMap['Salads'], description: 'Fresh vegetables with feta cheese and olives', isAvailable: true },
      { name: 'Caesar Salad', price: 250, category: catMap['Salads'], description: 'Romaine lettuce with caesar dressing and croutons', isAvailable: true },
      { name: 'Garden Fresh Salad', price: 180, category: catMap['Salads'], description: 'Mixed fresh seasonal vegetables', isAvailable: true },

      // Desserts
      { name: 'Gulab Jamun (2 pcs)', price: 120, category: catMap['Desserts'], description: 'Deep-fried milk dumplings in sugar syrup', isAvailable: true },
      { name: 'Rasmalai (2 pcs)', price: 150, category: catMap['Desserts'], description: 'Soft cottage cheese patties in saffron milk', isAvailable: true },
      { name: 'Chocolate Brownie', price: 200, category: catMap['Desserts'], description: 'Warm chocolate brownie with vanilla ice cream', isAvailable: true },
      { name: 'Kulfi', price: 130, category: catMap['Desserts'], description: 'Traditional Indian frozen milk dessert', isAvailable: true },
      { name: 'Ice Cream Sundae', price: 180, category: catMap['Desserts'], description: 'Three scoops with toppings and wafer', isAvailable: true },

      // Beverages
      { name: 'Masala Chai', price: 60, category: catMap['Beverages'], description: 'Traditional Indian spiced tea', isAvailable: true },
      { name: 'Fresh Lime Soda', price: 90, category: catMap['Beverages'], description: 'Refreshing lemon soda - sweet or salty', isAvailable: true },
      { name: 'Mango Lassi', price: 130, category: catMap['Beverages'], description: 'Thick mango yogurt smoothie', isAvailable: true },
      { name: 'Cold Coffee', price: 150, category: catMap['Beverages'], description: 'Chilled blended coffee with ice cream', isAvailable: true },
      { name: 'Mineral Water', price: 30, category: catMap['Beverages'], description: 'Packaged drinking water 500ml', isAvailable: true },
      { name: 'Soft Drink', price: 60, category: catMap['Beverages'], description: 'Coca-Cola / Sprite / Fanta', isAvailable: true },
      { name: 'Buttermilk', price: 70, category: catMap['Beverages'], description: 'Spiced and refreshing chaas', isAvailable: true }
    ]);
    console.log('Menu items created');

    // Create tables
    await Table.create([
      { tableNumber: 1, capacity: 2, status: 'available' },
      { tableNumber: 2, capacity: 2, status: 'available' },
      { tableNumber: 3, capacity: 4, status: 'available' },
      { tableNumber: 4, capacity: 4, status: 'available' },
      { tableNumber: 5, capacity: 4, status: 'available' },
      { tableNumber: 6, capacity: 6, status: 'available' },
      { tableNumber: 7, capacity: 6, status: 'available' },
      { tableNumber: 8, capacity: 8, status: 'available' },
      { tableNumber: 9, capacity: 8, status: 'available' },
      { tableNumber: 10, capacity: 10, status: 'available' }
    ]);
    console.log('Tables created');

    console.log('\n--- Seed completed successfully ---');
    console.log('Admin login: admin@restaurant.com / admin123');
    console.log('Waiter login: waiter@restaurant.com / waiter123');
    console.log('Kitchen login: kitchen@restaurant.com / kitchen123');
    console.log('Cashier login: cashier@restaurant.com / cashier123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
