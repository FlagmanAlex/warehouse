import type { IUser } from "../IUser.js";

export interface ResponseUserDto {
    user: Omit<IUser, 'password'>;
    token: string;
}