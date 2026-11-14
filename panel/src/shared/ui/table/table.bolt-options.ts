// Общие настройки таблиц Bolt. Без меню колонок, переключателя плотности и полноэкранного режима.
// На телефоне фильтры открываются из шапки колонки, а не строкой полей, ширина колонок не тянется,
// пагинация — только стрелки и счётчик.
export function getBoltTableOptions(isMobile: boolean) {
    return {
        columnFilterDisplayMode: isMobile ? ('popover' as const) : ('subheader' as const),
        enableColumnActions: false,
        enableColumnResizing: !isMobile,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableTopToolbar: !isMobile,
        mantinePaginationProps: { showRowsPerPage: !isMobile }
    }
}
