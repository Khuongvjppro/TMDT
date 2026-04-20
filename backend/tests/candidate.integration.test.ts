/// <reference types="jest" />

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

type LoginResult = {
  token: string;
  user: {
    id: number;
    role: string;
  };
};

describe("Candidate module integration", () => {
  let candidateToken = "";
  let candidateId = 0;
  let employerToken = "";
  let employerId = 0;
  let originalDefaultCvId: number | null = null;
  const createdCvIds: number[] = [];
  const createdApplicationIds: number[] = [];
  const createdJobIds: number[] = [];
  const createdReviewIds: number[] = [];
  const createdEmployerIds: number[] = [];

  async function login(email: string, password: string) {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    return response.body as LoginResult;
  }

  async function listMyCvs() {
    const response = await request(app)
      .get("/api/candidate/cvs")
      .set("Authorization", `Bearer ${candidateToken}`);
    expect(response.status).toBe(200);
    return response.body.items as Array<{
      id: number;
      title: string;
      isDefault: boolean;
    }>;
  }

  async function createTestApplication(status: "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED") {
    const ts = Date.now();
    const job = await prisma.job.create({
      data: {
        title: `Withdraw Test Job ${status} ${ts}`,
        companyName: "Withdraw Test Co",
        location: "Ho Chi Minh City",
        description: "Job for testing withdraw application rules.",
        requirements: "Basic testing requirements.",
        type: "FULL_TIME",
        employerId,
      },
      select: { id: true },
    });

    createdJobIds.push(job.id);

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: job.id,
        status,
        coverLetter: "Test withdraw flow",
      },
      select: { id: true },
    });

    createdApplicationIds.push(application.id);
    return application.id;
  }

  async function createReviewableJobForEmployer(targetEmployerId: number) {
    const ts = Date.now();
    const job = await prisma.job.create({
      data: {
        title: `Review Test Job ${ts}`,
        companyName: "Review Test Co",
        location: "Ho Chi Minh City",
        description: "Job for testing review flow.",
        requirements: "Basic review test requirements.",
        type: "FULL_TIME",
        employerId: targetEmployerId,
      },
      select: { id: true },
    });

    createdJobIds.push(job.id);

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: job.id,
        status: "PENDING",
        coverLetter: "Test review flow",
      },
      select: { id: true },
    });

    createdApplicationIds.push(application.id);

    return {
      jobId: job.id,
      applicationId: application.id,
    };
  }

  beforeAll(async () => {
    const candidate = await login("candidate@demo.com", "123456");
    candidateToken = candidate.token;
    candidateId = candidate.user.id;

    const employer = await login("employer@demo.com", "123456");
    employerToken = employer.token;
    employerId = employer.user.id;

    const defaultCv = await (prisma as any).candidateCv.findFirst({
      where: {
        candidateId,
        isDefault: true,
      },
      select: { id: true },
    });

    originalDefaultCvId = defaultCv?.id ?? null;

    await (prisma as any).companyReview.deleteMany({
      where: {
        candidateId,
        employerId,
      },
    });
  });

  afterAll(async () => {
    if (createdReviewIds.length > 0) {
      await (prisma as any).companyReview.deleteMany({
        where: {
          id: { in: createdReviewIds },
          candidateId,
        },
      });
    }

    if (createdApplicationIds.length > 0) {
      await prisma.application.deleteMany({
        where: {
          id: { in: createdApplicationIds },
          candidateId,
        },
      });
    }

    if (createdJobIds.length > 0) {
      await prisma.job.deleteMany({
        where: {
          id: { in: createdJobIds },
        },
      });
    }

    if (createdEmployerIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: createdEmployerIds },
          role: "EMPLOYER",
        },
      });
    }

    if (createdCvIds.length > 0) {
      await (prisma as any).candidateCv.deleteMany({
        where: {
          id: { in: createdCvIds },
          candidateId,
        },
      });
    }

    if (originalDefaultCvId) {
      const existing = await (prisma as any).candidateCv.findUnique({
        where: { id: originalDefaultCvId },
        select: { id: true },
      });

      if (existing) {
        await prisma.$transaction(async (tx) => {
          const txCandidateCv = (tx as any).candidateCv;
          await txCandidateCv.updateMany({
            where: { candidateId },
            data: { isDefault: false },
          });
          await txCandidateCv.update({
            where: { id: originalDefaultCvId },
            data: { isDefault: true },
          });
        });
      }
    }

    await prisma.$disconnect();
  });

  it("returns 401 when no token is provided", async () => {
    const response = await request(app).get("/api/candidate/profile");
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-candidate role", async () => {
    const response = await request(app)
      .get("/api/candidate/profile")
      .set("Authorization", `Bearer ${employerToken}`);

    expect(response.status).toBe(403);
  });

  it("rejects invalid profile payload", async () => {
    const response = await request(app)
      .patch("/api/candidate/profile")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({ cvLink: "not-a-valid-url" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid payload");
  });

  it("updates candidate profile successfully", async () => {
    const response = await request(app)
      .patch("/api/candidate/profile")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        fullName: "Demo Candidate",
        phone: "0900000001",
        bio: "Integration test profile update",
        cvLink: "https://example.com/cv/integration",
      });

    expect(response.status).toBe(200);
    expect(response.body.item.fullName).toBe("Demo Candidate");
    expect(response.body.item.cvLink).toBe("https://example.com/cv/integration");
  });

  it("rejects invalid CV create payload", async () => {
    const response = await request(app)
      .post("/api/candidate/cvs")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        title: "Invalid CV",
        cvUrl: "not-url",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid payload");
  });

  it("supports create, set default, and delete CV flow", async () => {
    const ts = Date.now();

    const createA = await request(app)
      .post("/api/candidate/cvs")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        title: `Test CV A ${ts}`,
        cvUrl: "https://example.com/cv/test-a",
        summary: "CV A",
        isDefault: false,
      });

    expect(createA.status).toBe(201);
    createdCvIds.push(createA.body.item.id);

    const createB = await request(app)
      .post("/api/candidate/cvs")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        title: `Test CV B ${ts}`,
        cvUrl: "https://example.com/cv/test-b",
        summary: "CV B",
        isDefault: true,
      });

    expect(createB.status).toBe(201);
    createdCvIds.push(createB.body.item.id);

    let cvs = await listMyCvs();
    let defaultCvs = cvs.filter((item) => item.isDefault);
    expect(defaultCvs).toHaveLength(1);
    expect(defaultCvs[0].id).toBe(createB.body.item.id);

    const setDefaultA = await request(app)
      .patch(`/api/candidate/cvs/${createA.body.item.id}/default`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(setDefaultA.status).toBe(200);

    cvs = await listMyCvs();
    defaultCvs = cvs.filter((item) => item.isDefault);
    expect(defaultCvs).toHaveLength(1);
    expect(defaultCvs[0].id).toBe(createA.body.item.id);

    const deleteDefaultA = await request(app)
      .delete(`/api/candidate/cvs/${createA.body.item.id}`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(deleteDefaultA.status).toBe(204);

    const indexA = createdCvIds.indexOf(createA.body.item.id);
    if (indexA >= 0) {
      createdCvIds.splice(indexA, 1);
    }

    cvs = await listMyCvs();
    defaultCvs = cvs.filter((item) => item.isDefault);
    expect(defaultCvs).toHaveLength(1);
  });

  it("allows withdrawing pending application", async () => {
    const applicationId = await createTestApplication("PENDING");

    const response = await request(app)
      .delete(`/api/applications/${applicationId}/withdraw`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(response.status).toBe(204);

    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true },
    });

    expect(existing).toBeNull();
  });

  it("rejects withdrawing accepted application", async () => {
    const applicationId = await createTestApplication("ACCEPTED");

    const response = await request(app)
      .delete(`/api/applications/${applicationId}/withdraw`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "Only PENDING or REVIEWING applications can be withdrawn",
    );
  });

  it("supports create, update, and delete job review", async () => {
    const { jobId } = await createReviewableJobForEmployer(employerId);

    const createResponse = await request(app)
      .post(`/api/reviews/jobs/${jobId}`)
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        rating: 5,
        comment: "Great interview process and clear communication.",
      });

    expect(createResponse.status).toBe(201);
    const reviewId = createResponse.body.item.id as number;
    createdReviewIds.push(reviewId);

    const updateResponse = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        rating: 4,
        comment: "Positive process overall with useful feedback.",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.item.rating).toBe(4);

    const myReviewResponse = await request(app)
      .get(`/api/reviews/jobs/${jobId}/my-review`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(myReviewResponse.status).toBe(200);
    expect(myReviewResponse.body.item.rating).toBe(4);

    const deleteResponse = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(deleteResponse.status).toBe(204);

    const index = createdReviewIds.indexOf(reviewId);
    if (index >= 0) {
      createdReviewIds.splice(index, 1);
    }
  });

  it("rejects review when candidate has not applied to the job", async () => {
    const ts = Date.now();
    const employerNoApplication = await prisma.user.create({
      data: {
        fullName: `No Application Employer ${ts}`,
        email: `no-application-${ts}@demo.com`,
        passwordHash: "demo-hash",
        role: "EMPLOYER",
      },
      select: { id: true },
    });
    createdEmployerIds.push(employerNoApplication.id);

    const jobWithoutApplication = await prisma.job.create({
      data: {
        title: `No Application Job ${ts}`,
        companyName: "No Application Co",
        location: "Da Nang",
        description: "Should reject review when no application exists.",
        requirements: "No specific requirements.",
        type: "FULL_TIME",
        employerId: employerNoApplication.id,
      },
      select: { id: true },
    });
    createdJobIds.push(jobWithoutApplication.id);

    const createResponse = await request(app)
      .post(`/api/reviews/jobs/${jobWithoutApplication.id}`)
      .set("Authorization", `Bearer ${candidateToken}`)
      .send({
        rating: 5,
        comment: "Should be rejected because candidate never applied this job.",
      });

    expect(createResponse.status).toBe(403);
    expect(createResponse.body.message).toBe(
      "You can only review jobs you have applied to",
    );
  });
});
