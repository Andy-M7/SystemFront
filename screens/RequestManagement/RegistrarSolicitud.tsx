import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import axios from 'axios';
import { BASE_URL } from '../conexion';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarSolicitud'>;

const RegistrarSolicitud = () => {
  const navigation = useNavigation<NavigationProp>();
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);

  const fechaActual = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioData = await AsyncStorage.getItem('usuario');
        if (!usuarioData) {
          Alert.alert('Error', 'No se encontró sesión activa');
          return;
        }

        const usuario = JSON.parse(usuarioData);
        setUsuarioId(usuario.id);

        const response = await axios.get(`${BASE_URL}/api/clientes`);
        setClientes(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los clientes');
      }
    };

    cargarDatos();
  }, []);

  const registrarSolicitud = async () => {
    if (!clienteSeleccionado || !usuarioId) {
      Alert.alert('Error', 'Debe seleccionar un cliente');
      return;
    }

    setCargando(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/solicitudes`, {
        cliente_id: clienteSeleccionado,
        usuario_id: usuarioId,
        fecha: fechaActual,
      });

      const nuevaSolicitud = response.data;

      if (nuevaSolicitud.estado === 'Pendiente') {
        navigation.replace('AgregarProductos', { solicitud_id: nuevaSolicitud.id });
      } else {
        Alert.alert(
          'Aviso',
          'No se pueden agregar productos a una solicitud que ya fue enviada o aprobada',
          [{ text: 'Aceptar', onPress: () => navigation.replace('VisualizarSolicitudes') }]
        );
      }
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409 && data?.message && data?.estado) {
        Alert.alert(
          'Aviso',
          `Ya registraste una solicitud hoy para este cliente. Estado: ${data.estado}`,
          data.puedeContinuar
            ? [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Forzar Registro',
                  onPress: () => forzarRegistro(),
                },
              ]
            : [{ text: 'Aceptar' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo registrar la solicitud');
      }
    } finally {
      setCargando(false);
    }
  };

  const forzarRegistro = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/solicitudes/forzar`, {
        cliente_id: clienteSeleccionado,
        usuario_id: usuarioId,
        fecha: fechaActual,
      });

      const nuevaSolicitud = response.data;
      navigation.replace('AgregarProductos', { solicitud_id: nuevaSolicitud.id });
    } catch (error) {
      Alert.alert('Error', 'No se pudo forzar el registro de la solicitud');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Nueva Solicitud</Text>

      <Text style={styles.label}>Seleccione un Cliente:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={clienteSeleccionado}
          onValueChange={(itemValue) => setClienteSeleccionado(itemValue)}
        >
          <Picker.Item label="Seleccione un cliente..." value="" />
          {clientes.map((cliente: any) => (
            <Picker.Item
              key={cliente.id}
              label={cliente.nombre_razon_social}
              value={cliente.id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={registrarSolicitud} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Registrar Solicitud</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RegistrarSolicitud;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
