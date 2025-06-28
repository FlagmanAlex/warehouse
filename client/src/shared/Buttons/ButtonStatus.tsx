import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'
import { THEME } from '../../Default'

interface ButtonProps {
    name: string
    enabled: boolean
    onPress: () => void
}


export const ButtonStatus = ({ enabled, onPress, name }: ButtonProps) => {
    return (
        <TouchableNativeFeedback onPress={onPress} background={TouchableNativeFeedback.Ripple(THEME.color.white, false)}>
            <View style={[styles.button, enabled ?
                { backgroundColor: THEME.button.statusEnabled } :
                { backgroundColor: THEME.button.statusDisabled }]}
            >
                <Text style={enabled ?
                    { color: THEME.color.white } :
                    { color: THEME.color.black }}
                >
                    {name.toLocaleUpperCase()}
                </Text>
            </View>
        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({
    button: {
        // flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 5,
        justifyContent: 'center',
        borderRadius: 5
    },
})