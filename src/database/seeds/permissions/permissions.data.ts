import type { Permission } from "../../../permissions/permission.entity.js";
import { Role } from "../../../users/role/role.enum.js";

const ALL = [Role.SUPER_ADMIN, Role.ADMIN, Role.USER];
const ADMINS = [Role.SUPER_ADMIN, Role.ADMIN];

type PermissionSeed = Pick<
    Permission,
    | "value"
    | "name"
    | "description"
    | "isHidden"
    | "riskLevel"
    | "isAdminDefault"
    | "assignableRoles"
>;

export const permissions: PermissionSeed[] = [
    {
        value: "menu.view",
        name: "View menu",
        description: "View restaurant menu items",
        isHidden: true,
        riskLevel: 1,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "menu.create",
        name: "Add menu items",
        description: "Add new items to the restaurant menu",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "menu.manage",
        name: "Manage menu",
        description: "Edit and remove menu items",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        assignableRoles: ADMINS
    },
    {
        value: "orders.view",
        name: "View orders",
        description: "View customer orders",
        isHidden: true,
        riskLevel: 1,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "orders.create",
        name: "Create orders",
        description: "Create new customer orders",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "orders.cancel",
        name: "Cancel orders",
        description: "Cancel existing customer orders",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        assignableRoles: ADMINS
    },
    {
        value: "payments.view",
        name: "View payments",
        description: "View payment records",
        isHidden: true,
        riskLevel: 2,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "payments.process",
        name: "Process payments",
        description: "Accept and record customer payments",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        assignableRoles: ALL
    },
    {
        value: "payments.refund",
        name: "Refund payments",
        description: "Process refunds for customer payments",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        assignableRoles: ADMINS
    },
    {
        value: "inventory.manage",
        name: "Manage inventory",
        description: "Manage ingredients and stock quantities",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        assignableRoles: ADMINS
    },
    {
        value: "reports.view_sales",
        name: "View sales reports",
        description: "View daily and monthly sales reports",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        assignableRoles: ADMINS
    },
    {
        value: "users.view",
        name: "View users",
        description: "View restaurant staff accounts",
        isHidden: true,
        riskLevel: 3,
        isAdminDefault: true,
        assignableRoles: ADMINS
    },
    {
        value: "users.manage",
        name: "Manage users",
        description: "Create, edit, and suspend staff accounts",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: true,
        assignableRoles: ADMINS
    }
];

export const dependencies: Record<string, string[]> = {
    "menu.create": ["menu.view"],
    "menu.manage": ["menu.view"],
    "orders.create": ["menu.view", "orders.view"],
    "orders.cancel": ["orders.view"],
    "payments.process": ["orders.view", "payments.view"],
    "payments.refund": ["payments.view"],
    "reports.view_sales": ["orders.view", "payments.view"],
    "users.manage": ["users.view"]
};
