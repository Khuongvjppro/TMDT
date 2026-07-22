import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const sourcePath = "C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\6f9c99ee-ecc0-4fb1-a4c3-6b06870dba1d\\media__1784716560786.png";
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const destPath = path.join(uploadsDir, "cv_phan_van_phat.png");

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Copy the image file
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Successfully copied image from ${sourcePath} to ${destPath}`);
  } else {
    console.error(`Source file does not exist at: ${sourcePath}`);
    return;
  }

  // Find candidate by email
  const candidateEmail = "candidate@demo.com";
  const user = await prisma.user.findUnique({
    where: { email: candidateEmail },
    include: { candidateProfile: true }
  });

  if (!user) {
    console.error(`Candidate user not found with email: ${candidateEmail}`);
    return;
  }

  const fileUrl = "http://localhost:4000/uploads/cv_phan_van_phat.png";

  // Update candidate profile cvLink
  await prisma.candidateProfile.update({
    where: { userId: user.id },
    data: {
      cvLink: fileUrl
    }
  });
  console.log(`Updated CandidateProfile cvLink for user ${user.fullName}`);

  // Update all job applications of this candidate
  const updateAppsResult = await prisma.application.updateMany({
    where: { candidateId: user.id },
    data: {
      cvLink: fileUrl
    }
  });
  console.log(`Updated ${updateAppsResult.count} Application record(s) cvLink to ${fileUrl}`);

  // Update or create CandidateCv records
  const existingCvs = await prisma.candidateCv.findMany({
    where: { userId: user.id }
  });

  if (existingCvs.length > 0) {
    // Update the first one to be primary and point to the new file
    await prisma.candidateCv.update({
      where: { id: existingCvs[0].id },
      data: {
        title: "CV Phan Van Phat",
        fileUrl: fileUrl,
        isPrimary: true
      }
    });
    console.log(`Updated existing CandidateCv record ID ${existingCvs[0].id}`);
  } else {
    // Create a new CandidateCv record
    await prisma.candidateCv.create({
      data: {
        userId: user.id,
        title: "CV Phan Van Phat",
        fileUrl: fileUrl,
        isPrimary: true
      }
    });
    console.log("Created a new CandidateCv record");
  }

  console.log("Successfully completed database updates!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
