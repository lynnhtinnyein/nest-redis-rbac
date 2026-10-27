import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "PERMISSIONS";

export type PermissionMode = "single" | "some" | "every";

export interface PermissionMetadata {
    mode: PermissionMode;
    permissions: string[];
}

export const RequirePermission = (permission: string) =>
    SetMetadata<string, PermissionMetadata>(PERMISSIONS_KEY, {
        mode: "single",
        permissions: [permission]
    });

export const RequireSomePermission = (permissions: string[]) =>
    SetMetadata<string, PermissionMetadata>(PERMISSIONS_KEY, {
        mode: "some",
        permissions
    });

export const RequireEveryPermission = (permissions: string[]) =>
    SetMetadata<string, PermissionMetadata>(PERMISSIONS_KEY, {
        mode: "every",
        permissions
    });
