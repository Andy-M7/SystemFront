import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GestionarProductos'>;

const GestionarProductos = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestión de Productos</Text>

      <TouchableOpacity
        style={[styles.button, styles.greenButton]}
        onPress={() => navigation.navigate('RegistrarProducto')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Registrar Producto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={() => navigation.navigate('VisualizarCatalogo')}
      >
        <Ionicons name="list-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ver Catálogo de Productos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.orangeButton]}
        onPress={() => navigation.navigate('ImportarProductos')}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Importar Productos (Excel)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GestionarProductos;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#222',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
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
