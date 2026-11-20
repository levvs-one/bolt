import type { editor } from 'monaco-editor'

import { ActionIcon, Button, Group, Menu } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { GetSubscriptionTemplateCommand } from '@remnawave/backend-contract'
import { encode } from '@stablelib/base64'
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCheckSquareOffset, PiFloppyDisk } from 'react-icons/pi'
import {
    TbClipboardCopy,
    TbClipboardText,
    TbCut,
    TbDownload,
    TbMenuDeep,
    TbSelectAll
} from 'react-icons/tb'

import { queryClient } from '@shared/api'
import { QueryKeys, useUpdateSubscriptionTemplate } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { useDownloadTemplate } from '@shared/ui/load-templates/use-download-template'

interface Props {
    editorRef: RefObject<editor.IStandaloneCodeEditor | null>
    editorType: 'json' | 'yaml'
    template: GetSubscriptionTemplateCommand.Response['response']
}

export function TemplateEditorActionsFeature(props: Props) {
    const { editorRef, editorType, template } = props
    const { t } = useTranslation()

    const isMobile = useIsMobile()
    const clipboard = useClipboard({ timeout: 500 })

    const { mutate: updateConfig, isPending: isUpdating } = useUpdateSubscriptionTemplate({
        mutationFns: {
            onSuccess: (data) => {
                queryClient.setQueryData(
                    QueryKeys.subscriptionTemplate.getSubscriptionTemplate({ uuid: template.uuid })
                        .queryKey,
                    data
                )
            }
        }
    })

    const { openDownloadModal } = useDownloadTemplate({
        editorType: 'SUBSCRIPTION',
        templateType: template.templateType,
        editorRef
    })

    const handleSave = () => {
        if (!editorRef.current) return
        if (typeof editorRef.current !== 'object') return
        if (!('getValue' in editorRef.current)) return
        if (typeof editorRef.current.getValue !== 'function') return

        const currentValue = editorRef.current.getValue()

        if (currentValue && currentValue.trim()) {
            if (editorType === 'yaml') {
                updateConfig({
                    variables: {
                        uuid: template.uuid,
                        encodedTemplateYaml: encode(new TextEncoder().encode(currentValue))
                    }
                })
            }

            if (editorType === 'json') {
                try {
                    updateConfig({
                        variables: { uuid: template.uuid, templateJson: JSON.parse(currentValue) }
                    })
                } catch (error) {
                    notifications.show({
                        color: 'red',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        title: t('common.message.error')
                    })
                }
            }
        }
    }

    const handleCopyConfig = () => {
        if (!editorRef.current) return

        const currentValue = editorRef.current.getValue()
        clipboard.copy(currentValue)
    }

    const formatDocument = () => {
        if (!editorRef.current) return

        editorRef.current.getAction('editor.action.formatDocument')?.run()
    }

    const handleSelectAll = () => {
        if (!editorRef.current) return

        const model = editorRef.current.getModel()
        if (!model) return

        editorRef.current.setSelection({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount())
        })
    }

    const handleCut = () => {
        if (!editorRef.current) return

        const selection = editorRef.current.getSelection()
        const model = editorRef.current.getModel()
        if (!selection || !model) return

        const selectedText = model.getValueInRange(selection)
        clipboard.copy(selectedText)

        editorRef.current.executeEdits('', [{ range: selection, text: '' }])
    }

    const handlePaste = () => {
        if (!editorRef.current) return

        const position = editorRef.current.getPosition()
        if (!position) return

        navigator.clipboard.readText().then((text) => {
            if (!editorRef.current) return
            editorRef.current.executeEdits('', [
                {
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                    },
                    text
                }
            ])
        })
    }

    return (
        <Group grow={isMobile} preventGrowOverflow={false} wrap="wrap">
            <Button
                color="teal"
                leftSection={<PiFloppyDisk size={16} />}
                loading={isUpdating}
                onClick={handleSave}
                variant="soft"
            >
                {t('common.action.save')}
            </Button>

            <Group gap={8} wrap="nowrap">
                <Menu shadow="md" trigger="click-hover" withinPortal>
                    <Menu.Target>
                        <ActionIcon size={36}>
                            <TbMenuDeep size={20} strokeWidth={1.75} />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            color={clipboard.copied ? 'teal' : undefined}
                            leftSection={<TbClipboardCopy size={14} />}
                            onClick={handleCopyConfig}
                        >
                            {t('config-editor-actions.feature.copy-all-content')}
                        </Menu.Item>

                        <Menu.Item
                            leftSection={<TbSelectAll size={14} />}
                            onClick={handleSelectAll}
                        >
                            {t('common.action.select-all')}
                        </Menu.Item>

                        <Menu.Item leftSection={<TbCut size={14} />} onClick={handleCut}>
                            {t('config-editor-actions.feature.cut-selection')}
                        </Menu.Item>

                        <Menu.Item
                            leftSection={<TbClipboardText size={14} />}
                            onClick={handlePaste}
                        >
                            {t('config-editor-actions.feature.paste-from-clipboard')}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                            leftSection={<TbDownload size={14} />}
                            onClick={openDownloadModal}
                        >
                            {t('common.action.load-from-github')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                <Button
                    leftSection={<PiCheckSquareOffset size={16} />}
                    onClick={formatDocument}
                    variant="default"
                >
                    {t('config-editor-actions.feature.format')}
                </Button>
            </Group>
        </Group>
    )
}
