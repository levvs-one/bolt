import { Box, BoxProps, ElementProps } from '@mantine/core'

interface BoltLogoProps
    extends ElementProps<'svg', keyof BoxProps>, Omit<BoxProps, 'children' | 'ref'> {
    size?: number | string
}

const BOLT_GLYPH_PATH =
    'M340 154L810 154Q845 154 870 179L1000 309Q1060 369 1000 429L900 529Q890 539 900 549L1075 724Q1135 784 1075 844L870 1049Q845 1076 810 1076L180 1076ZM505 344L720 344Q740 344 754 358L774 378Q784 388 774 398L660 512Q650 520 636 520L455 520ZM425 710L740 710Q760 710 774 724L810 760Q830 780 810 800L740 870Q726 886 706 886L365 886Z'

export function BoltLogo({ size = 28, style, ...props }: BoltLogoProps) {
    return (
        <Box
            component="svg"
            fill="none"
            style={{ width: size, height: size, ...style }}
            viewBox="180 154 940 922"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d={BOLT_GLYPH_PATH} fill="currentColor" fillRule="evenodd" />
        </Box>
    )
}
