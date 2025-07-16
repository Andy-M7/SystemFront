import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../conexion'; // ✅ Importación añadida

interface Empleado {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  estado: string;
}

const ListarEmpleados = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUpdate, setLoadingUpdate] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [filtroCargo, setFiltroCargo] = useState<string>('Todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [ordenPor, setOrdenPor] = useState<'dni' | 'nombres'>('nombres');

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}/empleados`)
      .then((response) => setEmpleados(response.data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const empleadosFiltrados = empleados.filter((empleado) => {
    const estadoCoincide = filtroEstado === 'Todos' || empleado.estado === filtroEstado;
    const cargoCoincide = filtroCargo === 'Todos' || empleado.cargo === filtroCargo;
    return estadoCoincide && cargoCoincide;
  });

  const empleadosOrdenados = empleadosFiltrados.sort((a, b) => {
    if (ordenPor === 'nombres') {
      return orden === 'asc'
        ? a.nombres.localeCompare(b.nombres)
        : b.nombres.localeCompare(a.nombres);
    }
    return orden === 'asc'
      ? a.dni.localeCompare(b.dni)
      : b.dni.localeCompare(a.dni);
  });

  const toggleEstado = (empleadoId: number, estadoActual: string, nombreCompleto: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de ${nuevoEstado === 'Activo' ? 'activar' : 'inactivar'} a ${nombreCompleto}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: () => {
            setLoadingUpdate(empleadoId);
            axios.patch(`${BASE_URL}/empleados/estado/${empleadoId}`, { estado: nuevoEstado })
              .then(() => {
                setEmpleados((prev) =>
                  prev.map((empleado) =>
                    empleado.id === empleadoId ? { ...empleado, estado: nuevoEstado } : empleado
                  )
                );
              })
              .catch((error) => console.error('Error al actualizar el estado:', error))
              .finally(() => setLoadingUpdate(null));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Empleado }) => (
    <View style={styles.tableRow}>
      <Text style={styles.column}>{item.dni}</Text>
      <Text style={styles.column}>{`${item.nombres} ${item.apellidos}`}</Text>
      <Text style={styles.column}>{item.cargo}</Text>
      <Text style={styles.column}>{item.estado}</Text>
      <View style={styles.column}>
        {loadingUpdate === item.id ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: item.estado === 'Activo' ? '#dc3545' : '#28a745' },
            ]}
            onPress={() => toggleEstado(item.id, item.estado, `${item.nombres} ${item.apellidos}`)}
          >
            <Text style={styles.toggleButtonText}>
              {item.estado === 'Activo' ? 'Inactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Empleados</Text>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Filtrar por Estado</Text>
        <Picker
          selectedValue={filtroEstado}
          style={styles.picker}
          onValueChange={(value) => setFiltroEstado(value)}
        >
          <Picker.Item label="Todos" value="Todos" />
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <Text style={styles.filterLabel}>Filtrar por Cargo</Text>
        <Picker
          selectedValue={filtroCargo}
          style={styles.picker}
          onValueChange={(value) => setFiltroCargo(value)}
        >
          <Picker.Item label="Todos" value="Todos" />
          <Picker.Item label="Supervisor" value="Supervisor" />
          <Picker.Item label="Técnico" value="Técnico" />
          <Picker.Item label="Administrador" value="Administrador" />
          <Picker.Item label="Logística" value="Logística" />
        </Picker>

        <Text style={styles.filterLabel}>Ordenar por</Text>
        <Picker
          selectedValue={ordenPor}
          style={styles.picker}
          onValueChange={(value) => setOrdenPor(value)}
        >
          <Picker.Item label="Nombre" value="nombres" />
          <Picker.Item label="DNI" value="dni" />
        </Picker>

        <Text style={styles.filterLabel}>Orden</Text>
        <Picker
          selectedValue={orden}
          style={styles.picker}
          onValueChange={(value) => setOrden(value)}
        >
          <Picker.Item label="Ascendente" value="asc" />
          <Picker.Item label="Descendente" value="desc" />
        </Picker>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.column}>DNI</Text>
        <Text style={styles.column}>Nombre</Text>
        <Text style={styles.column}>Cargo</Text>
        <Text style={styles.column}>Estado</Text>
        <Text style={styles.column}>Acción</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : empleadosOrdenados.length === 0 ? (
        <Text style={styles.note}>No hay empleados en el sistema</Text>
      ) : (
        <FlatList
          data={empleadosOrdenados}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  filters: {
    marginBottom: 15,
  },
  filterLabel: {
    marginTop: 5,
    marginBottom: 2,
    color: '#555',
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  column: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 4,
  },
  note: {
    marginTop: 10,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default ListarEmpleados;
