import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type GestionarEmpleadosNavigationProp = StackNavigationProp<RootStackParamList, 'GestionarEmpleados'>;

interface Props {
  navigation: GestionarEmpleadosNavigationProp;
}

const GestionarEmpleados: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Empleados</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RegistrarEmpleado')}
      >
        <Ionicons name="person-add-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Registrar Empleado</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ListarEmpleados')}
      >
        <Ionicons name="people-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ver Empleados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BuscarEmpleado')}
      >
        <Ionicons name="search-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Buscar Empleado</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '85%',
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GestionarEmpleados;
