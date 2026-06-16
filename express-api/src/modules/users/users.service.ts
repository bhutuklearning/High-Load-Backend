import { prisma } from "../../config/prisma.js";
import {
  getCache,
  setCache,
  deleteCache,
} from "../../config/cache.js";

import { usersRepository }
  from "./users.repository.js";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
}

export class UsersService {

  async createUser(
    name: string,
    email: string
  ): Promise<User> {

    const user =
      await usersRepository.createUser(
        name,
        email
      );

    await setCache(
      `user:${user.id}`,
      user
    );
    return user;
  }

  async getUserById(
    id: string
  ): Promise<User | null> {

    const cachedUser =
      await getCache<User>(
        `user:${id}`
      );

    if (cachedUser) {
      console.log("CACHE HIT");
      return cachedUser;
    }

    console.log("DATABASE HIT");

    const user =
      await usersRepository.findUserById(id);

    if (!user) {
      return null;
    }

    await setCache(
      `user:${user.id}`,
      user
    );

    return user;
  }

  async getAllUsers(
    page = 1,
    limit = 10
  ) {

    const skip =
      (page - 1) * limit;

    const [users, total] =
      await Promise.all([

        usersRepository.findAllUsers(
          skip,
          limit
        ),

        usersRepository.countUsers(),
      ]);

    return {
      users,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async updateUser(
    id: string,
    name: string
  ) {

    const user =
      await usersRepository.updateUser(
        id,
        name
      );

    await deleteCache(
      `user:${id}`
    );

    return user;
  }

  async deleteUser(id: string) {

    await usersRepository.deleteUser(id);

    await deleteCache(
      `user:${id}`
    );

    return {
      message:
        "User deleted successfully",
    };
  }
}

export const usersService = new UsersService();

