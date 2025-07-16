import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Button, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import axios from 'axios';
import { BASE_URL } from '../conexion';
import * as WebBrowser from 'expo-web-browser';

type DetalleSolicitudRouteProp = RouteProp<RootStackParamList, 'DetalleSolicitud'>;

const DetalleSolicitud = () => {
  const route = useRoute<DetalleSolicitudRouteProp>();
  const { solicitud_id } = route.params;

  const [detalle, setDetalle] = useState<any[]>([]);
  const [estado, setEstado] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/solicitudes/${solicitud_id}`);

        if (!res.data || typeof res.data !== 'object') {
          throw new Error('Estructura inesperada');
        }

        setEstado(res.data.estado || '');
        setDetalle(Array.isArray(res.data.detalles) ? res.data.detalles : []);
      } catch (error) {
        console.error('❌ Error al obtener solicitud:', error);
        Alert.alert('Error', 'No se pudo obtener el detalle de la solicitud.');
      } finally {
        setLoading(false);
      }
    };

    obtenerDetalle();
  }, [solicitud_id]);

  const abrirPDFSolicitud = async () => {
    const url = `${BASE_URL}/api/solicitudes/${solicitud_id}/pdf`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF de la solicitud.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Text style={styles.label}>
        Producto: <Text style={styles.value}>{item.nombre}</Text>
      </Text>
      <Text style={styles.label}>
        Cantidad: <Text style={styles.value}>{item.cantidad}</Text>
      </Text>
      <Text style={styles.label}>
        Observación: <Text style={styles.value}>{item.observacion || '—'}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de Solicitud #{solicitud_id}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.label}>
              Estado: <Text style={styles.value}>{estado || 'Desconocido'}</Text>
            </Text>
          </View>

          {detalle.length === 0 ? (
            <Text style={styles.noData}>Esta solicitud no tiene productos registrados.</Text>
          ) : (
            <FlatList
              data={detalle}
              keyExtractor={(item) => (item.detalle_id ? item.detalle_id.toString() : Math.random().toString())}
              renderItem={renderItem}
            />
          )}

          {estado && (
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.fullWidthButton} onPress={abrirPDFSolicitud}>
              <Text style={styles.buttonText}>Ver PDF de Solicitud</Text>
            </TouchableOpacity>
          </View>
          
          )}
        </>
      )}
    </View>
  );
};

export default DetalleSolicitud;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
  },
  value: {
    fontWeight: 'normal',
    color: '#000',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  noData: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontSize: 16,
  },
  
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  
  fullWidthButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
  
  
});
