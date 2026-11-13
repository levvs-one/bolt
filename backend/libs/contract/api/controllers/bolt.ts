export const BOLT_CONTROLLER = 'bolt' as const;

export const BOLT_ROUTES = {
    GENERATE_REALITY_KEYS: 'reality-keys',
    SUMI_RPC: 'sumi/rpc',
    SUMI_SETTINGS: 'sumi/settings',
    SUMI_USER: (userId: string) => `sumi/users/${userId}`,
    SUMI_AUTO_SELECTION: 'sumi/auto-selection',
} as const;
