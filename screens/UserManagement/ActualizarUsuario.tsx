import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface Props {
  route: { params: { id: number } };
  navigation: any;
}

const ActualizarUsuario = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setCargando(true);
    axios.get(`http://192.168.1.64:5000/api/usuarios`)
      .then((res) => {
        const usuario = res.data.find((u: any) => u.id === id);
        if (usuario) {
          setNombre(usuario.nombre);
          setCorreo(usuario.correo_electronico);
          setContrasena(usuario.contrasena);
          setRol(usuario.rol);
        }
      })
      .catch(() => Alert.alert('Error al cargar datos del usuario'))
      .finally(() => setCargando(false));
  }, [id]);

  const handleActualizar = () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(correo)) {
      Alert.alert('Error', 'El correo electrónico no es válido');
      return;
    }

    if (contrasena.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    axios.put(`http://192.168.1.64:5000/api/usuarios/${id}`, {
      correo_electronico: correo,
      contrasena,
      rol,
    })
      .then(() => {
        Alert.alert('Éxito', 'Usuario actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      })
      .catch((error) => {
        const msg = error.response?.data?.error || 'Error al actualizar usuario';
        Alert.alert('Error', msg);
      });
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos del Usuario</Text>

      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder="Nombre"
        value={nombre}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderRightWidth: 0 }]}
          placeholder="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry={!mostrarContrasena}
        />
        <TouchableOpacity
          onPress={() => setMostrarContrasena(!mostrarContrasena)}
          style={styles.eyeIcon}
        >
          <Icon
            name={mostrarContrasena ? 'eye-slash' : 'eye'}
            size={18}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder="Rol"
        value={rol}
        editable={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleActualizar}>
        <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActualizarUsuario;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 48,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#EDEDED',
    color: '#888',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 48,
    borderLeftWidth: 1,
    borderColor: '#ccc',
  },
});
