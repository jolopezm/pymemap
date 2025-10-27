import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useService } from '../context/service-context'
import { colors } from '../styles/global'

function ServiceFilter({ onFilterChange }) {
    const [filter, setFilter] = React.useState('all')
    const { services } = useService()

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
        onFilterChange(newFilter)
    }

    return (
        <View style={styles.container}>
                <Pressable
                    onPress={() => handleFilterChange('all')}
                    style={[styles.button, { 
                        borderBottomWidth: filter === 'all' ? 3 : 1,
                        borderBottomColor: filter === 'all' ? colors.primary : colors.gray, 
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'all' ? colors.textSecondary : colors.gray }]}>Todas</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleFilterChange('in-progress')}
                    style={[styles.button, {
                        borderBottomWidth: filter === 'in-progress' ? 3 : 1,
                        borderBottomColor: filter === 'in-progress' ? colors.primary : colors.gray,
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'in-progress' ? colors.textSecondary : colors.gray }]}>En progreso ({notifications.filter(n => n.status === 'in-progress').length})</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleFilterChange('paid')}
                    style={[styles.button, {
                        borderBottomWidth: filter === 'paid' ? 3 : 1,
                        borderBottomColor: filter === 'paid' ? colors.primary : colors.gray,
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'paid' ? colors.textSecondary : colors.gray }]}>Pagadas</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleFilterChange('canceled')}
                    style={[styles.button, {
                        borderBottomWidth: filter === 'canceled' ? 3 : 1,
                        borderBottomColor: filter === 'canceled' ? colors.primary : colors.gray,
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'canceled' ? colors.textSecondary : colors.gray }]}>Canceladas</Text>
                </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 8,
        paddingTop: 8,
        marginBottom: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: colors.lightGray,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        paddingBottom: 12,
        flex: 1,
        width: '100%',
        borderBottomWidth: 1,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ServiceFilter