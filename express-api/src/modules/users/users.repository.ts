import { prisma } from "../../config/prisma.js";

export class UsersRepository {

    async createUser(
        name: string,
        email: string
    ) {
        return prisma.user.create({
            data: {
                name,
                email,
            },
        });
    }

    async findUserById(id: string) {
        return prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async findAllUsers(
        skip: number,
        limit: number
    ) {
        return prisma.user.findMany({
            skip,
            take: limit,

            orderBy: {
                created_at: "desc",
            },
        });
    }

    async countUsers() {
        return prisma.user.count();
    }

    async updateUser(
        id: string,
        name: string
    ) {
        return prisma.user.update({
            where: {
                id,
            },

            data: {
                name,
            },
        });
    }

    async deleteUser(id: string) {
        return prisma.user.delete({
            where: {
                id,
            },
        });
    }
}

export const usersRepository = new UsersRepository();

