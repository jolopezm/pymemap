import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'inherit',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },

    textField: {
        height: 40,
        borderColor: 'red',
        borderWidth: 1,
        marginBottom: 10,
        width: 200,
        paddingHorizontal: 10,
        borderRadius: 5,
    },

    button: {
        backgroundColor: '#2d3238ff',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        width: 200,

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
})
