import React from 'react';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GestionarSolicitudes'>;

const GestionarSolicitudes = () => {
  const navigation = useNavigation<NavigationProp>();


  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('Dashboard'); // <- Cambia a tu pantalla de inicio deseada
    });

    return unsubscribe;
  }, [navigation]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestión de Solicitudes</Text>

      <TouchableOpacity
        style={[styles.button, styles.greenButton]}
        onPress={() => navigation.navigate('RegistrarSolicitud')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Registrar Solicitud</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={() => navigation.navigate('VisualizarSolicitudes')}
      >
        <Ionicons name="list-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Visualizar Solicitudes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.orangeButton]}
        onPress={() => navigation.navigate('HistorialSolicitudes')}
      >
        <Ionicons name="time-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Historial de Solicitudes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GestionarSolicitudes;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  greenButton: {
    backgroundColor: '#34C759',
  },
  blueButton: {
    backgroundColor: '#007AFF',
  },
  orangeButton: {
    backgroundColor: '#FF9500',
  },
});
