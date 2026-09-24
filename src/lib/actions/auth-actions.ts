"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { headers } from "next/headers";
import { authRateLimited } from "@/lib/auth-throttle";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { randomBytes } from "node:crypto";

async function registrationLimited(email: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return await authRateLimited("registration-ip", ip, 10) || await authRateLimited("registration-email", email, 5);
}

export type ActionState = { error?: string } | undefined;

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  propertyAddress: z.string().trim().min(1, "Property address is required").max(240),
  propertyCity: z.string().trim().min(1, "City is required").max(100),
  propertyState: z.string().trim().min(2, "State is required").max(50),
  propertyZip: z.string().trim().min(3, "ZIP is required").max(20),
  dateOfBirth: z.coerce.date({ message: "Date of birth is required" }),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  phone: z.string().max(50).optional(),
  homeownerAccountType: z.enum(["VERIFIED_HOMEOWNER", "SERVICE_ONLY"]).default("VERIFIED_HOMEOWNER"),
});

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    firstName: formData.get("firstName"), lastName: formData.get("lastName"),
    propertyAddress: formData.get("propertyAddress"), propertyCity: formData.get("propertyCity"), propertyState: formData.get("propertyState"), propertyZip: formData.get("propertyZip"), dateOfBirth: formData.get("dateOfBirth"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    homeownerAccountType: formData.get("homeownerAccountType") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { firstName, lastName, propertyAddress, propertyCity, propertyState, propertyZip, dateOfBirth, email, phone, homeownerAccountType } = parsed.data;
  const name = `${firstName} ${lastName}`;
  const referralCode = String(formData.get("referralCode") ?? "").trim();

  if (await registrationLimited(email)) return { error: "Too many registration attempts. Please try again in 15 minutes." };
  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(randomBytes(48).toString("hex"));
  const referralCandidate = referralCode ? await prisma.vendorReferral.findUnique({ where: { code: referralCode } }) : null;
  const referral = referralCandidate?.customerId === null ? referralCandidate : null;
  const user = await prisma.user.create({
    data: {
      name,
      firstName, lastName, propertyAddress, propertyCity, propertyState, propertyZip, dateOfBirth,
      email,
      phone,
      passwordHash,
      role: "HOMEOWNER",
      homeownerAccountType,
      passwordSetupRequired: true,
    },
  });
  if (referral) await prisma.vendorReferral.update({ where: { id: referral.id }, data: { customerId: user.id, status: "ACCEPTED", acceptedAt: new Date() } });

  redirect("/application-received");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(1, "Password is required").max(1024),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, password } = parsed.data;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await authRateLimited("login-ip", ip, 100) || await authRateLimited("login-email", email, 20)) {
    return { error: "Too many sign-in attempts. Please try again in 15 minutes." };
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (user?.passwordSetupRequired) return { error: "Your application is awaiting approval and password setup." };
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id, user.role, formData.get("next"));

  redirect("/welcome");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const vendorApplicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  phone: z.string().max(50).optional(),
  companyName: z.string().trim().min(1, "Company name is required").max(4000),
  serviceArea: z.string().trim().min(1, "Service area is required").max(4000),
  servicesOffered: z.string().trim().min(1, "Please describe the services you offer").max(4000),
});

export async function applyVendorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = vendorApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    companyName: formData.get("companyName"),
    serviceArea: formData.get("serviceArea"),
    servicesOffered: formData.get("servicesOffered"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, companyName, serviceArea, servicesOffered } = parsed.data;

  if (await registrationLimited(email)) return { error: "Too many registration attempts. Please try again in 15 minutes." };
  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(randomBytes(48).toString("hex"));
  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "VENDOR",
      passwordSetupRequired: true,
      vendorProfile: { create: { companyName, serviceArea, servicesOffered } },
    },
  });

  redirect("/application-received");
}

const financingApplicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  phone: z.string().max(50).optional(),
  companyName: z.string().trim().min(1, "Company name is required").max(4000),
  licenseInfo: z.string().trim().min(1, "License / accreditation info is required").max(4000),
});

export async function applyFinancingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = financingApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    companyName: formData.get("companyName"),
    licenseInfo: formData.get("licenseInfo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, companyName, licenseInfo } = parsed.data;

  if (await registrationLimited(email)) return { error: "Too many registration attempts. Please try again in 15 minutes." };
  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(randomBytes(48).toString("hex"));
  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "FINANCING_PARTNER",
      passwordSetupRequired: true,
      financingProfile: { create: { companyName, licenseInfo } },
    },
  });

  redirect("/application-received");
}
