import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '../conexion';
import * as WebBrowser from 'expo-web-browser';

type DetalleSolicitudRouteProp = RouteProp<RootStackParamList, 'DetalleSolicitud'>;

const DetalleSolicitud = () => {
  const route = useRoute<DetalleSolicitudRouteProp>();
  const { solicitud_id } = route.params;

  const [detalle, setDetalle] = useState<any[]>([]);
  const [estado, setEstado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [pdfDisponible, setPdfDisponible] = useState(false);

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/solicitudes/${solicitud_id}`);
        setEstado(res.data.estado || '');
        setDetalle(Array.isArray(res.data.detalles) ? res.data.detalles : []);

        // HEAD para saber si el PDF existe
        try {
          await axios.head(`${BASE_URL}/pdfs/solicitud_${solicitud_id}.pdf`);
          setPdfDisponible(true);
        } catch (error) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            // Llega error HTTP (404 por ejemplo)
            console.warn('HEAD PDF status:', axiosError.response.status);
          } else if (axiosError.message) {
            // Error de red u otro
            console.warn('HEAD PDF error:', axiosError.message);
          } else {
            console.warn('HEAD PDF desconocido:', error);
          }
          setPdfDisponible(false);
        }

      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Error GET detalle:', axiosError.response.status, axiosError.response.data);
        } else if (axiosError.message) {
          console.error('Error GET detalle:', axiosError.message);
        } else {
          console.error('Error GET detalle:', error);
        }
        Alert.alert('Error', 'No se pudo obtener el detalle de la solicitud.');
      } finally {
        setLoading(false);
      }
    };
    obtenerDetalle();
  }, [solicitud_id]);

  // ------- FUNCIONES PDF -------
  const generarPDFSolicitud = async () => {
    setGenerando(true);
    try {
      await axios.post(`${BASE_URL}/api/solicitudes/${solicitud_id}/generar_pdf`);
      setPdfDisponible(true);
      Alert.alert(
        'PDF generado',
        'El PDF fue generado exitosamente.',
        [
          { text: 'OK' },
          { text: 'Ver ahora', onPress: () => verPDFSolicitud() }
        ]
      );
    } catch (error) {
      setPdfDisponible(false);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        Alert.alert('Error', `No se pudo generar el PDF (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.message) {
        Alert.alert('Error', `No se pudo generar el PDF. Detalle: ${axiosError.message}`);
      } else {
        Alert.alert('Error', 'No se pudo generar el PDF. Error desconocido.');
      }
    } finally {
      setGenerando(false);
    }
  };

  const verPDFSolicitud = async () => {
    const url = `${BASE_URL}/pdfs/solicitud_${solicitud_id}.pdf`;
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
              keyExtractor={(item) =>
                item.detalle_id ? item.detalle_id.toString() : Math.random().toString()
              }
              renderItem={renderItem}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.fullWidthButton, generando && { backgroundColor: '#999' }]}
              onPress={generarPDFSolicitud}
              disabled={generando}
            >
              <Text style={styles.buttonText}>{generando ? 'Generando PDF...' : 'Generar PDF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fullWidthButton,
                { marginTop: 15, backgroundColor: pdfDisponible ? '#007AFF' : '#aaa' },
              ]}
              onPress={verPDFSolicitud}
              disabled={!pdfDisponible}
            >
              <Text style={styles.buttonText}>Ver/Descargar PDF</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default DetalleSolicitud;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  header: { marginBottom: 16, backgroundColor: '#fff', padding: 16, borderRadius: 10, elevation: 2 },
  label: { fontWeight: 'bold', color: '#444' },
  value: { fontWeight: 'normal', color: '#000' },
  productCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
  noData: { textAlign: 'center', color: '#777', marginTop: 20, fontSize: 16 },
  buttonContainer: { marginTop: 20, paddingHorizontal: 20 },
  fullWidthButton: { width: '100%', backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
