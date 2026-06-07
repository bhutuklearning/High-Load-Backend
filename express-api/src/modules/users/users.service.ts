import { db } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import { v4 as uuidv4 } from "uuid";

export interface User {
    id: string;
    name: string;
    email: string;
    created_at?: Date;
}

export class UsersService {
    async createUser(name: string, email: string): Promise<User> {
        const id = uuidv4();
        const result = await db.query<User>(
            "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *",
            [id, name, email]
        );
        const user = result.rows[0];

        // Cache in Redis for 1 hour
        await redis.set(`user:${id}`, JSON.stringify(user), "EX", 3600);

        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        // Try Cache first
        const cachedUser = await redis.get(`user:${id}`);
        if (cachedUser) {
            return JSON.parse(cachedUser) as User;
        }

        // Query Database
        const result = await db.query<User>(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];

        // Store back in Redis Cache for 1 hour
        await redis.set(`user:${id}`, JSON.stringify(user), "EX", 3600);

        return user;
    }
}

export const usersService = new UsersService();
