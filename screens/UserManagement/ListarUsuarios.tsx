import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { BASE_URL } from '../conexion'; // ✅ Import centralizado

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListarUsuarios'>;

interface Usuario {
  id: number;
  nombre: string;
  correo_electronico: string;
  rol: string;
}

const ListarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);

  const navigation = useNavigation<NavigationProp>();

  const obtenerUsuarios = () => {
    setLoading(true);
    axios.get(`${BASE_URL}/api/usuarios`)
      .then((response) => {
        setUsuarios(response.data);
        setTotalUsuarios(response.data.length);
      })
      .catch((error) => {
        console.error('Error al obtener los usuarios:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      obtenerUsuarios();
    }, [])
  );

  const handleEditar = (id: number) => {
    navigation.navigate('ActualizarUsuario', { id });
  };

  const handleEliminar = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            axios.delete(`${BASE_URL}/api/usuarios/${id}`)
              .then(() => {
                Alert.alert('Usuario eliminado correctamente');
                obtenerUsuarios();
              })
              .catch(() => {
                Alert.alert('Error al eliminar usuario');
              });
          }
        }
      ]
    );
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!usuario.nombre || !usuario.correo_electronico) return false;

    const rolCoincide = filtroRol === 'Todos' || usuario.rol === filtroRol;
    const nombre = usuario.nombre.toLowerCase();
    const correo = usuario.correo_electronico.toLowerCase();
    const busquedaNormalizada = busqueda.toLowerCase();

    const busquedaCoincide =
      nombre.includes(busquedaNormalizada) ||
      correo.includes(busquedaNormalizada);

    return rolCoincide && busquedaCoincide;
  });

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.tableRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.column}><Text style={styles.bold}>Nombre:</Text> {item.nombre}</Text>
        <Text style={styles.column}><Text style={styles.bold}>Correo:</Text> {item.correo_electronico}</Text>
        <Text style={styles.column}><Text style={styles.bold}>Rol:</Text> {item.rol}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEditar(item.id)} style={styles.actionButton}>
        <Icon name="edit" size={18} color="#2196F3" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleEliminar(item.id)} style={styles.actionButton}>
        <Icon name="trash" size={18} color="#f44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios</Text>
      <Text style={styles.total}>Total de usuarios: {totalUsuarios}</Text>

      <View style={styles.filters}>
        <Text style={styles.label}>Filtrar por Rol</Text>
        <Picker
          selectedValue={filtroRol}
          style={styles.picker}
          onValueChange={(itemValue) => setFiltroRol(itemValue)}
        >
          <Picker.Item label="Todos" value="Todos" />
          <Picker.Item label="Administrador" value="Administrador" />
          <Picker.Item label="Supervisor" value="Supervisor" />
          <Picker.Item label="Logística" value="Logística" />
          <Picker.Item label="Técnico" value="Técnico" />
        </Picker>

        <Text style={styles.label}>Buscar por nombre o correo</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : usuariosFiltrados.length === 0 ? (
        <Text>No hay usuarios disponibles</Text>
      ) : (
        <FlatList
          data={usuariosFiltrados}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

export default ListarUsuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  total: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  filters: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    color: '#333',
    fontWeight: '600',
  },
  picker: {
    height: 50,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: '#999',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  column: {
    fontSize: 14,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '600',
    color: '#444',
  },
  actionButton: {
    padding: 6,
    marginLeft: 10,
    backgroundColor: '#EDEDED',
    borderRadius: 6,
  },
});
