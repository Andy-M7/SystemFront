import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../conexion';

type Solicitud = {
  id: number;
  cliente: string;
  fecha: string;            // Fecha de envío a logística
  estado: string;
  // Otros campos que tengas si quieres
};

type ResumenEstado = {
  estado: string;
  cantidad: number;
  ultimaFecha: string | null;
};

const ESTADOS = [
  { value: 'Enviada', label: 'Enviada' },
  { value: 'Aprobada', label: 'Aprobada' },
  { value: 'Rechazada', label: 'Rechazada' },
];

const GenerarReporteEstado: React.FC = () => {
  const [estado, setEstado] = useState<string>('Enviada');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [resumenes, setResumenes] = useState<ResumenEstado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Formatea cualquier fecha ISO a una cadena legible
  const formatFecha = (fechaIso?: string | null) => {
    if (!fechaIso) return '-';
    const d = new Date(fechaIso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  // Carga todas las solicitudes sin filtro para obtener resumen completo
  const cargarSolicitudesTodas = async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${BASE_URL}/api/solicitudes/logistica`;
      const resp = await fetch(url);
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Error al obtener solicitudes');
      }
      const data: Solicitud[] = await resp.json();
      setSolicitudes(data);
      calcularResumenes(data);
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      setSolicitudes([]);
      setResumenes([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcula resumen por estado basándose en la fecha de envío y cantidad
  const calcularResumenes = (datos: Solicitud[]) => {
    const resumenMap: Record<string, { cantidad: number; ultimaFecha: string | null }> = {};

    datos.forEach((s) => {
      if (!resumenMap[s.estado]) {
        resumenMap[s.estado] = { cantidad: 0, ultimaFecha: null };
      }
      resumenMap[s.estado].cantidad++;
      if (
        !resumenMap[s.estado].ultimaFecha ||
        new Date(s.fecha) > new Date(resumenMap[s.estado].ultimaFecha!)
      ) {
        resumenMap[s.estado].ultimaFecha = s.fecha;
      }
    });

    const resumenesArray: ResumenEstado[] = ESTADOS.map((e) => ({
      estado: e.value,
      cantidad: resumenMap[e.value]?.cantidad || 0,
      ultimaFecha: resumenMap[e.value]?.ultimaFecha || null,
    }));

    setResumenes(resumenesArray);
  };

  // Carga datos al montar el componente
  useEffect(() => {
    cargarSolicitudesTodas();
  }, []);

  // Filtra solicitudes para el estado seleccionado
  const solicitudesFiltradas = solicitudes.filter((s) => s.estado === estado);

  // Siempre muestra la fecha de envío ('fecha') en el detalle inferior
  const obtenerFechaRelevante = (sol: Solicitud) => {
    return formatFecha(sol.fecha);
  };

  // Renderiza cada fila detalle con id, cliente y fecha de envío
  const renderDetalleItem = ({ item }: { item: Solicitud }) => (
    <View style={styles.detalleRow}>
      <Text style={styles.detalleCell}>{item.id}</Text>
      <Text style={[styles.detalleCell, { flex: 2 }]} numberOfLines={1}>{item.cliente}</Text>
      <Text style={[styles.detalleCell, { flex: 2 }]}>{obtenerFechaRelevante(item)}</Text>
    </View>
  );

  // Resumen filtrado para mostrar totales y última fecha
  const resumenSeleccionado = resumenes.find((r) => r.estado === estado);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Solicitudes por Estado</Text>

      {/* Tabla resumen general */}
      <View style={styles.resumenTabla}>
        <View style={[styles.tablaRow, styles.tablaHeaderRow]}>
          <Text style={[styles.celda, styles.celdaTitulo]}>Estado</Text>
          <Text style={[styles.celda, styles.celdaTitulo]}>Cantidad</Text>
          <Text style={[styles.celda, styles.celdaTitulo]}>Última Fecha</Text>
        </View>

        {resumenes.length === 0 && !loading && (
          <Text style={{ textAlign: 'center', padding: 10 }}>No hay datos disponibles</Text>
        )}

        {resumenes.map((res) => (
          <View
            key={res.estado}
            style={[styles.tablaRow, res.estado === estado && styles.filaSeleccionada]}
          >
            <Text style={styles.celda}>{res.estado}</Text>
            <Text style={styles.celda}>{res.cantidad}</Text>
            <Text style={styles.celda}>{res.ultimaFecha ? formatFecha(res.ultimaFecha) : '-'}</Text>
          </View>
        ))}
      </View>

      {/* Selector de estado */}
      <Picker
        selectedValue={estado}
        style={styles.picker}
        onValueChange={setEstado}
        mode="dropdown"
      >
        {ESTADOS.map((e) => (
          <Picker.Item key={e.value} label={e.label} value={e.value} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#1ABC9C" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !resumenSeleccionado || resumenSeleccionado.cantidad === 0 ? (
        <Text style={styles.mensajeVacio}>No hay solicitudes para el estado seleccionado.</Text>
      ) : (
        <>
          <View style={styles.detalleResumenBox}>
            <Text style={styles.resumenText}>
              Cantidad total: {resumenSeleccionado.cantidad}
            </Text>
            <Text style={styles.resumenText}>
              Última fecha en solicitudes:{' '}
              {resumenSeleccionado.ultimaFecha ? formatFecha(resumenSeleccionado.ultimaFecha) : '-'}
            </Text>
          </View>

          {/* Tabla detalle solicitudes filtradas */}
          <View style={[styles.resumenTabla, { marginTop: 16 }]}>
            <View style={[styles.tablaRow, styles.tablaHeaderRow]}>
              <Text style={[styles.detalleCell, styles.celdaTitulo]}>ID</Text>
              <Text style={[styles.detalleCell, styles.celdaTitulo, { flex: 2 }]}>Cliente</Text>
              <Text style={[styles.detalleCell, styles.celdaTitulo, { flex: 2 }]}>Fecha de Envío</Text>
            </View>
            <FlatList
              data={solicitudesFiltradas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderDetalleItem}
              style={{ maxHeight: 300 }}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, color: '#222' },
  resumenTabla: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  tablaRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tablaHeaderRow: {
    backgroundColor: '#007AFF',
  },
  celda: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  celdaTitulo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filaSeleccionada: {
    backgroundColor: '#cce5ff',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginVertical: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  mensajeVacio: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  detalleResumenBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  resumenText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#444',
  },
  detalleRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f7fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  detalleCell: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
});

export default GenerarReporteEstado;
