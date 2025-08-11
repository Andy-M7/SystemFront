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
import { BASE_URL } from '../conexion';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegistrarProducto'>;

interface Unidad {
  id: number;
  nombre: string;
}

const REGEX_CODIGO = /^\d{1,10}$/;
// Letras (con acentos), números y espacios
const REGEX_NOMBRE = /^[a-zA-ZÀ-ÿ0-9\s]+$/;

const RegistrarProducto = () => {
  const navigation = useNavigation<NavigationProp>();

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [cargandoUnidades, setCargandoUnidades] = useState(true);
  const [registrando, setRegistrando] = useState(false);

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
    // Validaciones básicas
    if (!codigo || !nombre || !descripcion || unidadId === null) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!REGEX_CODIGO.test(codigo)) {
      Alert.alert('Error', 'El código del producto debe contener solo números (máx. 10).');
      return;
    }

    // Normalizar nombre (trim y colapsar espacios)
    const nombreNormalizado = nombre.trim().replace(/\s+/g, ' ');

    if (!REGEX_NOMBRE.test(nombreNormalizado)) {
      Alert.alert('Error', 'El nombre solo puede incluir letras, números y espacios.');
      return;
    }

    if (nombreNormalizado.length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres.');
      return;
    }

    try {
      setRegistrando(true);

      const response = await fetch(`${BASE_URL}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nombre: nombreNormalizado,
          descripcion: descripcion.trim(),
          unidad_medida_id: unidadId,
          estado: 'Activo',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Producto registrado correctamente.', [
          {
            text: 'Aceptar',
            onPress: () => navigation.navigate('VisualizarCatalogo'),
          },
        ]);
      } else {
        Alert.alert('Error', data?.mensaje || 'No se pudo registrar el producto.');
      }
    } catch (error) {
      console.error('Error al registrar producto:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor.');
    } finally {
      setRegistrando(false);
    }
  };

  // Sanitizador en tiempo real para el nombre (bloquea caracteres especiales al escribir)
  const onChangeNombre = (text: string) => {
    // Elimina cualquier carácter no permitido
    const limpio = text.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '');
    setNombre(limpio);
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
        maxLength={10}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={onChangeNombre}
        maxLength={60}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        maxLength={200}
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

      <TouchableOpacity
        style={[styles.button, registrando && styles.buttonDisabled]}
        onPress={handleRegistrar}
        disabled={registrando}
      >
        {registrando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
