# Scripts

This directory contains development, deployment, and utility scripts.

## Purpose

- Database seeding scripts
- Migration scripts
- Setup and initialization scripts
- Development utilities
- Deployment helpers

## Examples

- `seedDatabase.js` - Populate database with initial/test data
- `migrate.js` - Run database migrations
- `setup.js` - Initial project setup
- `generateMockData.js` - Generate test data
- `resetDatabase.js` - Reset database to clean state
- `backup.js` - Backup scripts

## Running Scripts

Add scripts to `package.json`:

```json
{
  "scripts": {
    "seed": "node scripts/seedDatabase.js",
    "migrate": "node scripts/migrate.js",
    "setup": "node scripts/setup.js"
  }
}
```

Then run with:
```bash
npm run seed
npm run migrate
npm run setup
```

## When to use

- When you need utility scripts that aren't part of the main application
- When automating development and deployment tasks
- When creating one-off scripts for data manipulation

