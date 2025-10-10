import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontFamily: 'inherit',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },

    textField: {
        minHeight: 44,
        borderColor: 'red',
        borderWidth: 1,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 10,
        borderRadius: 5,
    },

    button: {
        backgroundColor: '#2d3238ff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 5,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        width: '100%',
        minHeight: 48,

        red: {
            backgroundColor: '#ff4d4d',
        },

        yellow: {
            backgroundColor: '#ffe600ff',
        },

        green: {
            backgroundColor: '#4dff88',
        },

        outlineBlack: {
            backgroundColor: '#fff',
            borderColor: '#000',
        },
    },

    card: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },

    badge: {
        backgroundColor: '#eee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        textAlign: 'center',
    },
})
