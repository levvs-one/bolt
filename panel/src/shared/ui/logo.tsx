import { Box, BoxProps, ElementProps } from '@mantine/core'

interface LogoProps
    extends ElementProps<'svg', keyof BoxProps>, Omit<BoxProps, 'children' | 'ref'> {
    size?: number | string
}

const BOLT_GLYPH_PATH =
    'M760 154L1080 154L900 520L1060 520Q1110 520 1080 551L540 1076L220 1076L400 710L240 710Q190 710 220 679Z'

export function Logo({ size, style, ...props }: LogoProps) {
    return (
        <Box
            component="svg"
            fill="none"
            style={{ width: size, height: size, ...style }}
            viewBox="190 154 920 922"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d={BOLT_GLYPH_PATH} fill="currentColor" />
        </Box>
    )
}
