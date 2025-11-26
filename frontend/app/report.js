import React, { use } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { globalStyles, colors } from '../styles/theme'
import Screen from '../components/screen'
import DropDownPicker from 'react-native-dropdown-picker'
import { useSearchParams } from 'expo-router/build/hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getBusiness } from '../api/business-service'
import LoadingSpinner from '../components/loading-spinner'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/auth-context'
import { createReport } from '../api/report-service'
import logger from '../utils/logger'

export default function ReportScreen() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(null)
    const [text, setText] = React.useState('')
    const params = useSearchParams()
    const [business, setBusiness] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [submitting, setSubmitting] = React.useState(false)
    const [items, setItems] = React.useState([
        { label: 'Problema con el servicio', value: 'service_issue' },
        { label: 'Bug en la app', value: 'bug' },
        { label: 'Sugerencia', value: 'suggestion' },
        { label: 'Otro', value: 'other' },
    ])

    const bookingId = params?.get('bookingId') || null
    const businessId = params?.get('businessId') || null
    const businessName = params?.get('businessName') || ''
    const serviceDescription = params?.get('serviceDescription') || ''

    const { user } = useAuth()

    React.useEffect(() => {
        const fetchBusinessData = async () => {
            if (!businessId) {
                setLoading(false)
                return
            }

            try {
                const businessData = await getBusiness(businessId)
                setBusiness(businessData)
            } catch (error) {
                logger.error('❌ Error obteniendo negocio:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBusinessData()
    }, [businessId])

    React.useEffect(() => {
        if (user) {
            logger.log('🧾 Usuario cargado para reporte:', user)
        }
    }, [user])

    if (loading) {
        return (
            <Screen>
                <LoadingSpinner />
            </Screen>
        )
    }

    return (
        <Screen>
            <View>
                {business && (
                    <View style={styles.businessInfo}>
                        <Text style={styles.infoLabel}>Negocio:</Text>
                        <Text style={styles.businessName}>
                            {business.name || businessName}
                        </Text>
                        {business.category && (
                            <Text style={styles.businessCategory}>
                                📍 {business.category}
                            </Text>
                        )}
                    </View>
                )}

                {serviceDescription && (
                    <View style={styles.serviceInfo}>
                        <Text style={styles.infoLabel}>Servicio:</Text>
                        <Text style={styles.serviceText}>
                            {serviceDescription}
                        </Text>
                    </View>
                )}

                {bookingId && (
                    <View style={styles.bookingInfo}>
                        <Ionicons
                            name="information-circle"
                            size={20}
                            color="#6A4C93"
                        />
                        <Text style={styles.bookingText}>
                            Reporte relacionado con tu reserva
                        </Text>
                    </View>
                )}

                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Selecciona el tipo de reporte"
                    containerStyle={{ marginTop: 16, marginBottom: 16 }}
                    style={{ borderColor: '#6A4C93' }}
                    dropDownContainerStyle={{ borderColor: '#6A4C93' }}
                />

                <View>
                    <Text style={globalStyles.label}>
                        Detalle del reporte *
                    </Text>
                    <Text style={styles.helperText}>
                        Describe el problema o sugerencia lo más detallado
                        posible
                    </Text>
                </View>

                <TextInput
                    style={[styles.input, { height: 150 }]}
                    value={text}
                    onChangeText={setText}
                    multiline
                    numberOfLines={6}
                    placeholder="Ejemplo: El servicio no se completó según lo acordado..."
                />
                <Pressable
                    style={[
                        styles.button,
                        {
                            backgroundColor:
                                text.length && value && !submitting
                                    ? colors.primary
                                    : colors.gray,
                        },
                    ]}
                    disabled={!text.length || !value || submitting}
                    onPress={async () => {
                        try {
                            setSubmitting(true)

                            if (!user?.id && !user?._id) {
                                alert(
                                    '❌ Error: No se pudo identificar al usuario'
                                )
                                return
                            }

                            const reportData = {
                                bookingId: bookingId || 'N/A',
                                businessId: businessId || 'N/A',
                                businessName:
                                    business?.name ||
                                    businessName ||
                                    'Sin negocio',
                                serviceDescription:
                                    serviceDescription || 'Sin descripción',
                                type: value,
                                description: text,
                                state: 'open',
                                timestamp: new Date().toISOString(),
                                reportedBy: user?.id || user?._id,
                                reportedByName: user?.name || 'Usuario',
                                reportedByEmail: user?.email || '',
                            }

                            const result = await createReport(reportData)

                            alert('✅ Gracias por tu feedback!')
                            setText('')
                            setValue(null)
                        } catch (error) {
                            console.error('❌ Error al enviar reporte:', error)
                            console.error('❌ Detalles:', {
                                message: error.message,
                                response: error.response?.data,
                                status: error.response?.status,
                            })

                            const errorMessage =
                                error.response?.data?.detail ||
                                error.message ||
                                'No se pudo enviar el reporte'

                            alert(`❌ Error: ${errorMessage}`)
                        } finally {
                            setSubmitting(false)
                        }
                    }}
                >
                    <Text style={styles.buttonText}>
                        {submitting ? 'Enviando...' : 'Enviar Reporte'}
                    </Text>
                </Pressable>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
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
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        textAlignVertical: 'top',
    },
    businessInfo: {
        backgroundColor: '#F0E6FF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#6A4C93',
    },
    serviceInfo: {
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    bookingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    businessName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6A4C93',
        marginBottom: 4,
    },
    businessCategory: {
        fontSize: 14,
        color: '#666',
    },
    serviceText: {
        fontSize: 14,
        color: '#333',
    },
    bookingText: {
        fontSize: 13,
        color: '#6A4C93',
        marginLeft: 8,
        flex: 1,
        fontStyle: 'italic',
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
})
