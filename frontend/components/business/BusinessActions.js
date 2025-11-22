import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius } from '../../styles/theme'

export default function BusinessActions({ isOwner, business, onManageBookings, onEditBusiness, onRequestService }) {
    if (isOwner) {
        return (
            <View>
                <Text style={styles.sectionTitle}>Gestión del negocio</Text>
                <Text style={styles.description}>
                    Configura la disponibilidad y gestiona las reservas de tu negocio.
                </Text>
                
                <Pressable
                    style={[styles.button, styles.manageButton]}
                    onPress={onManageBookings}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#fff"
                        style={styles.icon}
                    />
                    <Text style={styles.buttonText}>Ver Solicitudes</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.editButton]}
                    onPress={onEditBusiness}
                >
                    <Ionicons
                        name="create-outline"
                        size={20}
                        color="#fff"
                        style={styles.icon}
                    />
                    <Text style={styles.buttonText}>Editar Negocio</Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View>
            <Text style={styles.sectionTitle}>Reservar servicio</Text>
            <Text style={styles.description}>
                ¿Te interesa este negocio? Reserva una fecha y horario para recibir el servicio.
            </Text>
            
            <Pressable
                style={[styles.button, styles.bookButton]}
                onPress={onRequestService}
            >
                <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#fff"
                    style={styles.icon}
                />
                <Text style={styles.buttonText}>Reservar servicio</Text>
            </Pressable>
        </View>
    )
}

BusinessActions.propTypes = {
    isOwner: PropTypes.bool.isRequired,
    business: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string,
    }),
    onManageBookings: PropTypes.func,
    onEditBusiness: PropTypes.func,
    onRequestService: PropTypes.func,
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    description: {
        color: '#666',
        marginBottom: spacing.md,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    manageButton: {
        backgroundColor: '#FF6B6B',
    },
    editButton: {
        backgroundColor: '#666',
        marginTop: spacing.md,
    },
    bookButton: {
        backgroundColor: '#4CAF50',
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
