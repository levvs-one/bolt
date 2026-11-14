import { Button, Stack, Text } from '@mantine/core'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { showModal } from '@shared/_modals/show-modal'
import { useGetNode } from '@shared/api/hooks'
import { BoltGroup } from '@shared/ui/bolt-list'
import { LottieLinkShared } from '@shared/ui/lotties'
import { LottieCheckmarkShared } from '@shared/ui/lotties/checkmark'
import { LottieStopShared } from '@shared/ui/lotties/stop'

import classes from './create-node-step-3-status.module.css'

interface IProps {
    nodeUuid?: string
    onClose: () => void
}

enum STATUS {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    ERROR = 'error'
}

export const CreateNodeStep3Status = ({ nodeUuid, onClose }: IProps) => {
    const { t } = useTranslation()

    const { data: node, isLoading } = useGetNode({
        route: {
            uuid: nodeUuid ?? ''
        },
        rQueryParams: {
            enabled: !!nodeUuid,
            refetchInterval: 2_000
        }
    })

    const { status, errorMessage } = useMemo(() => {
        if (isLoading || !node) {
            return { status: STATUS.CONNECTING, errorMessage: null }
        }
        const { isConnected, isConnecting, lastStatusMessage } = node
        if (isConnected && !isConnecting) {
            return { status: STATUS.CONNECTED, errorMessage: lastStatusMessage }
        }
        if (isConnecting) {
            return { status: STATUS.CONNECTING, errorMessage: lastStatusMessage }
        }
        if (lastStatusMessage && !isConnected) {
            return { status: STATUS.ERROR, errorMessage: lastStatusMessage }
        }
        return { status: STATUS.CONNECTING, errorMessage: lastStatusMessage }
    }, [node, isLoading])

    const handleOpenNode = () => {
        if (!node) {
            return
        }

        onClose()

        setTimeout(() => {
            showModal('nodes_editNodeModal', { nodeUuid: node.uuid })
        }, 300)
    }

    const statusTitle = {
        [STATUS.CONNECTING]: t('bolt.text.node-connecting'),
        [STATUS.CONNECTED]: t('create-node-modal.widget.connection-successful'),
        [STATUS.ERROR]: t('create-node-modal.widget.connection-failed')
    }[status]

    const statusText = {
        [STATUS.CONNECTING]: t('create-node-step-3-status.establishing-mtls-connection'),
        [STATUS.CONNECTED]: t('create-node-step-3-status.xray-core-is-up-and-running'),
        [STATUS.ERROR]: t('create-node-step-3-status.remnawave-will-try-to-reconnect-shortly')
    }[status]

    return (
        <Stack gap={12} mih={400}>
            <BoltGroup className={classes.status}>
                <div className={classes.animation}>
                    {status === STATUS.CONNECTING && <LottieLinkShared />}
                    {status === STATUS.CONNECTED && <LottieCheckmarkShared />}
                    {status === STATUS.ERROR && <LottieStopShared />}
                </div>
                <Text fw={700} size="lg" ta="center">
                    {statusTitle}
                </Text>
                <Text fw={500} size="sm" ta="center">
                    {statusText}
                </Text>
            </BoltGroup>

            {errorMessage && (
                <BoltGroup className={classes.error}>
                    <Text fw={600} size="sm">
                        {t('common.message.last-error-message')}
                    </Text>
                    <Text className={classes.errorText} size="sm">
                        {errorMessage}
                    </Text>
                </BoltGroup>
            )}

            <Stack gap={8} mt="auto">
                <Button fullWidth onClick={handleOpenNode} size="lg" variant="filled">
                    {t('create-node-modal.widget.open-node')}
                </Button>
                <Button fullWidth onClick={onClose} size="lg">
                    {t('common.action.close')}
                </Button>
            </Stack>
        </Stack>
    )
}
