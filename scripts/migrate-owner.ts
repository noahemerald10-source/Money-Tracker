/**
 * One-time migration: reassign orphaned records to the owner account.
 *
 * Records saved before per-user separation was enforced may have
 * userId = "anonymous" or "seed-user-id". This script updates them
 * all to your real Clerk userId — preserving all data.
 *
 * Usage:
 *   OWNER_USER_ID=user_xxxxxxxxxxxx npx tsx scripts/migrate-owner.ts
 *
 * To find your Clerk userId:
 *   → Clerk Dashboard → Users → click your account → copy User ID
 *   → Or sign in to the app and check the server logs (userId is printed
 *     to console in dev mode if you add a temporary console.log)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IDS = ["anonymous", "seed-user-id", ""];

async function main() {
  const ownerId = process.env.OWNER_USER_ID;

  if (!ownerId) {
    console.error("❌  OWNER_USER_ID environment variable is required.");
    console.error(
      "    Usage: OWNER_USER_ID=user_xxxx npx tsx scripts/migrate-owner.ts"
    );
    process.exit(1);
  }

  console.log(`\n🔄  Migrating orphaned records → ${ownerId}\n`);

  const [txns, goals, reviews] = await Promise.all([
    prisma.transaction.updateMany({
      where: { userId: { in: PLACEHOLDER_IDS } },
      data: { userId: ownerId },
    }),
    prisma.savingsGoal.updateMany({
      where: { userId: { in: PLACEHOLDER_IDS } },
      data: { userId: ownerId },
    }),
    prisma.weeklyReview.updateMany({
      where: { userId: { in: PLACEHOLDER_IDS } },
      data: { userId: ownerId },
    }),
  ]);

  console.log("✅  Migration complete:");
  console.log(`    Transactions  → ${txns.count} updated`);
  console.log(`    Goals         → ${goals.count} updated`);
  console.log(`    Weekly reviews→ ${reviews.count} updated`);
  console.log("\n    Your data is now scoped to your account only.\n");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
