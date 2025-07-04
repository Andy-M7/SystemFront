import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const RegistrarEmpleado = () => {
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargo, setCargo] = useState('Supervisor');
  const [estado, setEstado] = useState('Activo');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validarTexto = (text: string) => {
    if (/\d/.test(text)) return 'Los nombres y apellidos no pueden contener números';
    if (/[^a-zA-Z\s]/.test(text)) return 'No se permiten caracteres especiales';
    if (text.trim() === '') return 'Este campo no puede estar vacío';
    return '';
  };

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    if (!dni || !nombres || !apellidos || !cargo || !estado) {
      setError('Complete todos los campos requeridos');
      return;
    }

    const nombreError = validarTexto(nombres);
    const apellidoError = validarTexto(apellidos);
    if (nombreError || apellidoError) {
      setError(nombreError || apellidoError);
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos numéricos');
      return;
    }

    axios
      .post('http://192.168.1.64:5000/empleados', {
        dni,
        nombres,
        apellidos,
        cargo,
        estado,
      })
      .then(() => {
        setSuccess('Empleado registrado correctamente');
        setError('');
        setDni('');
        setNombres('');
        setApellidos('');
      })
      .catch((error) => {
      const msg = error.response?.data || 'No se pudo registrar el empleado';
      setError(msg);
       });

  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Empleado</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={dni}
          onChangeText={setDni}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Nombres"
          value={nombres}
          onChangeText={setNombres}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={apellidos}
          onChangeText={setApellidos}
        />
        <View style={styles.pickerContainer}>
          <Picker selectedValue={cargo} onValueChange={setCargo} style={styles.picker}>
            <Picker.Item label="Supervisor" value="Supervisor" />
            <Picker.Item label="Técnico" value="Técnico" />
            <Picker.Item label="Administrador" value="Administrador" />
            <Picker.Item label="Logística" value="Logística" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker selectedValue={estado} onValueChange={setEstado} style={styles.picker}>
            <Picker.Item label="Activo" value="Activo" />
            <Picker.Item label="Inactivo" value="Inactivo" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    elevation: 2,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  error: {
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  success: {
    color: '#388E3C',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default RegistrarEmpleado;
