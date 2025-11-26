import React from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius, spacing, typography } from '../../styles/theme'


export default function SearchBar({
  placeholder = 'Buscar negocios o servicios...',
  value,
  onChangeText,
  onPress,
  editable = true,
  showClearButton = false,
  onClear,
  ...props
}) {
  const handlePress = () => {
    if (onPress && !editable) {
      onPress()
    }
  }

  const Content = (
    <>
      <Ionicons name="search-outline" size={20} color={colors.black} style={styles.icon} />
      {editable ? (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel="Campo de búsqueda"
          accessibilityHint="Ingresa el nombre de un negocio o servicio"
          {...props}
        />
      ) : (
        <Text
          style={[styles.input, { color: value ? colors.text : colors.textLight }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      )}
      {showClearButton && value && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          accessibilityHint="Borra el texto ingresado"
        >
          <Ionicons name="close-circle" size={20} color={colors.textLight} />
        </Pressable>
      )}
    </>
  )

  if (onPress && !editable) {
    return (
      <Pressable
        style={styles.container}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Buscar negocios"
        accessibilityHint="Abre la pantalla de búsqueda"
      >
        {Content}
      </Pressable>
    )
  }

  return <View style={styles.container}>{Content}</View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
})
