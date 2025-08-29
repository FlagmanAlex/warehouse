// Компонент Field
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import React, { useState, useEffect } from 'react';
import { DatePicker } from 'src/shared/DatePicker';
import { DocStatus, DocType } from '@warehouse/interfaces';

interface FieldProps {
    label: string;
    value: string | number | Date | null | undefined;
    editable: boolean;
    onChange?: (val: string | DocType | DocStatus) => void;
    options?: { label: string; value: string }[]; // для dropdown
    type?: 'text' | 'date' | 'select' | 'readonly';
}

export const Field = ({ label, value, editable, onChange, options, type = 'text' }: FieldProps) => {
    const [text, setText] = useState<string>(
        value instanceof Date ? value.toISOString().split('T')[0] : value?.toString() || '',
    );

    useEffect(() => {
        const displayValue =
            value instanceof Date ? value.toISOString().split('T')[0] : value?.toString() || '';
        setText(displayValue);
    }, [value]);

    const handleChange = (newValue: string) => {
        setText(newValue);
        onChange?.(newValue);
    };

    
    //Если тип Дата
    if (type === 'date') {
        return (
            <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{label}:</Text>
                {editable ? (
                    <DatePicker
                        style={styles.date}
                        date={value as Date}
                        setDate={(date) => onChange?.(date)}
                    />
                ) : (
                    <Text style={styles.dateText}>{new Date(value as Date).toLocaleDateString()}</Text>
                )}
            </View>
        );
    }
    // Если не редактируемый — просто текст
    if (!editable) {
        return (
            <View style={styles.fieldRow}>
                <Text style={styles.label}>{label}:</Text>
                <Text style={styles.value} numberOfLines={1}>
                    {value?.toString() || '—'}
                </Text>
            </View>
        );
    }
    

    // Выпадающий список
    if (options) {
        return (
            <View style={styles.fieldRow}>
                <Text style={styles.label}>{label}:</Text>
                <Dropdown
                    search
                    searchPlaceholder='Поиск...'
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholder}
                    selectedTextStyle={styles.selectedText}
                    inputSearchStyle={styles.inputSearch}
                    iconStyle={styles.icon}
                    data={options}
                    labelField="label"
                    valueField="value"
                    placeholder="Выберите..."
                    value={text}
                    onChange={(item) => handleChange(item.value)}
                    
                    maxHeight={300}
                    containerStyle={styles.dropdownContainer}
                    itemContainerStyle={styles.dropdownItemContainer}
                    itemTextStyle={styles.dropdownItemText}
                />
            </View>
        );
    }

    // Обычный текстовый ввод
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                style={styles.input}
                value={text}
                onChangeText={handleChange}
                placeholder={`Введите ${label.toLowerCase()}`}
                editable={editable}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // ... остальные стили

    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    label: {
        fontWeight: '600',
        color: '#555',
        width: 90,
    },
    value: {
        flex: 1,
        color: '#333',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#fff',
    },
    dropdown: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    placeholder: {
        fontSize: 16,
        color: '#999',
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
    },
    inputSearch: {
        fontSize: 16,
    },
    icon: {
        tintColor: '#666',
    },
    dropdownContainer: {
        borderRadius: 8,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    dropdownItemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 18,
        color: '#333',
    },
    date: {
        // flex: 1,
        // alignItems: 'center',
        fontWeight: '600',
    },

});