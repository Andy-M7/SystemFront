import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const RegistrarUsuario = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | undefined>(undefined);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('http://192.168.1.64:5000/empleados')
      .then(response => setEmpleados(response.data))
      .catch(error => console.error("Error al obtener empleados", error));
  }, []);

  const handleEmpleadoChange = (empleadoId: number) => {
    const empleado = empleados.find(emp => emp.id === empleadoId);
    if (empleado) {
      setEmpleadoSeleccionado(empleadoId);
      setNombre(empleado.nombres);
      setCargo(empleado.cargo);
    }
  };

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    if (!empleadoSeleccionado || !correo || !contrasena || !cargo) {
      setError('Complete todos los campos requeridos');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(correo)) {
      setError('El correo electrónico no es válido');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    axios.post('http://192.168.1.64:5000/api/usuarios', {
      empleado_id: empleadoSeleccionado,
      correo_electronico: correo,
      contrasena: contrasena,
      rol: cargo
    })
      .then(() => {
        setSuccess('Usuario registrado correctamente');
        setEmpleadoSeleccionado(undefined);
        setCorreo('');
        setContrasena('');
        setNombre('');
        setCargo('');
      })
      .catch(error => {
        const msg = error.response?.data || 'No se pudo registrar el usuario';
        setError(msg);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Usuario</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <View style={styles.iconInput}>
        <Icon name="user" size={18} color="#555" style={styles.icon} />
        <Picker
          selectedValue={empleadoSeleccionado}
          style={styles.picker}
          onValueChange={handleEmpleadoChange}
        >
          <Picker.Item label="Selecciona un empleado" value={undefined} />
          {empleados.map((empleado) => (
            <Picker.Item
              key={empleado.id}
              label={`${empleado.nombres} (${empleado.cargo})`}
              value={empleado.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.iconInput}>
        <Icon name="id-badge" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          editable={false}
        />
      </View>

      <View style={styles.iconInput}>
        <Icon name="envelope" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.iconInput}>
        <Icon name="lock" size={18} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />
      </View>

      <View style={styles.iconInput}>
        <Icon name="user-tag" size={18} color="#555" style={styles.icon} />
        <Picker
          selectedValue={cargo}
          style={[styles.picker, { backgroundColor: '#eee' }]}
          enabled={false}
        >
          <Picker.Item label={cargo || 'Rol asignado automáticamente'} value={cargo} />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Icon name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F4F4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
  input: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  picker: { flex: 1, height: 50 },
  iconInput: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, backgroundColor: '#fff' },
  icon: { marginRight: 8 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  success: { color: 'green', marginBottom: 10, textAlign: 'center' },
});

export default RegistrarUsuario;
