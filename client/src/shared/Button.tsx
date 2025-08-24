import React from 'react'
import { StyleProp, StyleSheet, Text, TouchableNativeFeedback, View, ViewStyle } from 'react-native'
import { THEME } from '../Default'

interface ButtonProps {
    children: React.ReactNode
    onPress: () => void
    textColor?: string
    bgColor?: string
    style?:  ViewStyle | ViewStyle[]
}

export const Button = ({ style, children, textColor = THEME.color.black, bgColor = THEME.color.main, onPress }: ButtonProps) => {
    return (
        <TouchableNativeFeedback onPress={onPress} background={TouchableNativeFeedback.Ripple(THEME.color.white, false)} >
            <View style={[
                styles.button,
                {
                    ...style,
                    backgroundColor: bgColor,
                    borderStyle: 'solid',
                    borderColor: 'grey'
                }
            ]
            }>
                <Text style={{ ...styles.text, color: textColor }}>{children}</Text>
            </View>
        </TouchableNativeFeedback>
    )
}

const styles = StyleSheet.create({
    button: {
        // flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        borderRadius: 5,
    },
    text: {
        textTransform: 'uppercase',
        fontWeight: 800,
        textAlign: 'center'
    }
})
