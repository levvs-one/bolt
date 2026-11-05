import { Input, InputBase, InputWrapper, PasswordInput, Select, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'

import classes from './inputs.module.css'

export default {
    // Пояснения под каждым полем в Bolt не показываются: подпись поля говорит сама за себя.
    InputWrapper: InputWrapper.extend({
        classNames: classes
    }),
    Input: Input.extend({
        classNames: { input: classes.input }
    }),
    InputBase: InputBase.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    PasswordInput: PasswordInput.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    TextInput: TextInput.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    Select: Select.extend({
        defaultProps: {
            radius: 'md'
        }
    }),
    DateTimePicker: DateTimePicker.extend({
        defaultProps: {
            radius: 'md'
        }
    })
}
