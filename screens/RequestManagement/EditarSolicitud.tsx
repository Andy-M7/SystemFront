import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { BASE_URL } from '../conexion';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarSolicitud'>;

type Producto = {
  detalle_id: number;
  nombre: string;
  cantidad: string;
  observacion: string;
};

type RouteParams = {
  solicitud_id: number;
};

const EditarSolicitud = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { solicitud_id } = route.params as RouteParams;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [estado, setEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/solicitudes/${solicitud_id}`);
        const data = response.data;

        if (!data || !data.estado || !data.detalles) {
          throw new Error('Estructura inesperada en la respuesta del servidor');
        }

        if (data.estado !== 'Pendiente') {
          Alert.alert('Aviso', 'No se pueden editar solicitudes que ya fueron enviadas o aprobadas.');
          navigation.goBack();
          return;
        }

        setEstado(data.estado);
        const detallesConvertidos = data.detalles.map((d: any) => ({
          detalle_id: d.detalle_id,
          nombre: d.nombre,
          cantidad: d.cantidad.toString(),
          observacion: d.observacion || '',
        }));

        setProductos(detallesConvertidos);
      } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los datos de la solicitud.');
        navigation.goBack();
      }
    };

    fetchSolicitud();
  }, [solicitud_id]);

  const actualizarCampo = (index: number, campo: 'cantidad' | 'observacion', valor: string) => {
    const copia = [...productos];
    copia[index][campo] = valor;
    setProductos(copia);
  };

  const eliminarProducto = (index: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que deseas eliminar este producto de la solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const copia = [...productos];
            copia.splice(index, 1);
            setProductos(copia);
          },
        },
      ]
    );
  };

  const handleGuardar = async () => {
    if (guardando) return;
    setGuardando(true);

    if (estado !== 'Pendiente') {
      Alert.alert('Error', 'No se puede modificar esta solicitud. Ya fue enviada a logística.');
      setGuardando(false);
      return;
    }

    if (productos.length === 0) {
      Alert.alert('Error', 'Debe mantener al menos un producto en la solicitud.');
      setGuardando(false);
      return;
    }

    try {
      for (const producto of productos) {
        const cantidadNum = parseInt(producto.cantidad);

        if (isNaN(cantidadNum) || cantidadNum <= 0) {
          Alert.alert('Error', 'Ingrese una cantidad válida mayor a 0');
          setGuardando(false);
          return;
        }

        const respuesta = await axios.put(`${BASE_URL}/api/solicitudes/detalle/${producto.detalle_id}`, {
          cantidad: cantidadNum,
          observacion: producto.observacion,
        });

        if (respuesta.status !== 200) {
          throw new Error('Error en la respuesta del servidor');
        }
      }

      Alert.alert('Éxito', 'Solicitud actualizada correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al guardar:', error);

      if (axios.isAxiosError(error)) {
        const mensaje = error.response?.data?.error || 'Ocurrió un error al guardar los cambios de la solicitud.';
        Alert.alert('Error', mensaje);
      } else {
        Alert.alert('Error', 'Ocurrió un error al guardar los cambios de la solicitud.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Solicitud</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.detalle_id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              keyboardType="numeric"
              value={item.cantidad}
              onChangeText={(text) => actualizarCampo(index, 'cantidad', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Observación"
              value={item.observacion}
              onChangeText={(text) => actualizarCampo(index, 'observacion', text)}
            />
            <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarProducto(index)}>
              <Text style={styles.textoEliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos en esta solicitud.</Text>}
      />

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.textoGuardar}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditarSolicitud;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
  },
  nombre: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#eaeaea',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  botonEliminar: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoEliminar: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botonGuardar: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  textoGuardar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  vacio: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});
