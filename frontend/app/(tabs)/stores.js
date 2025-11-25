import { View, ScrollView, StyleSheet, Animated, Platform, RefreshControl } from 'react-native'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBusinessData } from '../../hooks'
import { useLocation } from '../../context/location-context'
import LocationPickerModal from '../../components/location-picker-modal'
import { useRefresh } from '../../hooks/useRefresh'
import { useBusinessFilters } from '../../hooks'
import { StoresHeader, StoresList, StoresMap, StoresFilterModals } from '../../components/stores'
import ErrorBoundary from '../../components/ErrorBoundary'
import { colors, spacing } from '../../styles/theme'
import LoadingState from '../../components/LoadingState'

export default function StoresScreen() {
    const router = useRouter()
    const { userLocation, userCoords, updateLocation } = useLocation()
    const [activeView, setActiveView] = useState('list')
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [selectedMapBusiness, setSelectedMapBusiness] = useState(null)
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        owners: [],
        distance: null,
    })
    const [showSortModal, setShowSortModal] = useState(false)
    const [showCategoriesModal, setShowCategoriesModal] = useState(false)
    const [showSellersModal, setShowSellersModal] = useState(false)
    const [sortOption, setSortOption] = useState('Recomendados')
    const slideAnim = useRef(new Animated.Value(300)).current
    const fadeAnim = useRef(new Animated.Value(0)).current

    const { businesses: allBusinesses, loading, error, refetch } = useBusinessData()
    const { refreshing, onRefresh } = useRefresh(refetch)

    // Extract unique sellers
    const sellerOptions = useMemo(() => {
        const sellersMap = new Map()
        allBusinesses.forEach(b => {
            if (b.owner_id) {
                // Use User.name as label as requested by user
                // Fallback to owner_name or ID if not present
                const label = b.User?.name || b.owner_name || `Vendedor ${b.owner_id.substring(0, 6)}...`
                // Use the business profile pic as the seller image
                const image = b.profile_pic

                if (!sellersMap.has(b.owner_id)) {
                    sellersMap.set(b.owner_id, { id: b.owner_id, label, image })
                }
            }
        })
        return Array.from(sellersMap.values())
    }, [allBusinesses])

    useEffect(() => {
        if (Platform.OS === 'web' && activeView === 'map') {
            setActiveView('list')
        }
    }, [activeView])

    const handleLocationSelected = useCallback(async (coords) => {
        updateLocation(coords, coords.address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)
        setLocationModalVisible(false)
    }, [updateLocation])

    const { filteredBusinesses: businesses } = useBusinessFilters(
        allBusinesses,
        selectedFilters,
        sortOption,
        userCoords
    )

    const handleSelectBusiness = useCallback((business) => {
        const businessId = business.id || business._id
        if (businessId) {
            router.push(`/business-profile?id=${businessId}`)
        }
    }, [router])

    const handleMarkerPress = useCallback((business) => {
        setSelectedMapBusiness(business)
    }, [])

    const handleSortSelect = useCallback((option) => {
        setSortOption(option)
        setShowSortModal(false)
    }, [])

    const handleCategoryToggle = useCallback((category) => {
        setSelectedFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }))
    }, [])

    const handleSellerToggle = useCallback((sellerId) => {
        setSelectedFilters(prev => {
            const currentOwners = prev.owners || []
            const newOwners = currentOwners.includes(sellerId)
                ? currentOwners.filter(id => id !== sellerId)
                : [...currentOwners, sellerId]
            return { ...prev, owners: newOwners }
        })
    }, [])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StoresHeader
                userLocation={userLocation}
                userCoords={userCoords}
                activeView={activeView}
                selectedFilters={selectedFilters}
                onLocationPress={() => setLocationModalVisible(true)}
                onSearchPress={() => router.push('/search')}
                onViewChange={setActiveView}
                onFilterChange={(newFilters) => {
                    setSelectedFilters(newFilters)
                }}
                onSortPress={() => setShowSortModal(true)}
                onCategoriesPress={() => setShowCategoriesModal(true)}
                onOwnersPress={() => setShowSellersModal(true)}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingState variant="list" count={6} />
                </View>
            ) : activeView === 'list' ? (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                            progressBackgroundColor={colors.white}
                        />
                    }
                >
                    <View style={styles.resultsContainer}>
                        <StoresList
                            businesses={businesses}
                            userCoords={userCoords}
                            selectedFilters={selectedFilters}
                            onBusinessPress={handleSelectBusiness}
                        />
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.mapContainer}>
                    <ErrorBoundary>
                        <StoresMap
                            businesses={businesses}
                            userCoords={userCoords}
                            selectedMapBusiness={selectedMapBusiness}
                            onMarkerPress={handleMarkerPress}
                            onBusinessSelect={handleSelectBusiness}
                        />
                    </ErrorBoundary>
                </View>
            )}

            <StoresFilterModals
                showSortModal={showSortModal}
                showCategoriesModal={showCategoriesModal}
                showSellersModal={showSellersModal}
                sortOption={sortOption}
                selectedCategories={selectedFilters.categories}
                selectedSellers={selectedFilters.owners || []}
                sellerOptions={sellerOptions}
                slideAnim={slideAnim}
                fadeAnim={fadeAnim}
                onSortSelect={handleSortSelect}
                onCategoryToggle={handleCategoryToggle}
                onSellerToggle={handleSellerToggle}
                onCloseSortModal={() => setShowSortModal(false)}
                onCloseCategoriesModal={() => setShowCategoriesModal(false)}
                onCloseSellersModal={() => setShowSellersModal(false)}
            />

            <LocationPickerModal
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
                onLocationSelected={handleLocationSelected}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    resultsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    mapContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})
