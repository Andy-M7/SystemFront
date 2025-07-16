import React, { useEffect, useRef } from 'react';
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
import Login from '../screens/Login'; // o la ruta correcta
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './navigation';
import logo from '../assets/logo.png';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;


const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const ignoreBeforeRemove = useRef(false); // ← importante

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('Login'); // <- Cambia a tu pantalla de inicio deseada
    });

    return unsubscribe;
  }, [navigation]);


  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            ignoreBeforeRemove.current = true; // permite salir limpiamente
            await AsyncStorage.removeItem('usuario');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };
  
  


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      {/* Encabezado fijo */}
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={26} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Bienvenido a la aplicación</Text>


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

        <TouchableOpacity
          style={[styles.button, styles.brownButton]}
          onPress={() => navigation.navigate('GestionarSolicitudes')}
        >
          <Ionicons name="clipboard-outline" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Gestionar Solicitudes</Text>
        </TouchableOpacity>


        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logoLarge} resizeMode="contain" />
        </View>

      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },

  header: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 6
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginVertical: 16,
    color: '#555'
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
    elevation: 2
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
  purpleButton: {
    backgroundColor: '#8E44AD',
  },
  brownButton: {
    backgroundColor: '#A0522D',
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
    alignItems: 'center'
  },
  logoLarge: {
    width: 320,
    height: 220,
    marginTop: 20,
    borderRadius: 10
  }
});
