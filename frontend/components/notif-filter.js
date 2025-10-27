import React from 'react'
import { View, Text, Button, StyleSheet, Pressable } from 'react-native'
import { useNotif } from '../context/notif-context'
import { globalStyles, colors } from '../styles/global'

function NotificationFilter({ onFilterChange }) {
    const [filter, setFilter] = React.useState('all')
    const { notifications } = useNotif()

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
                    onPress={() => handleFilterChange('unread')}
                    style={[styles.button, { 
                        borderBottomWidth: filter === 'unread' ? 3 : 1,
                        borderBottomColor: filter === 'unread' ? colors.primary : colors.gray, 
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'unread' ? colors.textSecondary : colors.gray }]}>Sin leer ({notifications.filter(n => n.read === false).length})</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleFilterChange('read')}
                    style={[styles.button, {
                        borderBottomWidth: filter === 'read' ? 3 : 1,
                        borderBottomColor: filter === 'read' ? colors.primary : colors.gray,
                    }]}
                >
                    <Text style={[styles.buttonText, { color: filter === 'read' ? colors.textSecondary : colors.gray }]}>Leidas</Text>
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

export default NotificationFilter