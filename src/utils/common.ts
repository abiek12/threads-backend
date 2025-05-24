import { UserRoles } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { prisma } from "../lib/db";
import { WinstonLogger } from "./logger";
dotenv.config();

export const createAdminUser = async () => {
    const logger = new WinstonLogger();
    try {
        const adminEmil = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmil || !adminPassword) {
            logger.error("Admin email or password is not set in environment variables.");
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmil }
        })

        if (existingUser) {
            logger.warn("Admin user already exists.");
            return;
        }
        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        await prisma.user.create({
            data: {
                email: adminEmil,
                password: hashedPassword,
                role: UserRoles.admin,
                firstName: "Admin",
            }
        })

        logger.info("Admin user created successfully.");
    } catch (error) {
        logger.error("Error creating admin user:", error);
        throw error;
    }
}
