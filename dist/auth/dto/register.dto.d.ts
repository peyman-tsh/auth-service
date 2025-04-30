export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}
