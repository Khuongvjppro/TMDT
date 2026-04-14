"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const recruiterPassword = await bcryptjs_1.default.hash("123456", 10);
    const candidatePassword = await bcryptjs_1.default.hash("123456", 10);
    const recruiter = await prisma.user.upsert({
        where: { email: "recruiter@demo.com" },
        update: {},
        create: {
            fullName: "Demo Recruiter",
            email: "recruiter@demo.com",
            passwordHash: recruiterPassword,
            role: client_1.UserRole.RECRUITER
        }
    });
    await prisma.user.upsert({
        where: { email: "candidate@demo.com" },
        update: {},
        create: {
            fullName: "Demo Candidate",
            email: "candidate@demo.com",
            passwordHash: candidatePassword,
            role: client_1.UserRole.CANDIDATE
        }
    });
    const count = await prisma.job.count();
    if (count === 0) {
        await prisma.job.createMany({
            data: [
                {
                    title: "Frontend Developer (Next.js)",
                    companyName: "TechNova",
                    location: "Ho Chi Minh City",
                    salaryMin: 1200,
                    salaryMax: 2000,
                    description: "Build and maintain modern web applications with Next.js.",
                    requirements: "At least 1 year with React/Next.js.",
                    type: client_1.JobType.FULL_TIME,
                    recruiterId: recruiter.id
                },
                {
                    title: "Node.js Backend Engineer",
                    companyName: "CloudWorks",
                    location: "Ha Noi",
                    salaryMin: 1300,
                    salaryMax: 2200,
                    description: "Develop APIs and optimize database performance.",
                    requirements: "Experience with Express, MySQL, and REST APIs.",
                    type: client_1.JobType.FULL_TIME,
                    recruiterId: recruiter.id
                }
            ]
        });
    }
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
