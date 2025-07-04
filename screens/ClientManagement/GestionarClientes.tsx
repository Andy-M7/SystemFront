import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // Asegúrate de que la ruta sea correcta

type GestionarClientesNavigationProp = StackNavigationProp<RootStackParamList, 'GestionarClientes'>;

interface Props {
  navigation: GestionarClientesNavigationProp;
}

const GestionarClientes: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Clientes</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CD964' }]}
        onPress={() => navigation.navigate('RegistrarClientes')}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Registrar Cliente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={() => navigation.navigate('ListarClientes')}
      >
        <Ionicons name="people-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ver Clientes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GestionarClientes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F4F4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '80%',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
