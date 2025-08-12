import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar,
  Image, ScrollView, ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './navigation';
import logo from '../assets/logo.png';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Dashboard = () => {
  const navigation = useNavigation<NavigationProp>();

  const [rol, setRol] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar usuario
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('usuario');
      if (!raw) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      try {
        const u = JSON.parse(raw);
        setRol(u?.rol ?? null);
        setNombre(u?.nombre ?? null);
      } finally {
        setCargando(false);
      }
    })();
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('usuario');
            navigation.replace('Login'); // ⬅️ Más simple que reset para este caso
          } catch {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };

  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const can = (modulo: string) => {
    if (!rol) return false;
    const r = norm(rol);
    if (r === 'administrador') return true;
    const perms: Record<string, string[]> = {
      logistica: ['productos', 'logistica'],
      supervisor: ['solicitudes', 'clientes'],
    };
    return (perms[r] || []).includes(norm(modulo));
  };

  // Overloads + implementación any para evitar peleas con TS
  function goTo<T extends keyof RootStackParamList>(route: T, modulo: string): void;
  function goTo<T extends keyof RootStackParamList>(route: T, modulo: string, params: RootStackParamList[T]): void;
  function goTo(route: any, modulo: string, params?: any) {
    if (!can(modulo)) {
      Alert.alert('Acceso denegado', 'No tienes permisos para este módulo.');
      return;
    }
    params === undefined ? navigation.navigate(route) : navigation.navigate(route, params);
  }

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inicio</Text>
          {!!rol && <Text style={styles.roleText}>{nombre ? `${nombre} • ` : ''}Rol: {rol}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={26} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Bienvenido a la aplicación</Text>

        {can('empleados') && (
          <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={() => goTo('GestionarEmpleados', 'empleados')}>
            <Ionicons name="people-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Empleados</Text>
          </TouchableOpacity>
        )}

        {can('usuarios') && (
          <TouchableOpacity style={[styles.button, styles.orangeButton]} onPress={() => goTo('GestionarUsuarios', 'usuarios')}>
            <Ionicons name="person-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Usuarios</Text>
          </TouchableOpacity>
        )}

        {can('clientes') && (
          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={() => goTo('GestionarClientes', 'clientes')}>
            <Ionicons name="people-circle-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Clientes</Text>
          </TouchableOpacity>
        )}

        {can('productos') && (
          <TouchableOpacity style={[styles.button, styles.purpleButton]} onPress={() => goTo('GestionarProductos', 'productos')}>
            <Ionicons name="cube-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Productos</Text>
          </TouchableOpacity>
        )}

        {can('solicitudes') && (
          <TouchableOpacity style={[styles.button, styles.brownButton]} onPress={() => goTo('GestionarSolicitudes', 'solicitudes')}>
            <Ionicons name="clipboard-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Solicitudes</Text>
          </TouchableOpacity>
        )}

        {can('logistica') && (
          <TouchableOpacity style={[styles.button, styles.tealButton]} onPress={() => goTo('GestionarLogistica', 'logistica')}>
            <Ionicons name="trail-sign-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Gestionar Logística</Text>
          </TouchableOpacity>
        )}

        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logoLarge} resizeMode="contain" />
        </View>
      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    paddingTop: 15, paddingBottom: 15, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'white', elevation: 4,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111' },
  roleText: { marginTop: 4, color: '#666' },
  logoutButton: { padding: 6, borderRadius: 6 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: { fontSize: 17, textAlign: 'center', marginVertical: 16, color: '#555' },
  button: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 12, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  greenButton: { backgroundColor: '#34C759' },
  orangeButton: { backgroundColor: '#FF9500' },
  blueButton: { backgroundColor: '#007AFF' },
  purpleButton: { backgroundColor: '#8E44AD' },
  brownButton: { backgroundColor: '#A0522D' },
  tealButton: { backgroundColor: '#20B2AA' },
  icon: { marginRight: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  logoContainer: { marginTop: 30, alignItems: 'center' },
  logoLarge: { width: 320, height: 220, marginTop: 20, borderRadius: 10 },
});
