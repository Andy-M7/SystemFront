import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type GestionarLogisticaNavigationProp = StackNavigationProp<RootStackParamList, 'GestionarLogistica'>;

interface Props {
  navigation: GestionarLogisticaNavigationProp;
}

const GestionarLogistica: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Logística</Text>

      {/* SDSM-40: Visualizar Solicitudes pendientes */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VisualizarSolicitudes')}
      >
        <Ionicons name="document-text-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Visualizar Solicitudes Pendientes</Text>
      </TouchableOpacity>

      {/* SDSM-42: Editar solicitud (ajuste de cantidades) */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EditarSolicitud', { solicitud_id: 0 })} // Parámetro temporal
      >
        <Ionicons name="create-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Editar Solicitud (Ajuste de Cantidades)</Text>
      </TouchableOpacity>

      {/* SDSM-41: Cambiar estado de solicitud */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VisualizarSolicitudes')}
      >
        <Ionicons name="swap-horizontal-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Cambiar Estado de Solicitud</Text>
      </TouchableOpacity>

      {/* SDSM-44: Filtrar solicitudes */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VisualizarSolicitudes')}
      >
        <Ionicons name="funnel-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Filtrar Solicitudes (Cliente/Fecha/Estado)</Text>
      </TouchableOpacity>

      {/* SDSM-43: Generar reporte por estado */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HistorialSolicitudes')}
      >
        <Ionicons name="bar-chart-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Generar Reporte por Estado</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#20B2AA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '90%',
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GestionarLogistica;
