import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../conexion'; // ✅ Nuevo import

interface Empleado {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  estado: string;
}

const BuscarEmpleado: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [buscarPor, setBuscarPor] = useState<'dni' | 'nombres'>('dni');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargo, setCargo] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    axios
      .get(`${BASE_URL}/empleados`)
      .then((res) => setEmpleados(res.data))
      .catch((err) => console.error('Error al obtener empleados:', err));
  }, []);

  const buscarEmpleado = () => {
    if (!terminoBusqueda.trim()) {
      Alert.alert('Atención', 'Ingrese un valor para buscar.');
      return;
    }

    if (buscarPor === 'dni' && terminoBusqueda.length !== 8) {
      Alert.alert('Error', 'El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    const emp = empleados.find((e) =>
      buscarPor === 'dni'
        ? e.dni === terminoBusqueda.trim()
        : `${e.nombres} ${e.apellidos}`.toLowerCase().includes(terminoBusqueda.trim().toLowerCase())
    );

    if (!emp) {
      Alert.alert('No encontrado', 'Empleado no encontrado.');
      setEmpleadoSeleccionado(null);
    } else {
      setEmpleadoSeleccionado(emp);
      setNombres(emp.nombres);
      setApellidos(emp.apellidos);
      setCargo(emp.cargo);
      setEstado(emp.estado);
    }
  };

  const actualizarEmpleado = () => {
    if (!empleadoSeleccionado) {
      Alert.alert('Atención', 'Seleccione un empleado para actualizar');
      return;
    }

    if (!nombres || !apellidos || !cargo || !estado) {
      Alert.alert('Error', 'Complete todos los campos requeridos');
      return;
    }

    const validarTexto = (text: string) => {
      if (/\d/.test(text)) return 'No se permiten números';
      if (/[^a-zA-Z\s]/.test(text)) return 'No se permiten caracteres especiales';
      if (text.trim() === '') return 'Este campo no puede estar vacío';
      return '';
    };

    const nombreError = validarTexto(nombres);
    const apellidoError = validarTexto(apellidos);

    if (nombreError || apellidoError) {
      Alert.alert('Error', nombreError || apellidoError);
      return;
    }

    axios
      .put(`${BASE_URL}/empleados/${empleadoSeleccionado.id}`, {
        dni: empleadoSeleccionado.dni,
        nombres,
        apellidos,
        cargo,
        estado,
      })
      .then(() => Alert.alert('Éxito', 'Empleado actualizado correctamente'))
      .catch((error) => {
        console.error('Error al actualizar:', error);
        Alert.alert('Error', 'No se pudo actualizar el empleado.');
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Buscar y Editar Empleado</Text>

      {/* Buscador */}
      <View style={styles.searchSection}>
        <Picker
          selectedValue={buscarPor}
          style={styles.picker}
          onValueChange={(value) => {
            setBuscarPor(value);
            setTerminoBusqueda('');
            setEmpleadoSeleccionado(null);
          }}
        >
          <Picker.Item label="Buscar por DNI" value="dni" />
          <Picker.Item label="Buscar por Nombre" value="nombres" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Ingrese DNI o nombre"
          value={terminoBusqueda}
          onChangeText={(text) => {
            if (buscarPor === 'dni') {
              const soloNumeros = text.replace(/[^0-9]/g, '');
              if (soloNumeros.length <= 8) {
                setTerminoBusqueda(soloNumeros);
              }
            } else {
              const soloLetras = text.replace(/[^a-zA-Z\s]/g, '');
              setTerminoBusqueda(soloLetras);
            }
          }}
          keyboardType={buscarPor === 'dni' ? 'numeric' : 'default'}
          maxLength={buscarPor === 'dni' ? 8 : 50}
        />

        <TouchableOpacity style={styles.searchButton} onPress={buscarEmpleado}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Formulario de edición */}
      {empleadoSeleccionado ? (
        <View style={styles.form}>
          <Text style={styles.label}>DNI (bloqueado)</Text>
          <Text style={styles.disabledField}>{empleadoSeleccionado.dni}</Text>

          <Text style={styles.label}>Nombres</Text>
          <TextInput style={styles.input} value={nombres} onChangeText={setNombres} />

          <Text style={styles.label}>Apellidos</Text>
          <TextInput style={styles.input} value={apellidos} onChangeText={setApellidos} />

          <Text style={styles.label}>Cargo</Text>
          <Picker selectedValue={cargo} style={styles.picker} onValueChange={setCargo}>
            <Picker.Item label="Supervisor" value="Supervisor" />
            <Picker.Item label="Técnico" value="Técnico" />
            <Picker.Item label="Administrador" value="Administrador" />
            <Picker.Item label="Logística" value="Logística" />
          </Picker>

          <Text style={styles.label}>Estado</Text>
          <Picker selectedValue={estado} style={styles.picker} onValueChange={setEstado}>
            <Picker.Item label="Activo" value="Activo" />
            <Picker.Item label="Inactivo" value="Inactivo" />
          </Picker>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.updateButton} onPress={actualizarEmpleado}>
              <Text style={styles.buttonText}>Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEmpleadoSeleccionado(null)}>
              <Text style={styles.buttonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.notice}>Seleccione un empleado para editar</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f6f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: '#28a745',
    flex: 1,
    padding: 12,
    marginRight: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    flex: 1,
    padding: 12,
    marginLeft: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  disabledField: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    color: '#555',
    marginBottom: 10,
  },
  notice: {
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default BuscarEmpleado;
