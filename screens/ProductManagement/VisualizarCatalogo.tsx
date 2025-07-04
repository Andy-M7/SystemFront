import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const VisualizarCatalogo = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const cargarProductos = async () => {
    try {
      const res = await axios.get('http://192.168.1.64:5000/api/productos');
      if (res.data.mensaje) {
        setMensaje(res.data.mensaje);
        setProductos([]);
      } else {
        const ordenados = res.data.sort((a: any, b: any) =>
          a.nombre.localeCompare(b.nombre)
        );
        setProductos(ordenados);
        setMensaje('');
      }
    } catch (err) {
      setMensaje('Error al cargar productos');
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarProductos().finally(() => setRefreshing(false));
  };

  const cambiarEstado = async (codigo: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      await axios.put(`http://192.168.1.64:5000/api/productos/estado/${codigo}`, {
        estado: nuevoEstado,
      });
      cargarProductos();
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar el estado del producto.');
    }
  };

  const irAEditar = (codigo: string) => {
    navigation.navigate('EditarProducto', { codigo });
  };

  const filtrar = () => {
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, item.estado === 'Inactivo' && styles.inactivo]}>
      <View style={styles.headerCard}>
        <Text style={styles.codigo}>{item.codigo}</Text>
        <Text style={[styles.estado, { color: item.estado === 'Activo' ? 'green' : 'gray' }]}>
          {item.estado}
        </Text>
      </View>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.unidad}>Unidad: {item.unidad_medida}</Text>

      <View style={styles.botones}>
        <TouchableOpacity
          style={[styles.boton, { backgroundColor: '#FF9500' }]}
          onPress={() => cambiarEstado(item.codigo, item.estado)}
        >
          <Text style={styles.textoBoton}>
            {item.estado === 'Activo' ? 'Inactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: '#007AFF' }]}
          onPress={() => irAEditar(item.codigo)}
        >
          <Text style={styles.textoBoton}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo de Productos</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o código"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {mensaje ? (
        <Text style={styles.mensaje}>{mensaje}</Text>
      ) : (
        <FlatList
          data={filtrar()}
          keyExtractor={(item) => item.codigo}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default VisualizarCatalogo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  mensaje: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  inactivo: {
    backgroundColor: '#eaeaea',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codigo: {
    fontWeight: 'bold',
    color: '#444',
  },
  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#222',
  },
  descripcion: {
    color: '#555',
    marginVertical: 6,
  },
  unidad: {
    fontSize: 14,
    color: '#333',
  },
  estado: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  boton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  textoBoton: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
