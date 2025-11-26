import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import BusinessCard from './BusinessCard'


const BusinessList = React.memo(({
    businesses,
    onPress,
    variant = 'horizontal',
    onRefresh,
    refreshing = false,
    showFavorite = false,
    showInfoRow = true,
    style,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
}) => {
    // Memoizar renderItem para evitar recreación
    const renderItem = React.useCallback(
        ({ item }) => (
            <BusinessCard
                business={item}
                variant={variant}
                onPress={() => onPress(item)}
                showFavorite={showFavorite}
                showInfoRow={showInfoRow}
            />
        ),
        [variant, onPress, showFavorite, showInfoRow]
    )

    // Optimización: función de key extractor memoizada
    const keyExtractor = React.useCallback(
        (item) => item.id || item._id,
        []
    )

    // Optimización: getItemLayout para scroll performance
    // Asumir altura fija según variant para mejor performance
    const itemHeight = variant === 'vertical' ? 320 : variant === 'compact' ? 120 : 180
    const getItemLayout = React.useCallback(
        (data, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
        }),
        [itemHeight]
    )

    return (
        <FlatList
            data={businesses}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            style={[styles.list, style]}
            contentContainerStyle={styles.contentContainer}
            // Pull to refresh
            onRefresh={onRefresh}
            refreshing={refreshing}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            // Headers/Footers/Empty
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            // Evitar flickering
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
            }}
        />
    )
}, (prevProps, nextProps) => {
    // Custom comparison: solo re-renderizar si cambian businesses o refreshing
    return (
        prevProps.businesses === nextProps.businesses &&
        prevProps.refreshing === nextProps.refreshing &&
        prevProps.variant === nextProps.variant &&
        prevProps.showFavorite === nextProps.showFavorite
    )
})

BusinessList.propTypes = {
    businesses: PropTypes.array.isRequired,
    onPress: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['vertical', 'horizontal', 'compact']),
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
    showFavorite: PropTypes.bool,
    showInfoRow: PropTypes.bool,
    style: PropTypes.object,
    ListHeaderComponent: PropTypes.element,
    ListFooterComponent: PropTypes.element,
    ListEmptyComponent: PropTypes.element,
}

BusinessList.displayName = 'BusinessList'

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 16,
    },
})

export default BusinessList
