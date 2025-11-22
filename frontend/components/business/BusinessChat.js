import React from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function BusinessChat({ message, onMessageChange, onSend, disabled }) {
    const isEmpty = message.trim() === ''

    return (
        <View>
            <Text style={styles.sectionTitle}>¿Tienes preguntas?</Text>
            <TextInput
                style={styles.input}
                placeholder="Hola. ¿Sigue estando disponible?"
                value={message}
                onChangeText={onMessageChange}
            />

            <Pressable
                style={[
                    styles.button,
                    { opacity: isEmpty || disabled ? 0.5 : 1 }
                ]}
                onPress={isEmpty || disabled ? null : onSend}
                disabled={isEmpty || disabled}
            >
                <Ionicons
                    name={isEmpty ? 'chatbubble-outline' : 'send'}
                    size={20}
                    color="#fff"
                    style={styles.icon}
                />
                <Text style={styles.buttonText}>
                    {isEmpty ? 'Escribe un mensaje' : 'Enviar mensaje'}
                </Text>
            </Pressable>
        </View>
    )
}

BusinessChat.propTypes = {
    message: PropTypes.string.isRequired,
    onMessageChange: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 16,
        marginBottom: spacing.md,
        minHeight: 50,
    },
    button: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    icon: {
        marginRight: spacing.sm,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
})
