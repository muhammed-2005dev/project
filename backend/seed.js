const { seedDatabase } = require('./scripts/seedDatabase');

// Run database seeding
seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  });
