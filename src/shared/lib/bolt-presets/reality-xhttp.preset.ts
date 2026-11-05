// Пресет «как SUMI»: главный вход VLESS Reality (TCP, Vision), второй вход XHTTP поверх Reality
// и скрытый XHTTP без TLS только на localhost, куда главный вход отдаёт fallback.

export interface IRealityXhttpPresetParams {
    hiddenXhttpPort: number
    // Теги входов уникальны во всей панели, поэтому у каждого применения пресета свой суффикс.
    tagSuffix: string
    privateKey: string
    realityPort: number
    serverName: string
    shortIds: string[]
    xhttpPath: string
    xhttpPort: number
}

export function realityXhttpTags(suffix: string) {
    return {
        reality: `BOLT_REALITY_${suffix}`,
        xhttp: `BOLT_XHTTP_${suffix}`,
        hiddenXhttp: `BOLT_XHTTP_HIDDEN_${suffix}`
    }
}

export const REALITY_XHTTP_DEFAULTS = {
    realityPort: 443,
    xhttpPort: 8443,
    hiddenXhttpPort: 3443
} as const

const TLS_PORT = 443
const LOOPBACK = '127.0.0.1'
const XHTTP_PATH_BYTES = 6
const TAG_SUFFIX_BYTES = 2

function randomHex(length: number) {
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function generateXhttpPath() {
    return `/${randomHex(XHTTP_PATH_BYTES)}`
}

export function generateTagSuffix() {
    return randomHex(TAG_SUFFIX_BYTES).toUpperCase()
}

function realitySettings(params: IRealityXhttpPresetParams) {
    return {
        show: false,
        target: `${params.serverName}:${TLS_PORT}`,
        xver: 0,
        serverNames: [params.serverName],
        privateKey: params.privateKey,
        shortIds: params.shortIds
    }
}

export function buildRealityXhttpConfig(params: IRealityXhttpPresetParams) {
    const tags = realityXhttpTags(params.tagSuffix)

    return {
        log: { loglevel: 'warning' },
        inbounds: [
            {
                tag: tags.reality,
                listen: '0.0.0.0',
                port: params.realityPort,
                protocol: 'vless',
                settings: {
                    clients: [],
                    decryption: 'none',
                    fallbacks: [{ dest: params.hiddenXhttpPort, xver: 0 }]
                },
                streamSettings: {
                    network: 'raw',
                    security: 'reality',
                    realitySettings: realitySettings(params)
                },
                sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] }
            },
            {
                tag: tags.xhttp,
                listen: '0.0.0.0',
                port: params.xhttpPort,
                protocol: 'vless',
                settings: { clients: [], decryption: 'none' },
                streamSettings: {
                    network: 'xhttp',
                    xhttpSettings: { path: params.xhttpPath, mode: 'auto' },
                    security: 'reality',
                    realitySettings: realitySettings(params)
                },
                sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] }
            },
            {
                tag: tags.hiddenXhttp,
                listen: LOOPBACK,
                port: params.hiddenXhttpPort,
                protocol: 'vless',
                settings: { clients: [], decryption: 'none' },
                streamSettings: {
                    network: 'xhttp',
                    xhttpSettings: { path: params.xhttpPath, mode: 'auto' },
                    security: 'none'
                },
                sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] }
            }
        ],
        outbounds: [
            { tag: 'DIRECT', protocol: 'freedom' },
            { tag: 'BLOCK', protocol: 'blackhole' }
        ],
        routing: {
            rules: [
                { ip: ['geoip:private'], outboundTag: 'BLOCK' },
                { protocol: ['bittorrent'], outboundTag: 'BLOCK' }
            ]
        }
    }
}
