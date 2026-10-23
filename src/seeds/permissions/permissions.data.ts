import type { Permission } from "../../permissions/permission.entity.js";
import { Role } from "../../users/role.enum.js";

const ALL = [Role.SUPER_ADMIN, Role.ADMIN, Role.USER];
const ADMINS = [Role.SUPER_ADMIN, Role.ADMIN];
const SUPER = [Role.SUPER_ADMIN];

type PermissionSeed = Pick<
    Permission,
    | "value"
    | "name"
    | "description"
    | "isHidden"
    | "riskLevel"
    | "isAdminDefault"
    | "accessibleRoles"
>;

export const permissions: PermissionSeed[] = [
    {
        value: "items.sell",
        name: "Sell items",
        description: "ပစ္စည်းရောင်းချခြင်း",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "items.view_stocks",
        name: "View stock items",
        description: "စာရင်းရှိပစ္စည်းများကြည့်ရှုနိုင်ခြင်း",
        isHidden: true,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "items.view_solds",
        name: "View sold items",
        description: "ရောင်းပြီးပစ္စည်းများကြည့်ရှုနိုင်ခြင်း (ရောင်းချမှုအချက်အလက်များမပါဝင်ပါ)",
        isHidden: true,
        riskLevel: 2,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "items.view_sale_details",
        name: "View sale details of sold items",
        description: "ရောင်းပြီးပစ္စည်းများကြည့်ရှုနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "items.create",
        name: "Add new item",
        description: "ပစ္စည်းစာရင်းအသစ်ထည့်ခြင်း",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "items.manage",
        name: "Manage items",
        description: "ပစ္စည်းစာရင်းများ ပြင်ခြင်း၊ ဖျက်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "debts.view",
        name: "View debts",
        description: "အကြွေးစာရင်းများကြည့်ရှုနိုင်ခြင်း",
        isHidden: true,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "debts.create",
        name: "Add new debt",
        description: "အကြွေးစာရင်းသစ်ထည့်ခြင်း",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "debts.accept",
        name: "Accept debt payments",
        description: "အကြွေးဆပ်ငွေလက်ခံထားနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "debts.manage",
        name: "Manage debts",
        description: "အကြွေးစာရင်းများ ပြင်ခြင်း၊ ဖျက်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "collaterals.view",
        name: "View collaterals",
        description: "အပေါင်ပစ္စည်းများအားကြည့်ရှုနိုင်ခြင်း",
        isHidden: true,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "collaterals.accept_interest",
        name: "Accept interest payments",
        description: "အပေါင်အတိုးဆပ်ငွေလက်ခံခြင်း",
        isHidden: false,
        riskLevel: 1,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "collaterals.create",
        name: "Add new collateral",
        description: "အပေါင်ပစ္စည်းအသစ်လက်ခံနိုင်ခြင်း (အပေါင်ပေးခြင်း)",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        accessibleRoles: ALL
    },
    {
        value: "collaterals.manage",
        name: "Manage collaterals",
        description: "အပေါင်ပစ္စည်းစာရင်းများ ပြင်ခြင်း၊ ဖျက်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "trader_weights.view",
        name: "View trader weights",
        description: "ကုန်သည်အလျော့များကြည့်ရှုနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },
    {
        value: "trader_weights.manage",
        name: "Manage trader weights",
        description: "ကုန်သည်အလျော့များထည့်ခြင်း၊ ပြင်ခြင်း၊ ဖျက်ခြင်း",
        isHidden: false,
        riskLevel: 2,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "settings.update_pricings",
        name: "Update selling gold prices and tax",
        description: "ရွှေစျေးပြောင်းနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },
    {
        value: "settings.manage",
        name: "Manage system settings",
        description: "ပစ္စည်းအမျိုးအစား နှင့် ရောင်းချမှု setting များပြောင်းလဲသတ်မှတ်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "reports.view_sales",
        name: "View Sales Reports",
        description: "နှစ်စဉ်၊ လစဉ် အရောင်းစာရင်းချုပ်များကြည့်ရှုနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },
    {
        value: "reports.view_networth",
        name: "View Net Worth Reports",
        description: "စုစုပေါင်းတန်ဖိုးစာရင်းများကြည့်ရှုနိုင်ခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "finance.resolve_cash_settlements",
        name: "Resolve Cash Settlements",
        description:
            "ဝန်ထမ်းများထံမှ ရောင်းရငွေ၊ အကြွေးဆပ်ငွေ၊ အပေါင်အတိုးဆပ်ငွေများ လက်ခံရယူခြင်း",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: false,
        accessibleRoles: ADMINS
    },

    {
        value: "users.view",
        name: "View Users",
        description: "ဝန်ထမ်းအကောင့်များကြည့်ရှုနိုင်ခြင်း",
        isHidden: true,
        riskLevel: 3,
        isAdminDefault: true,
        accessibleRoles: ADMINS
    },
    {
        value: "users.manage",
        name: "Manage Users",
        description:
            "ဝန်ထမ်းအကောင့်များစီမံခန့်ခွဲခြင်း (အသစ်ထည့်ခြင်း၊ ပြင်ဆင်ခြင်း၊ ရပ်ဆိုင်းခြင်း၊)",
        isHidden: false,
        riskLevel: 3,
        isAdminDefault: true,
        accessibleRoles: ADMINS
    },
    {
        value: "users.manage_roles",
        name: "Manage User Roles",
        description:
            "ဝန်ထမ်းအကောင့်အဆင့် တိုးမြှင့်ခြင်း၊ လျှော့ချခြင်း နှင့် ပြောင်းလဲသတ်မှတ်ခြင်း",
        isHidden: true,
        riskLevel: 3,
        isAdminDefault: true,
        accessibleRoles: SUPER
    }
];

const SALES_VIEW = ["items.view_stocks", "items.view_solds", "items.view_sale_details"];

export const dependencies: Record<string, string[]> = {
    "items.sell": ["items.view_stocks"],
    "items.view_sale_details": ["items.view_solds"],
    "items.create": ["items.view_stocks", "items.view_solds"],
    "items.manage": ["items.view_stocks", "items.view_solds"],

    "debts.create": ["debts.view"],
    "debts.accept": ["debts.view"],
    "debts.manage": ["debts.view"],

    "collaterals.accept_interest": ["collaterals.view"],
    "collaterals.create": ["collaterals.view"],
    "collaterals.manage": ["collaterals.view"],

    "trader_weights.manage": ["trader_weights.view", "items.view_stocks", "items.view_solds"],

    "settings.update_pricings": ["items.view_stocks"],

    "reports.view_sales": SALES_VIEW,
    "reports.view_networth": SALES_VIEW,

    "finance.resolve_cash_settlements": SALES_VIEW,

    "users.manage": ["users.view"],
    "users.manage_roles": ["users.view"]
};
