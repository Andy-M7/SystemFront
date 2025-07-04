import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';
import logo from '../assets/logo.png';



type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={26} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Bienvenido a la aplicación</Text>

      {/* Botones */}
      <TouchableOpacity
        style={[styles.button, styles.greenButton]}
        onPress={() => navigation.navigate('GestionarEmpleados')}
      >
        <Ionicons name="people-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Gestionar Empleados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.orangeButton]}
        onPress={() => navigation.navigate('GestionarUsuarios')}
      >
        <Ionicons name="person-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Gestionar Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={() => navigation.navigate('GestionarClientes')}
      >
        <Ionicons name="people-circle-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Gestionar Clientes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.purpleButton]}
        onPress={() => navigation.navigate('GestionarProductos')}
      >
        <Ionicons name="cube-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Gestionar Productos</Text>
      </TouchableOpacity>


      {/* Logo e información de contacto */}
      <View style={styles.logoContainer}>
        <Image
          source={logo}
          style={styles.logoLarge}
          resizeMode="contain"
        />
      </View>

    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 6,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginVertical: 16,
    color: '#555',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  greenButton: {
    backgroundColor: '#34C759',
  },
  orangeButton: {
    backgroundColor: '#FF9500',
  },
  blueButton: {
    backgroundColor: '#007AFF',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoLarge: {
  width: 320,
  height: 220,
  marginTop: 20,
  borderRadius: 10,
},

  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 3,
  },

  purpleButton: {
  backgroundColor: '#8E44AD',
},

});
