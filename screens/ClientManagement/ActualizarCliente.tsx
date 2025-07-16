import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../conexion'; // ✅ Ruta según tu estructura

type Cliente = {
  id: number;
  nombre_razon_social: string;
  documento: string;
  direccion: string;
  telefono: string;
  estado: string;
};

const ActualizarCliente = () => {
  const route = useRoute<RouteProp<{ params: { id: number } }, 'params'>>();
  const navigation = useNavigation();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    obtenerCliente();
  }, []);

  const obtenerCliente = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/clientes/${route.params.id}`
      );
      const data = response.data;
      setCliente(data);
      setNombre(data.nombre_razon_social);
      setDireccion(data.direccion);
      setTelefono(data.telefono);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener el cliente.');
    } finally {
      setCargando(false);
    }
  };

  const validarNombre = (texto: string): boolean => {
    const regex = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/;
    return regex.test(texto.trim());
  };

  const validarCampos = () => {
    if (!nombre || !direccion || !telefono) {
      Alert.alert('Validación', 'Todos los campos deben estar completos.');
      return false;
    }

    if (!validarNombre(nombre)) {
      Alert.alert('Validación', 'El nombre o razón social solo debe contener letras, números, espacios o guiones.');
      return false;
    }

    if (!/^\d+$/.test(telefono)) {
      Alert.alert('Validación', 'El teléfono debe contener solo números.');
      return false;
    }

    return true;
  };

  const actualizarCliente = async () => {
    if (!validarCampos() || !cliente) return;

    try {
      await axios.put(`${BASE_URL}/api/clientes/${cliente.id}`, {
        nombre_razon_social: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        documento: cliente.documento,
      });
      Alert.alert('Éxito', 'Cliente actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el cliente.');
    }
  };

  if (cargando || !cliente) {
    return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Cliente</Text>

      <Text style={styles.label}>Nombre o Razón Social</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del cliente"
      />

      <Text style={styles.label}>DNI/RUC (no editable)</Text>
      <TextInput
        style={[styles.input, styles.disabled]}
        value={cliente.documento}
        editable={false}
      />

      <Text style={styles.label}>Dirección</Text>
      <TextInput
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
        placeholder="Dirección"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Teléfono"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={actualizarCliente}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActualizarCliente;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  disabled: {
    backgroundColor: '#eee',
    color: '#888',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
