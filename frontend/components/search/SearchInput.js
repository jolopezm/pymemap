import React from 'react'
import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function SearchInput({
    value,
    onChangeText,
    onSubmit,
    onClear,
    onClose,
    autoFocus,
    placeholder = 'Buscar negocios o servicios...',
}) {
    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color={colors.text} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    autoFocus={autoFocus}
                    keyboardAppearance="light"
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={colors.primary}
                    cursorColor={colors.primary}
                    accessibilityLabel="Campo de búsqueda"
                    accessibilityHint="Escribe para buscar negocios o servicios"
                />
                {value.length > 0 && (
                    <Pressable 
                        onPress={onClear}
                        accessibilityRole="button"
                        accessibilityLabel="Limpiar búsqueda"
                        accessibilityHint="Borra el texto de búsqueda"
                    >
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={colors.textLight}
                        />
                    </Pressable>
                )}
            </View>
            <Pressable 
                style={styles.closeButton} 
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar búsqueda"
                accessibilityHint="Vuelve a la pantalla anterior"
            >
                <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
        </View>
    )
}

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        borderRadius: borderRadius.medium,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        paddingVertical: spacing.xs,
    },
    closeButton: {
        padding: spacing.xs,
    },
})
