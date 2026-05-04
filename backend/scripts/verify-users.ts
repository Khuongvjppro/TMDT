import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const emails = args.filter((arg) => !arg.startsWith("--"));
  return { isAll, emails };
}

async function main() {
  const { isAll, emails } = parseArgs();
  const now = new Date();

  if (!isAll && emails.length === 0) {
    throw new Error(
      "Provide --all or a list of emails. Example: ts-node scripts/verify-users.ts user@demo.com",
    );
  }

  const result = await prisma.user.updateMany({
    where: isAll
      ? { emailVerifiedAt: null }
      : {
          email: { in: emails },
        },
    data: { emailVerifiedAt: now },
  });

  console.log(
    JSON.stringify(
      {
        updated: result.count,
        mode: isAll ? "all" : "emails",
        emails: isAll ? undefined : emails,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
