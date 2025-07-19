import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
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
  unidad_medida: string;
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

  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoFiltrado, setProductoFiltrado] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [limite, setLimite] = useState(10);

  const [cantidad, setCantidad] = useState('');
  const [errorCantidad, setErrorCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [detalleTemp, setDetalleTemp] = useState<DetalleTemp[]>([]);
  const [estadoSolicitud, setEstadoSolicitud] = useState('');
  const [cargando, setCargando] = useState(false);

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const estadoRes = await fetch(`${BASE_URL}/api/solicitudes/${solicitud_id}`);
        const data = await estadoRes.json();
        setEstadoSolicitud(data.estado);
        if (data.estado !== 'Pendiente') {
          Alert.alert('Aviso', 'La solicitud ya no está en estado pendiente.', [
            { text: 'Aceptar', onPress: () => navigation.replace('VisualizarSolicitudes') },
          ]);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/productos/activos`);
        const productosData = await res.json();
        setProductos(productosData);
        setProductoFiltrado(productosData.slice(0, 10));
        console.log('✅ Productos cargados:', productosData.length);
      } catch (err) {
        console.error('❌ Error al cargar productos:', err);
        Alert.alert('Error', 'No se pudo cargar la información.');
      }
    };

    cargarDatos();
  }, []);

  // 🔍 Filtro por nombre + paginación
  useEffect(() => {
    const filtrados = productos
      .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, limite);
    setProductoFiltrado(filtrados);
  }, [busqueda, productos, limite]);

  // 🔢 Validación en tiempo real de cantidad
  const handleCantidadChange = (value: string) => {
    const soloNumeros = value.replace(/[^0-9]/g, '');
    if (value !== soloNumeros) {
      console.log(`⚠️ Entrada inválida: "${value}" contiene letras o símbolos`);
      setErrorCantidad('Solo se permiten números');
    } else if (soloNumeros.length > 10) {
      console.log(`⚠️ Se intentó ingresar más de 10 dígitos: "${soloNumeros}"`);
      setErrorCantidad('Máximo 10 dígitos permitidos');
    } else if (soloNumeros.length > 1 && soloNumeros.startsWith('0')) {
      console.log(`⚠️ Número inválido: "${soloNumeros}" empieza con 0`);
      setErrorCantidad('No puede empezar con 0 si tiene más de un dígito');
    } else {
      setErrorCantidad('');
    }

    if (soloNumeros.length <= 10 && !(soloNumeros.length > 1 && soloNumeros.startsWith('0'))) {
      setCantidad(soloNumeros);
    }
  };

  // ➕ Agregar producto a lista temporal
  const agregarDetalleTemp = () => {
    const cantidadNum = parseInt(cantidad);
    if (!productoSeleccionado || isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'Seleccione un producto válido y una cantidad mayor a 0.');
      return;
    }

    if (detalleTemp.some(p => p.codigo === productoSeleccionado.codigo)) {
      Alert.alert('Advertencia', 'Este producto ya fue añadido.');
      return;
    }

    const nuevo: DetalleTemp = {
      codigo: productoSeleccionado.codigo,
      nombre: `${productoSeleccionado.nombre} (Unidad: ${productoSeleccionado.unidad_medida})`,
      cantidad: cantidadNum,
      observacion,
    };

    setDetalleTemp([...detalleTemp, nuevo]);
    setProductoSeleccionado(null);
    setBusqueda('');
    setCantidad('');
    setObservacion('');
    setLimite(10);
    console.log(`✅ Producto añadido: ${nuevo.nombre}`);
  };

  // 💾 Guardar solicitud
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
        { text: 'Aceptar', onPress: () => navigation.replace('VisualizarSolicitudes') },
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
      {/* ✅ PRODUCTO SELECCIONADO */}
      <Text style={styles.label}>Producto:</Text>
      <TouchableOpacity onPress={() => setMostrarModal(true)} style={styles.input}>
        <Text>
          {productoSeleccionado
            ? `${productoSeleccionado.nombre} (Unidad: ${productoSeleccionado.unidad_medida})`
            : 'Seleccionar producto...'}
        </Text>
      </TouchableOpacity>

      {/* 🔢 CANTIDAD */}
      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        value={cantidad}
        onChangeText={handleCantidadChange}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Máx. 10 dígitos"
      />
      {errorCantidad ? <Text style={styles.error}>{errorCantidad}</Text> : null}

      {/* 📝 OBSERVACIÓN */}
      <Text style={styles.label}>Observación:</Text>
      <TextInput
        value={observacion}
        onChangeText={setObservacion}
        style={styles.input}
        placeholder="(Opcional)"
      />

      {/* ➕ BOTÓN AGREGAR */}
      <TouchableOpacity style={styles.btnAgregar} onPress={agregarDetalleTemp}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>

      {/* 📋 LISTA TEMPORAL */}
      <FlatList
        data={detalleTemp}
        keyExtractor={(item) => item.codigo}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre} - {item.cantidad}</Text>
            <TouchableOpacity onPress={() =>
              setDetalleTemp(detalleTemp.filter(p => p.codigo !== item.codigo))
            }>
              <Text style={styles.eliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos añadidos.</Text>}
      />

      {/* ✅ GUARDAR DETALLE */}
      <TouchableOpacity
        style={[styles.btnAgregar, { backgroundColor: 'green' }]}
        onPress={guardarDetalle}
        disabled={cargando}
      >
        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar Detalle</Text>}
      </TouchableOpacity>

      {/* 🔲 MODAL DE PRODUCTOS */}
      <Modal visible={mostrarModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Buscar producto:</Text>
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.input}
            placeholder="Ej: tornillo, cable, etc."
          />
          <FlatList
            data={productoFiltrado}
            keyExtractor={(item) => item.codigo}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setProductoSeleccionado(item);
                  setMostrarModal(false);
                  console.log(`🟢 Producto seleccionado: ${item.nombre} (${item.unidad_medida})`);
                }}
              >
                <Text style={styles.itemProducto}>
                  {item.nombre} (Unidad: {item.unidad_medida})
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              productoFiltrado.length >= limite ? (
                <TouchableOpacity onPress={() => setLimite(limite + 10)}>
                  <Text style={styles.mostrarMas}>Mostrar más...</Text>
                </TouchableOpacity>
              ) : null
            }
          />
          <TouchableOpacity onPress={() => setMostrarModal(false)} style={styles.btnAgregar}>
            <Text style={styles.btnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AgregarProductos;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  itemProducto: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingHorizontal: 5,
  },
  mostrarMas: {
    padding: 10,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  btnAgregar: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e6e6e6',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  eliminar: { color: 'red' },
  vacio: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: 5,
  },
});
