import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native'
import DateP from 'react-native-modal-datetime-picker'
import React, { useState } from 'react'

interface DatePickerProps {
    date: Date
    setDate: (date: string) => void
    style?: StyleProp<TextStyle>
}

export const DatePicker = ({ date, setDate, style }: DatePickerProps) => {

    const [show, setShow] = useState(false)

    return (
        <>
            <TouchableOpacity onPress={() => setShow(true)}>
                <Text style={[style, styles.textDate, styles.text, ]}>
                    {new Date(date).toLocaleDateString()}
                </Text>
            </TouchableOpacity>
            <DateP
                date={date ? new Date(date) : new Date()}
                isVisible={show}
                onConfirm={(newDate) => {
                    setShow(false)
                    setDate(newDate.toISOString())
                }}
                onCancel={() => setShow(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 20
    },
    textDate: {
        textDecorationLine: 'underline'
    },
})