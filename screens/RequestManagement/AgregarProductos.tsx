import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { BASE_URL } from '../conexion';

type AgregarProductosNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AgregarProductos'
>;

type Producto = {
  codigo: string;
  nombre: string;
};

type DetalleTemp = {
  codigo: string;
  nombre: string;
  cantidad: number;
  observacion?: string;
};

const AgregarProductos = () => {
  const navigation = useNavigation<AgregarProductosNavigationProp>();
  const route = useRoute();
  const { solicitud_id } = route.params as { solicitud_id: number };

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [detalleTemp, setDetalleTemp] = useState<DetalleTemp[]>([]);
  const [estadoSolicitud, setEstadoSolicitud] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const estadoRes = await fetch(`${BASE_URL}/api/solicitudes/${solicitud_id}`);
        const contentType = estadoRes.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const data = await estadoRes.json();
          setEstadoSolicitud(data.estado);
          if (data.estado !== 'Pendiente') {
            Alert.alert(
              'Aviso',
              'La solicitud ya no está en estado pendiente.',
              [
                {
                  text: 'Aceptar',
                  onPress: () => navigation.replace('VisualizarSolicitudes'),
                },
              ]
            );
            return;
          }
        } else {
          throw new Error('Respuesta inesperada al verificar estado');
        }

        const productosRes = await fetch(`${BASE_URL}/api/productos/activos`);
        const productosData = await productosRes.json();
        setProductos(productosData);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        Alert.alert('Error', 'No se pudo cargar la información.');
      }
    };

    cargarDatos();
  }, []);

  const agregarDetalleTemp = () => {
    const cantidadNum = parseInt(cantidad);
    if (!productoSeleccionado || isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'Ingrese una cantidad válida mayor a 0 y seleccione un producto.');
      return;
    }

    if (detalleTemp.some((p) => p.codigo === productoSeleccionado)) {
      Alert.alert('Advertencia', 'Este producto ya fue añadido.');
      return;
    }

    const producto = productos.find((p) => p.codigo === productoSeleccionado);
    if (!producto) {
      Alert.alert('Error', 'Producto no encontrado.');
      return;
    }

    const nuevo: DetalleTemp = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      cantidad: cantidadNum,
      observacion,
    };

    setDetalleTemp([...detalleTemp, nuevo]);
    setCantidad('');
    setObservacion('');
    setProductoSeleccionado('');
  };

  const eliminarProducto = (codigo: string) => {
    setDetalleTemp((prev) => prev.filter((p) => p.codigo !== codigo));
  };

  const guardarDetalle = async () => {
    if (estadoSolicitud !== 'Pendiente') {
      Alert.alert('Error', 'Esta solicitud ya fue enviada.');
      return;
    }

    if (detalleTemp.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto.');
      return;
    }

    setCargando(true);

    try {
      for (const item of detalleTemp) {
        const res = await fetch(`${BASE_URL}/api/solicitudes/detalle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solicitud_id,
            producto_codigo: item.codigo,
            cantidad: item.cantidad,
            observacion: item.observacion || '',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.message) {
          throw new Error(data.message || 'Fallo al registrar producto');
        }
      }

      Alert.alert('Éxito', 'Productos registrados correctamente.', [
        {
          text: 'Aceptar',
          onPress: () => navigation.replace('VisualizarSolicitudes'),
        },
      ]);
    } catch (error) {
      console.error('❌ Error al guardar productos:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los productos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Productos a Solicitud</Text>

      <Text style={styles.label}>Producto:</Text>
      <Picker
        selectedValue={productoSeleccionado}
        onValueChange={setProductoSeleccionado}
        style={styles.input}
      >
        <Picker.Item label="Seleccione un producto..." value="" />
        {productos.map((p) => (
          <Picker.Item key={p.codigo} label={p.nombre} value={p.codigo} />
        ))}
      </Picker>

      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Observación:</Text>
      <TextInput
        value={observacion}
        onChangeText={setObservacion}
        style={styles.input}
        placeholder="(Opcional)"
      />

      <TouchableOpacity style={styles.btnAgregar} onPress={agregarDetalleTemp}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>

      <FlatList
        data={detalleTemp}
        keyExtractor={(item) => item.codigo}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre} - {item.cantidad}</Text>
            <TouchableOpacity onPress={() => eliminarProducto(item.codigo)}>
              <Text style={styles.eliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos añadidos.</Text>}
      />

      <TouchableOpacity
        style={[styles.btnAgregar, { backgroundColor: 'green' }]}
        onPress={guardarDetalle}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Guardar Detalle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
export default AgregarProductos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  btnAgregar: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e6e6e6',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  eliminar: {
    color: 'red',
  },
  vacio: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
  },
});


