#!/bin/bash

# Create the database
createdb shamiri_journal

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init 