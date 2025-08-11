import React, { useEffect, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../conexion';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarProducto'>;
type RouteParams = RouteProp<RootStackParamList, 'EditarProducto'>;

interface Unidad {
  id: number;
  nombre: string;
}

const REGEX_NOMBRE = /^[a-zA-ZÀ-ÿ0-9\s]+$/;

const EditarProducto = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { codigo } = route.params;

  const [cargando, setCargando] = useState(true);
  const [producto, setProducto] = useState<any>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [unidadNombreInicial, setUnidadNombreInicial] = useState<string | null>(null); // por si el API no trae ID
  const [unidadesDisponibles, setUnidadesDisponibles] = useState<Unidad[]>([]);

  // 1) Cargar unidades
  const cargarUnidades = async () => {
    const res = await fetch(`${BASE_URL}/api/unidades`);
    const data = await res.json();
    if (!res.ok) throw new Error('No se pudieron cargar las unidades');
    if (!Array.isArray(data)) throw new Error('Formato inválido de unidades');
    setUnidadesDisponibles(data);
  };

  // 2) Cargar producto
  const cargarProducto = async () => {
    const response = await fetch(`${BASE_URL}/api/productos/buscar?criterio=${codigo}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.mensaje || 'No se pudo cargar el producto');

    setProducto(data);
    setNombre(data.nombre || '');
    setDescripcion(data.descripcion || '');

    // Preferimos el ID si existe; si no, guardamos el nombre para resolverlo luego
    if (typeof data.unidad_medida_id === 'number') {
      setUnidadId(data.unidad_medida_id);
    } else if (typeof data.unidad_medida === 'string') {
      setUnidadNombreInicial(data.unidad_medida);
    }
  };

  // 3) Cargar todo
  useEffect(() => {
    (async () => {
      try {
        await cargarUnidades();
        await cargarProducto();
      } catch (e) {
        console.error(e);
        Alert.alert('Error', e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        setCargando(false);
      }
    })();
  }, [codigo]);

  // 4) Si no vino unidad_medida_id pero sí nombre, resolvemos el ID cuando las unidades ya están
  useEffect(() => {
    if (unidadId === null && unidadNombreInicial && unidadesDisponibles.length > 0) {
      const encontrada = unidadesDisponibles.find(
        (u) => u.nombre.toLowerCase().trim() === unidadNombreInicial.toLowerCase().trim()
      );
      if (encontrada) setUnidadId(encontrada.id);
    }
  }, [unidadNombreInicial, unidadesDisponibles, unidadId]);

  // Sanitizador en tiempo real para evitar caracteres especiales en Nombre
  const onChangeNombre = (text: string) => {
    const limpio = text.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '');
    setNombre(limpio);
  };

  const handleGuardar = async () => {
    if (!nombre || !descripcion || unidadId === null) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    if (!REGEX_NOMBRE.test(nombreLimpio)) {
      Alert.alert('Error', 'El nombre solo puede incluir letras, números y espacios.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/productos/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreLimpio,
          descripcion: descripcion.trim(),
          unidad_medida_id: unidadId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Producto actualizado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.mensaje || 'No se pudo actualizar');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error de conexión con el servidor');
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      'Confirmación',
      '¿Está seguro que desea eliminar este producto? El producto no podrá ser utilizado en nuevas solicitudes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/productos/${codigo}/inactivar`, {
                method: 'PATCH',
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('Eliminado', 'El producto fue inactivado correctamente.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', data.mensaje || 'No se pudo inactivar');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Error de conexión');
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!producto) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <TextInput style={[styles.input, styles.disabledInput]} value={codigo} editable={false} />

      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={onChangeNombre}
        placeholder="Nombre"
        maxLength={60}
      />

      <TextInput
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción"
        maxLength={200}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Unidad de medida:</Text>
        <Picker
          selectedValue={unidadId}
          onValueChange={(itemValue) => setUnidadId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione unidad de medida" value={null} />
          {unidadesDisponibles.map((u) => (
            <Picker.Item key={u.id} label={u.nombre} value={u.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      {/* Si quieres mostrar también el botón Eliminar/Inactivar, descomenta: */}
      {/* <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleEliminar}>
        <Text style={styles.buttonText}>Inactivar Producto</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

export default EditarProducto;

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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
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
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
});
