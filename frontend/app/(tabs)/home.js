import { View, Text, Pressable, StyleSheet } from 'react-native'
import globalStyles from '../../styles/global'
import Screen from '../../components/screen'
import { useAuth } from '../../context/auth-context'
import {
    getServices,
    getBusiness,
    deleteService,
    updateServiceStatus,
} from '../../api/business-service'
import React from 'react'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
    const { user } = useAuth()
    const [services, setServices] = React.useState([])
    const [businesses, setBusinesses] = React.useState([])
    const router = useRouter()

    const fetchData = async () => {
        try {
            const [servicesData, businessData] = await Promise.all([
                getServices(),
                getBusiness(),
            ])
            setServices(servicesData)
            setBusinesses(businessData)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    const handleReject = async serviceId => {
        try {
            await deleteService(serviceId)
            await fetchData() // Refrescar datos
            alert('Service rejected and deleted')
        } catch (error) {
            console.error('Error rejecting service:', error)
            alert('Error rejecting service')
        }
    }

    const handleAccept = async serviceId => {
        try {
            await updateServiceStatus(serviceId, 'in progress')
            await fetchData()
            alert('Service accepted')
        } catch (error) {
            console.error('Error accepting service:', error)
            alert('Error accepting service')
        }
    }

    const isOwner = businessId => {
        if (!user || !businessId) {
            console.log('isOwner check failed: user or businessId missing', {
                user,
                businessId,
            })
            return false
        }
        const business = businesses.find(b => (b.id || b._id) === businessId)
        const userId = user.id || user._id
        console.log('isOwner check:', {
            userId,
            businessId,
            business,
            businessOwnerId: business?.owner_id,
            match: business && business.owner_id === userId,
        })
        return business && business.owner_id === userId
    }

    return (
        <Screen>
            <View style={styles.container}>
                <Text style={globalStyles.title}>Service Requests</Text>
                <Text style={styles.debugText}>
                    User ID: {user?.id || user?._id || 'No user'}
                </Text>
                <Text style={styles.debugText}>
                    Total businesses: {businesses.length}
                </Text>
                {services.length === 0 && (
                    <Text style={styles.emptyText}>No service requests</Text>
                )}
                {services.map(service => {
                    const serviceId = service.id || service._id
                    const showButtons =
                        isOwner(service.business_id) &&
                        service.state === 'pending'
                    console.log('Service render:', {
                        serviceId,
                        serviceName: service.name,
                        businessId: service.business_id,
                        state: service.state,
                        showButtons,
                    })
                    return (
                        <View key={serviceId} style={styles.serviceContainer}>
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        `/service-detail?id=${serviceId}`
                                    )
                                }
                            >
                                <View style={globalStyles.card}>
                                    <Text style={globalStyles.subtitle}>
                                        {service.name}
                                    </Text>
                                    <Text style={styles.description}>
                                        {service.description}
                                    </Text>
                                    <Text style={globalStyles.badge}>
                                        Status: {service.state}
                                    </Text>
                                    <Text style={styles.price}>
                                        Price: ${service.price}
                                    </Text>

                                    {showButtons && (
                                        <View style={styles.buttonContainer}>
                                            <Pressable
                                                style={[
                                                    styles.button,
                                                    styles.acceptButton,
                                                ]}
                                                onPress={e => {
                                                    e.stopPropagation()
                                                    handleAccept(serviceId)
                                                }}
                                            >
                                                <Text style={styles.buttonText}>
                                                    ACCEPT
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                style={[
                                                    styles.button,
                                                    styles.rejectButton,
                                                ]}
                                                onPress={e => {
                                                    e.stopPropagation()
                                                    handleReject(serviceId)
                                                }}
                                            >
                                                <Text style={styles.buttonText}>
                                                    REJECT
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    )
                })}
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
        width: '100%',
    },
    serviceContainer: {
        width: '100%',
        marginBottom: 16,
    },
    description: {
        color: '#555',
        marginVertical: 8,
    },
    price: {
        color: '#6A4C93',
        fontWeight: 'bold',
        marginVertical: 4,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        marginTop: 20,
    },
    debugText: {
        color: '#666',
        fontSize: 12,
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
})
