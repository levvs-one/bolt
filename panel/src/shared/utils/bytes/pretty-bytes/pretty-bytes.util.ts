/* eslint-disable no-param-reassign */
import xbytes from 'xbytes'

export function prettifyBytesUtil(
    bytesInput: null | number | string | undefined,
    returnZero: true
): string
export function prettifyBytesUtil(
    bytesInput: null | number | string | undefined,
    returnZero?: false
): string | undefined
export function prettifyBytesUtil(
    bytesInput: null | number | string | undefined,
    returnZero: boolean = false
): string | undefined {
    if (!bytesInput) {
        return returnZero ? '0' : undefined
    }
    if (typeof bytesInput === 'string') {
        bytesInput = Number(bytesInput)
    }

    return xbytes(bytesInput, { iec: true })
}

export function prettySiBytesUtil(
    bytesInput: number | string | undefined,
    returnZero: boolean = false
): string | undefined {
    if (!bytesInput) {
        return returnZero ? '0 B' : undefined
    }
    if (typeof bytesInput === 'string') {
        bytesInput = Number(bytesInput)
    }

    return xbytes(bytesInput, { iec: false })
}

export function prettySiRealtimeBytesUtil(
    bytesInput: number | string | undefined,
    returnZero: boolean = false,
    withSeconds: boolean = false
): string | undefined {
    if (!bytesInput) {
        return returnZero ? '0 B/s' : undefined
    }
    if (typeof bytesInput === 'string') {
        bytesInput = Number(bytesInput)
    }

    const res = xbytes(bytesInput, { iec: false, bits: true })

    return `${res}${withSeconds ? '/s' : ''}`
}

const COMPACT_FRACTION_DIGITS = 1

// «70 GiB» вместо «70.00 GiB»: в списках важна читаемость, а не сотые доли.
export function compactBytesUtil(bytesInput: null | number | undefined): string {
    if (!bytesInput) return '0 B'

    return xbytes(bytesInput, { iec: true, fixed: COMPACT_FRACTION_DIGITS }).replace(/\.0(?= )/, '')
}
