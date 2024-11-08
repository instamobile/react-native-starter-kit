import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingModal = ({ isVisible }) => {
    if (!isVisible) return null;
    
    return (
        <View style={styles.container}>
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
    },
    loadingBox: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default LoadingModal;