import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios, { AxiosError } from 'axios';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { BASE_URL } from '../conexion';

type Empleado = {
  id: number;
  nombres: string;
  cargo: string;
  estado?: string; // 'Activo' | 'Inactivo'
  activo?: number; // 1 | 0  (por si usas flag numérico)
};

const RegistrarUsuario = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | undefined>(undefined);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🔽 Carga de empleados solo ACTIVOS (con fallback a filtrado en front)
  useEffect(() => {
    const cargarEmpleadosActivos = async () => {
      try {
        // 1) Intenta con query param (si tu backend lo soporta)
        const res = await axios.get(`${BASE_URL}/empleados`, { params: { estado: 'Activo' } });
        const data: Empleado[] = Array.isArray(res.data) ? res.data : [];
        // 2) Filtro extra por si llega mezcla
        const activos = data.filter(
          (e) => (e.estado?.toLowerCase() === 'activo') || e.activo === 1
        );
        setEmpleados(activos);
      } catch {
        // Fallback: trae todo y filtra aquí
        try {
          const res2 = await axios.get(`${BASE_URL}/empleados`);
          const data2: Empleado[] = Array.isArray(res2.data) ? res2.data : [];
          const activos2 = data2.filter(
            (e) => (e.estado?.toLowerCase() === 'activo') || e.activo === 1
          );
          setEmpleados(activos2);
        } catch (err) {
          console.error('Error al obtener empleados', err);
          setEmpleados([]);
        }
      }
    };

    cargarEmpleadosActivos();
  }, []);

  const handleEmpleadoChange = (empleadoId: number) => {
    const empleado = empleados.find((emp) => emp.id === empleadoId);
    if (empleado) {
      setEmpleadoSeleccionado(empleadoId);
      setNombre(empleado.nombres);
      setCargo(empleado.cargo);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!empleadoSeleccionado || !correo.trim() || !contrasena || !cargo) {
      setError('Complete todos los campos requeridos');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(correo.trim())) {
      setError('El correo electrónico no es válido');
      return;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/usuarios`, {
        empleado_id: empleadoSeleccionado,
        correo_electronico: correo.trim(),
        contrasena: contrasena,
        rol: cargo,
      });

      setSuccess('Usuario registrado correctamente');
      setEmpleadoSeleccionado(undefined);
      setCorreo('');
      setContrasena('');
      setNombre('');
      setCargo('');
    } catch (error) {
      const err = error as AxiosError<any>;
      const msg =
        (typeof err.response?.data === 'string' && err.response?.data) ||
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'No se pudo registrar el usuario';
      setError(msg);
    }
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
          <Picker.Item label="Selecciona un empleado activo" value={undefined} />
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
          onChangeText={(t) => setCorreo(t.trim())}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
