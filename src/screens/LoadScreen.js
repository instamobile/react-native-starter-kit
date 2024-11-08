import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native';

const LoadScreen = () => {
    return (
        <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', 
    },
    loadingBox: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        elevation: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.8, 
        shadowRadius: 2, 
    },
});

export default LoadScreen;