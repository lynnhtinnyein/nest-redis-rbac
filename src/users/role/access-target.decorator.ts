import { SetMetadata } from "@nestjs/common";

export const ACCESS_TARGET_KEY = "ACCESS_TARGET";
export const AccessTarget = (param: string) => SetMetadata(ACCESS_TARGET_KEY, param);