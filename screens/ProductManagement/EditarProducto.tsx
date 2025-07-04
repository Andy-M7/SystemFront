import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarProducto'>;
type RouteParams = RouteProp<RootStackParamList, 'EditarProducto'>;

interface Unidad {
  id: number;
  nombre: string;
}

const EditarProducto = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { codigo } = route.params;

  const [producto, setProducto] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState<Unidad[]>([]);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const response = await fetch(`http://192.168.1.64:5000/api/productos/buscar?criterio=${codigo}`);
        const data = await response.json();
        if (response.ok) {
          setProducto(data);
          setNombre(data.nombre);
          setDescripcion(data.descripcion);

          // Obtener unidad por nombre
          const unidadEncontrada = unidadesDisponibles.find((u) => u.nombre === data.unidad_medida);
          if (unidadEncontrada) {
            setUnidadId(unidadEncontrada.id);
          }
        } else {
          Alert.alert('Error', data.mensaje || 'No se pudo cargar el producto');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo conectar al servidor');
      }
    };

    const cargarUnidades = async () => {
      try {
        const res = await fetch('http://192.168.1.64:5000/api/unidades');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setUnidadesDisponibles(data);
        }
      } catch (error) {
        console.error('Error al cargar unidades:', error);
      }
    };

    // Cargar unidades primero, luego el producto
    const cargarTodo = async () => {
      await cargarUnidades();
      await cargarProducto();
    };

    cargarTodo();
  }, [codigo]);

  const handleGuardar = async () => {
    if (!nombre || !descripcion || unidadId === null) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.64:5000/api/productos/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion,
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
              const res = await fetch(`http://192.168.1.64:5000/api/productos/${codigo}/inactivar`, {
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

  if (!producto) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <TextInput style={styles.input} value={codigo} editable={false} />
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
      <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" />

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
});
