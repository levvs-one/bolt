import { useComputedColorScheme } from '@mantine/core'
import { githubDarkTheme, githubLightTheme } from 'json-edit-react'

// Просмотр JSON следует схеме панели: в светлой теме тёмный блок выглядит вставкой.
export function useJsonEditorTheme() {
    return useComputedColorScheme('dark') === 'light' ? githubLightTheme : githubDarkTheme
}
