import React from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { globalStyles, colors } from '../styles/global'
import Screen from '../components/screen'
import DropDownPicker from 'react-native-dropdown-picker'
import { useSearchParams } from 'expo-router/build/hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ReportScreen() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(null)
    const [text, setText] = React.useState('')
    const params = useSearchParams()
    const [business, setBusiness] = React.useState(null)
    const [items, setItems] = React.useState([
        { label: 'Bug', value: 'bug' },
        { label: 'Sugerencia', value: 'suggestion' },
        { label: 'Otro', value: 'other' },
    ])

    const fetchBusinessData = async id => {
        const businessData = await AsyncStorage.getItem(`business_${id}`)
        setBusiness(businessData)
    }

    return (
        <Screen>
            <View>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Selecciona el tipo de reporte"
                    containerStyle={{ marginTop: 16, marginBottom: 16 }}
                />

                <View>
                    <Text style={globalStyles.label}>Detalle del reporte</Text>
                </View>

                <TextInput
                    style={[styles.input, { height: 150 }]}
                    value={text}
                    onChangeText={setText}
                    multiline
                    numberOfLines={6}
                    placeholder="Describe el problema o sugerencia..."
                />
                <Pressable
                    style={[
                        styles.button,
                        {
                            backgroundColor: text.length
                                ? colors.primary
                                : colors.gray,
                        },
                    ]}
                    disabled={!text.length}
                    onPress={() => {
                        alert('Gracias por tu feedback!')
                        setText('')
                        setValue(null)
                    }}
                >
                    <Text style={styles.buttonText}>Enviar Reporte</Text>
                </Pressable>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        textAlignVertical: 'top',
    },
})
