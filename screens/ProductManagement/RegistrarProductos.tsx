import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../conexion'; // ✅ Importa la URL base

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarProducto'>;

interface Unidad {
  id: number;
  nombre: string;
}

const RegistrarProducto = () => {
  const navigation = useNavigation<NavigationProp>();

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);

  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/unidades`);
        const data = await response.json();
        if (response.ok) {
          setUnidades(data);
        } else {
          Alert.alert('Error', 'No se pudieron cargar las unidades de medida.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Error al conectar con el servidor de unidades.');
      } finally {
        setCargandoUnidades(false);
      }
    };

    cargarUnidades();
  }, []);

  const handleRegistrar = async () => {
    if (!codigo || !nombre || !descripcion || unidadId === null) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!/^\d+$/.test(codigo)) {
      Alert.alert('Error', 'El código del producto debe contener solo números.');
      return;
    }

    if (codigo.length > 10) {
      Alert.alert('Error', 'El código no debe exceder los 10 dígitos.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nombre,
          descripcion,
          unidad_medida_id: unidadId,
          estado: 'Activo',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Producto registrado correctamente.');
        navigation.navigate('VisualizarCatalogo');
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo registrar el producto.');
      }
    } catch (error) {
      console.error('Error al registrar producto:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Código del producto"
        value={codigo}
        keyboardType="numeric"
        onChangeText={(text) => {
          if (/^\d{0,10}$/.test(text)) setCodigo(text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Unidad de medida:</Text>
        {cargandoUnidades ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Picker
            selectedValue={unidadId}
            onValueChange={(value) => setUnidadId(value)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione unidad" value={null} />
            {unidades.map((u) => (
              <Picker.Item key={u.id} label={u.nombre} value={u.id} />
            ))}
          </Picker>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegistrarProducto;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
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
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerLabel: {
    fontSize: 16,
    padding: 10,
    fontWeight: '500',
    color: '#333',
  },
  picker: {
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
