import React from 'react'
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import { THEME } from '../../Default'
import { AntDesign } from '@expo/vector-icons'

interface ButtonProps {
    onPress: () => void
}

export const ButtonBack = ({ onPress } : ButtonProps) => {
  return (
    <TouchableNativeFeedback onPress={onPress}>
        <View style={style.button}>
                <AntDesign name='back' size={30} color={THEME.color.white}/>
            <Text style={style.text}></Text>
        </View>
    </TouchableNativeFeedback>
  )
}

const style = StyleSheet.create({
    button: {
        // flex: 1,
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'center',
        alignContent: 'center',
        // gap: 5,
        borderRadius: 30,
        backgroundColor: THEME.button.cancel,
        
    },
    text: {
        color: THEME.color.white,
        fontWeight: 600,
        fontSize: 17,
        textTransform:'uppercase'
        
    }
})