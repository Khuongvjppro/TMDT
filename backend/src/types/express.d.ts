import { UserRole } from "../constants/enums";

declare global {
  namespace Express {
    interface UserJwtPayload {
      userId: number;
      role: UserRole;
      email: string;
    }

    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export {};
