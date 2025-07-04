import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GestionarClientes'>;

const RegistrarClientes = () => {
  const navigation = useNavigation<NavigationProp>();
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');

  const validarNombre = (nombre: string): boolean => {
    const regex = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/;
    return regex.test(nombre.trim());
  };

  const validarDocumento = (doc: string): boolean => {
    return /^\d{8}$/.test(doc) || /^\d{11}$/.test(doc);
  };

  const validarTelefono = (num: string): boolean => {
    return /^\d+$/.test(num);
  };

  const handleSubmit = async () => {
    if (!nombre || !documento || !direccion || !telefono) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validarNombre(nombre)) {
      Alert.alert('Error', 'El nombre o razón social solo debe contener letras, números, espacios o guiones.');
      return;
    }

    if (!validarDocumento(documento)) {
      Alert.alert('Error', 'El número de documento debe tener 8 (DNI) o 11 dígitos (RUC).');
      return;
    }

    if (!validarTelefono(telefono)) {
      Alert.alert('Error', 'El teléfono debe contener solo números.');
      return;
    }

    try {
      const res = await axios.post('http://192.168.1.64:5000/api/clientes', {
        nombre_razon_social: nombre.trim(),
        documento: documento.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
      });

      if (res.data.success || res.data.mensaje) {
        Alert.alert('Éxito', 'Cliente registrado correctamente');
        navigation.goBack();
      }
    } catch (error: any) {
      const mensaje = error.response?.data || error.response?.data?.error || 'Ocurrió un error';
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Registrar Cliente</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} style={styles.icon} color="#666" />
        <TextInput
          placeholder="Nombre o Razón Social"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={20} style={styles.icon} color="#666" />
        <TextInput
          placeholder="DNI o RUC"
          keyboardType="numeric"
          maxLength={11}
          style={styles.input}
          value={documento}
          onChangeText={setDocumento}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} style={styles.icon} color="#666" />
        <TextInput
          placeholder="Dirección"
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} style={styles.icon} color="#666" />
        <TextInput
          placeholder="Teléfono"
          keyboardType="phone-pad"
          maxLength={9}
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>REGISTRAR CLIENTE</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    height: 45,
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default RegistrarClientes;
