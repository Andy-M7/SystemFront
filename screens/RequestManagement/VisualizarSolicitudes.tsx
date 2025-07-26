import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { RootStackParamList } from '../navigation';
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '../conexion';

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
  const [enviando, setEnviando] = useState<number | null>(null);

  // Dropdown
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Enviada', value: 'enviada' },
    { label: 'Aprobada', value: 'aprobada' },
    { label: 'Rechazada', value: 'rechazada' },
  ]);

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
      const axiosError = error as AxiosError;
      const msg =
        (axiosError.response?.data as any)?.error?.toString() ||
        JSON.stringify(axiosError.response?.data) ||
        'No se pudieron cargar las solicitudes.';
      Alert.alert('Error', msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      obtenerSolicitudes();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      navigation.navigate('GestionarSolicitudes');
    });
    return unsubscribe;
  }, [navigation]);

  const filtrarSolicitudes = () => {
    return solicitudes.filter((s) => {
      const clienteMatch = s.cliente?.toLowerCase().includes(filtroCliente.toLowerCase());
      const estadoMatch = s.estado?.toLowerCase().includes(filtroEstado.toLowerCase());
      const fechaMatch = s.fecha?.includes(filtroFecha);
      return clienteMatch && estadoMatch && fechaMatch;
    });
  };

  const enviarALogistica = async (id: number) => {
    Alert.alert(
      'Enviar a Logística',
      '¿Está seguro que desea enviar esta solicitud a Logística?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          style: 'destructive',
          onPress: async () => {
            setEnviando(id);
            try {
              await axios.post(`${BASE_URL}/api/solicitudes/${id}/enviar_logistica`);
              await obtenerSolicitudes();
              Alert.alert('Enviado', 'La solicitud fue enviada a logística.');
            } catch (error) {
              const axiosError = error as AxiosError;
              const msg =
                (axiosError.response?.data as any)?.error?.toString() ||
                JSON.stringify(axiosError.response?.data) ||
                'No se pudo enviar.';
              Alert.alert('Error', msg);
              console.error(error);
            } finally {
              setEnviando(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Solicitud }) => {
    const estadoLower = item.estado?.toLowerCase();
    const enviada = estadoLower === 'enviada' || estadoLower === 'aprobada' || estadoLower === 'rechazada';

    return (
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
          {!enviada && (
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
          <TouchableOpacity
            style={[
              styles.button,
              styles.sendButton,
              enviada && styles.buttonEnviado,
              enviando === item.id && { backgroundColor: '#bbb' },
            ]}
            disabled={enviada || enviando === item.id}
            onPress={() => {
              if (!enviada) enviarALogistica(item.id);
            }}
          >
            <Text style={styles.sendIcon}>
              {enviando === item.id
                ? "⏳"
                : enviada
                ? "🚚"
                : "📤"}
            </Text>
            <Text style={styles.buttonText}>
              {enviando === item.id
                ? 'Enviando...'
                : enviada
                ? 'Solicitud ya fue enviada'
                : 'Enviar a Logística'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      <DropDownPicker
        open={open}
        value={filtroEstado}
        items={items}
        setOpen={setOpen}
        setValue={setFiltroEstado}
        setItems={setItems}
        style={styles.dropdown}
        dropDownContainerStyle={{ borderColor: '#ccc' }}
        placeholder="Selecciona estado"
        zIndex={1000}
      />

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
              setFiltroFecha(selectedDate.toISOString().split('T')[0]);
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
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    justifyContent: 'center',
  },
  dropdown: {
    marginBottom: 10,
    borderColor: '#ccc',
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
    alignItems: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  sendButton: {
    backgroundColor: '#6c63ff',
  },
  buttonEnviado: {
    backgroundColor: '#cccccc',
  },
  sendIcon: {
    fontSize: 21,
    marginRight: 6,
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
});
