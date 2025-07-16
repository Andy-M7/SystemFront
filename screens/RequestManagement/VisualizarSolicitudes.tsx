import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { RootStackParamList } from '../navigation';
import axios from 'axios';
import { BASE_URL } from '../conexion'; // ✅ Importar la URL centralizada

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VisualizarSolicitudes'
>;

interface Solicitud {
  id: number;
  cliente: string;
  fecha: string;
  estado: string;
  version: number;
}

const VisualizarSolicitudes = () => {
  const navigation = useNavigation<NavigationProp>();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);

  
  const obtenerSolicitudes = async () => {
    try {
      setLoading(true);
      const usuarioData = await AsyncStorage.getItem('usuario');

      if (!usuarioData) {
        Alert.alert('Error', 'No se encontró sesión activa.');
        return;
      }

      const usuario = JSON.parse(usuarioData);
      if (!usuario.id) {
        Alert.alert('Error', 'Usuario inválido.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/solicitudes/usuario/${usuario.id}`);
      setSolicitudes(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      obtenerSolicitudes();
    }, [])
  );
  
  // 👇 Agrega este bloque aquí mismo
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault(); // Detiene la acción predeterminada
      navigation.navigate('GestionarSolicitudes'); // Redirige a una pantalla fija
    });
  
    return unsubscribe; // Limpia el listener
  }, [navigation]);
  
  

  const filtrarSolicitudes = () => {
    return solicitudes.filter((s) => {
      const clienteMatch = s.cliente?.toLowerCase().includes(filtroCliente.toLowerCase());
      const estadoMatch = s.estado?.toLowerCase().includes(filtroEstado.toLowerCase());
      const fechaMatch = s.fecha?.includes(filtroFecha);
      return clienteMatch && estadoMatch && fechaMatch;
    });
  };

  const renderItem = ({ item }: { item: Solicitud }) => (
    <View style={styles.card}>
      <Text style={styles.label}>ID: <Text style={styles.value}>{item.id}</Text></Text>
      <Text style={styles.label}>Cliente: <Text style={styles.value}>{item.cliente}</Text></Text>
      <Text style={styles.label}>Fecha: <Text style={styles.value}>{item.fecha}</Text></Text>
      <Text style={styles.label}>Estado: <Text style={styles.value}>{item.estado}</Text></Text>
      <Text style={styles.label}>Versión: <Text style={styles.value}>{item.version}</Text></Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate('DetalleSolicitud', { solicitud_id: item.id })}
        >
          <Text style={styles.buttonText}>Ver</Text>
        </TouchableOpacity>

        {item.estado === 'Pendiente' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => navigation.navigate('EditarSolicitud', { solicitud_id: item.id })}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => navigation.navigate('AgregarProductos', { solicitud_id: item.id })}
            >
              <Text style={styles.buttonText}>Agregar Productos</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filtrar por Cliente:</Text>
      <TextInput
        placeholder="Nombre de Cliente"
        value={filtroCliente}
        onChangeText={setFiltroCliente}
        style={styles.input}
      />


      <Text style={styles.label}>Filtrar por Estado:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filtroEstado}
          onValueChange={(itemValue) => setFiltroEstado(itemValue)}
          style={styles.picker}
          dropdownIconColor="#007AFF" // Para Android
        >
          <Picker.Item label="Todos los estados" value="" />
          <Picker.Item label="Pendiente" value="pendiente" />
          <Picker.Item label="Enviada" value="enviada" />
          <Picker.Item label="Aprobada" value="aprobada" />
          <Picker.Item label="Rechazada" value="rechazada" />
        </Picker>
      </View>




      <Text style={styles.label}>Filtrar por Fecha:</Text>
        <TouchableOpacity
          onPress={() => setMostrarCalendario(true)}
          style={styles.input}
        >
          <Text>{fechaSeleccionada ? fechaSeleccionada.toISOString().split('T')[0] : 'Seleccionar fecha'}</Text>
        </TouchableOpacity>

        {mostrarCalendario && (
          <DateTimePicker
            value={fechaSeleccionada || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setMostrarCalendario(false);
              if (selectedDate) {
                setFechaSeleccionada(selectedDate);
                setFiltroFecha(selectedDate.toISOString().split('T')[0]); // actualiza el filtro real
              }
            }}
          />
        )}


  
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : filtrarSolicitudes().length === 0 ? (
        <Text style={styles.noData}>Aún no ha registrado ninguna solicitud</Text>
      ) : (
        <FlatList
          data={filtrarSolicitudes()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default VisualizarSolicitudes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48, // ← asegura altura igual al picker
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    justifyContent: 'center', // centra el texto verticalmente
  },  
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  label: {
    marginTop: 5,
    marginBottom: 2,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontWeight: 'normal',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 10,
    marginTop: 8,
  },
  viewButton: {
    backgroundColor: '#007AFF',
  },
  editButton: {
    backgroundColor: '#FF9500',
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    height: 48, // espacio suficiente para el texto
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  
  picker: {
    width: '100%',
    height: '100%',
    color: '#000', // asegúrate que el texto sea visible
  },
  
});
