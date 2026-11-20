import { ActionIcon } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'

interface AddButtonProps {
    onClick: () => void
}

export function AddButton(props: AddButtonProps) {
    const { onClick } = props

    return (
        <ActionIcon onClick={onClick} size={32}>
            <TbPlus size={18} strokeWidth={1.75} />
        </ActionIcon>
    )
}
