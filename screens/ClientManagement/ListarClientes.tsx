import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';

type Cliente = {
  id: number;
  nombre_razon_social: string;
  documento: string;
  direccion: string;
  telefono: string;
  estado: string;
};

const ListarClientes = ({ navigation }: any) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const [cargando, setCargando] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      obtenerClientes();
    }
  }, [isFocused]);

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const response = await axios.get('http://192.168.1.64:5000/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = (id: number) => {
    Alert.alert('Eliminar Cliente', '¿Estás seguro de eliminar este cliente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.1.64:5000/api/clientes/${id}`);
            Alert.alert('Éxito', 'Cliente eliminado correctamente');
            obtenerClientes();
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo eliminar el cliente.');
          }
        },
      },
    ]);
  };

  const filtrarYOrdenarClientes = () => {
    let lista = clientes;

    if (filtro) {
      const texto = filtro.toLowerCase();
      lista = lista.filter(c =>
        c.nombre_razon_social.toLowerCase().includes(texto) ||
        c.documento.includes(texto)
      );
    }

    lista.sort((a, b) => {
      const nombreA = a.nombre_razon_social.toLowerCase();
      const nombreB = b.nombre_razon_social.toLowerCase();
      if (nombreA < nombreB) return ordenAscendente ? -1 : 1;
      if (nombreA > nombreB) return ordenAscendente ? 1 : -1;
      return 0;
    });

    return lista;
  };

  const clientesFiltrados = filtrarYOrdenarClientes();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Clientes</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, DNI o RUC..."
        value={filtro}
        onChangeText={setFiltro}
      />

      <View style={styles.sortContainer}>
        <TouchableOpacity
          onPress={() => setOrdenAscendente(!ordenAscendente)}
          style={styles.sortButton}
        >
          <Ionicons name="swap-vertical-outline" size={24} color="#007AFF" />
          <Text style={{ marginLeft: 5, color: '#007AFF' }}>
            Orden: {ordenAscendente ? 'Asc' : 'Desc'}
          </Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : clientesFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>No hay clientes registrados.</Text>
      ) : (
        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>Nombre: {item.nombre_razon_social}</Text>
              <Text style={styles.cardText}>DNI/RUC: {item.documento}</Text>
              <Text style={styles.cardText}>Dirección: {item.direccion}</Text>
              <Text style={styles.cardText}>Teléfono: {item.telefono}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ActualizarCliente', { id: item.id })}
                  style={styles.editButton}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => eliminarCliente(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default ListarClientes;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
    padding: 8,
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  cardText: { fontSize: 15, color: '#333', marginBottom: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
  },
});
