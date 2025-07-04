import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Asegúrate de que esté instalado

type GestionarUsuariosNavigationProp = StackNavigationProp<RootStackParamList, 'GestionarUsuarios'>;

interface Props {
  navigation: GestionarUsuariosNavigationProp;
}

const GestionarUsuarios: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Usuarios</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RegistrarUsuario')}
      >
        <Icon name="user-plus" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Registrar Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ListarUsuarios')}
      >
        <Icon name="users" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ver Usuarios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '85%',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default GestionarUsuarios;
