# Database Setup Guide for M&L-DATA-WEBSITE

This project uses **PostgreSQL** as the database and **Prisma** as the ORM. You need a PostgreSQL connection string to get started.

## Option 1: Cloud Database (Recommended for Ease)

I recommend using **Supabase** or **Neon** as they provide a free PostgreSQL database in seconds.

### Using Supabase:
1. Go to [supabase.com](https://supabase.com/) and create a free project.
2. In your project settings, go to **Database** -> **Connection string**.
3. Copy the **URI** connection string.
4. Replace the `DATABASE_URL` in your `.env` file with this string.

### Using Neon:
1. Go to [neon.tech](https://neon.tech/) and create a free project.
2. Copy the connection string provided in your dashboard.
3. Replace the `DATABASE_URL` in your `.env` file.

---

## Option 2: Local PostgreSQL (Manual Setup)

If you have PostgreSQL installed locally on your Mac:
1. Create a new database: `createdb ml_data_website`
2. Your connection string will look something like this:
   `postgresql://USER:PASSWORD@localhost:5432/ml_data_website`
3. Add it to your `.env` file.

---

## After Setting the Connection String

Once you have added the `DATABASE_URL` to your `.env` file, run the following commands in your terminal:

```bash
# Push the schema to the database
npx prisma db push

# Generate the prisma client
npx prisma generate
```

> [!IMPORTANT]
> Keep your `.env` file secret and never commit it to Git.
