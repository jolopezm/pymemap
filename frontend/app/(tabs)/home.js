import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useAuth } from '../../context/auth-context'
import { useLocation } from '../../context/location-context'
import { getServices } from '../../api/business-service'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useBusinessData } from '../../hooks'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import LocationPickerModal from '../../components/location-picker-modal'
import { useRefresh } from '../../hooks/useRefresh'
import { useResponsiveDimensions } from '../../hooks'
import { SearchBar, LocationHeader } from '../../components/ui'
import {
    HomeCategories,
    HomePromoBanner,
    HomeFeaturedBrands,
    HomeNewBusinesses,
    HomeNearbyStores,
} from '../../components/home'
import LoadingState from '../../components/LoadingState'
import { colors } from '../../styles/theme'
import logger from '../../utils/logger'

export default function HomeScreen() {
    useAuth()
    const {
        userLocation,
        updateLocation,
        fetchLocation,
        userCoords,
        isLoadingLocation,
    } = useLocation()
    const { cardWidth, cardImageHeight, featuredSize, categorySize } =
        useResponsiveDimensions()
    const [, setServices] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [showLocationPicker, setShowLocationPicker] = useState(false)
    const router = useRouter()
    const scrollViewRef = useRef(null)
    const nearbyStoresRef = useRef(null)

    const { businesses, loading, refetch } = useBusinessData()

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await getServices()
                setServices(servicesData)
            } catch (error) {
                logger.error('Error fetching services:', error)
            }
        }
        fetchServices()

        if (!userCoords && !isLoadingLocation) {
            fetchLocation()
        }
    }, [])

    const { refreshing, onRefresh } = useRefresh(refetch)

    const filteredBusinesses = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'Todos') return businesses
        const selected = selectedCategory.toLowerCase()
        return businesses.filter(b => {
            const category = b.category?.toLowerCase() || ''
            return category === selected || category.includes(selected)
        })
    }, [businesses, selectedCategory])

    const scrollToNearbyStores = () => {
        if (nearbyStoresRef.current && scrollViewRef.current) {
            nearbyStoresRef.current.measureLayout(
                scrollViewRef.current,
                (_x, y) =>
                    scrollViewRef.current.scrollTo({
                        y: y - 20,
                        animated: true,
                    }),
                () => {}
            )
        }
    }

    const handleCategorySelect = useCallback(category => {
        setSelectedCategory(category)
        setTimeout(() => scrollToNearbyStores(), 100)
    }, [])

    const handleBusinessPress = useCallback(
        businessId => {
            router.push(`/business-profile?id=${businessId}`)
        },
        [router]
    )

    const handleLocationSelected = useCallback(
        location => {
            updateLocation(
                { latitude: location.latitude, longitude: location.longitude },
                location.address
            )
        },
        [updateLocation]
    )

    const renderHeader = () => (
        <View style={styles.header}>
            <LocationHeader
                location={userLocation}
                onPress={() => setShowLocationPicker(true)}
            />
            <SearchBar
                editable={false}
                onPress={() => router.push('/search')}
            />
        </View>
    )

    const displayBusinesses = selectedCategory ? filteredBusinesses : businesses

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" backgroundColor="#FFF" />
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9B59B6']}
                        tintColor="#9B59B6"
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            >
                {renderHeader()}
                <HomeCategories
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelect}
                    categorySize={categorySize}
                />
                <HomePromoBanner />
                {loading ? (
                    <>
                        <LoadingState variant="list" count={2} />
                        <LoadingState variant="list" count={3} />
                    </>
                ) : (
                    <>
                        <HomeFeaturedBrands
                            businesses={businesses}
                            onPressBusiness={handleBusinessPress}
                            featuredSize={featuredSize}
                        />
                        <HomeNewBusinesses
                            businesses={businesses}
                            onPressBusiness={handleBusinessPress}
                            cardWidth={cardWidth}
                            cardImageHeight={cardImageHeight}
                        />
                        <View ref={nearbyStoresRef}>
                            <HomeNearbyStores
                                businesses={displayBusinesses}
                                onPressBusiness={handleBusinessPress}
                            />
                        </View>
                    </>
                )}
            </ScrollView>

            <LocationPickerModal
                visible={showLocationPicker}
                onClose={() => setShowLocationPicker(false)}
                onLocationSelected={handleLocationSelected}
                currentAddress={userLocation}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 14,
    },
})
