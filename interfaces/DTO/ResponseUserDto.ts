import type { IUser } from "../IUser";

export interface ResponseUserDto {
    user: Omit<IUser, 'password'>;
    token: string;
}