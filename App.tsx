import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Pantallas
import Dashboard from './screens/Dashboard';

// Empleados
import ListarEmpleados from './screens/EmployeeManagement/ListarEmpleados';
import RegistrarEmpleado from './screens/EmployeeManagement/RegistrarEmpleado';
import ActualizarEmpleado from './screens/EmployeeManagement/BuscarEmpleado';
import GestionarEmpleados from './screens/EmployeeManagement/GestionarEmpleados';
import BuscarEmpleado from './screens/EmployeeManagement/BuscarEmpleado';

// Usuarios
import RegistrarUsuario from './screens/UserManagement/RegistrarUsuario';
import ListarUsuarios from './screens/UserManagement/ListarUsuarios';
import GestionarUsuarios from './screens/UserManagement/GestionarUsuarios';
import ActualizarUsuario from './screens/UserManagement/ActualizarUsuario';

// Clientes
import GestionarClientes from './screens/ClientManagement/GestionarClientes';
import RegistrarClientes from './screens/ClientManagement/RegistrarClientes';
import ListarClientes from './screens/ClientManagement/ListarClientes';
import ActualizarCliente from './screens/ClientManagement/ActualizarCliente';

// Productos
import GestionarProductos from './screens/ProductManagement/GestionarProductos';
import RegistrarProducto from './screens/ProductManagement/RegistrarProductos';
import VisualizarCatalogo from './screens/ProductManagement/VisualizarCatalogo';
import ImportarProductos from './screens/ProductManagement/ImportarProductos';
import EditarProducto from './screens/ProductManagement/EditarProducto';

// Solicitudes
import GestionarSolicitudes from './screens/RequestManagement/GestionarSolicitudes';
import RegistrarSolicitud from './screens/RequestManagement/RegistrarSolicitud';
import AgregarProductos from './screens/RequestManagement/AgregarProductos';
import EditarSolicitud from './screens/RequestManagement/EditarSolicitud';
import VisualizarSolicitudes from './screens/RequestManagement/VisualizarSolicitudes';
import HistorialSolicitudes from './screens/RequestManagement/HistorialSolicitudes';
import DetalleSolicitud from './screens/RequestManagement/DetalleSolicitud'; // ✅ Nueva

import Login from './screens/Login';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;

  // Empleados
  ListarEmpleados: undefined;
  RegistrarEmpleado: undefined;
  ActualizarEmpleado: { id: number };
  VerEmpleado: { id: number };
  GestionarEmpleados: undefined;
  BuscarEmpleado: undefined;

  // Usuarios
  RegistrarUsuario: undefined;
  ListarUsuarios: undefined;
  GestionarUsuarios: undefined;
  ActualizarUsuario: { id: number };

  // Clientes
  GestionarClientes: undefined;
  RegistrarClientes: undefined;
  ListarClientes: undefined;
  ActualizarCliente: { id: number };

  // Productos
  GestionarProductos: undefined;
  RegistrarProducto: undefined;
  VisualizarCatalogo: undefined;
  ImportarProductos: undefined;
  EditarProducto: { codigo: string };

  // Solicitudes
  GestionarSolicitudes: undefined;
  RegistrarSolicitud: undefined;
  AgregarProductos: { solicitud_id: number };
  EditarSolicitud: { solicitud_id: number };
  VisualizarSolicitudes: undefined;
  HistorialSolicitudes: undefined;
  DetalleSolicitud: { solicitud_id: number }; // ✅ Nueva
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ title: 'Grupo Bax' }} />
        <Stack.Screen name="Dashboard"component={Dashboard}options={{ headerShown: false }} />

        {/* Empleados */}
        <Stack.Screen name="GestionarEmpleados" component={GestionarEmpleados} options={{ title: 'Gestionar Empleados' }} />
        <Stack.Screen name="ListarEmpleados" component={ListarEmpleados} options={{ title: 'Ver Empleados' }} />
        <Stack.Screen name="RegistrarEmpleado" component={RegistrarEmpleado} options={{ title: 'Registrar Empleado' }} />
        <Stack.Screen name="ActualizarEmpleado" component={ActualizarEmpleado} options={{ title: 'Actualizar Empleado' }} />
        <Stack.Screen name="BuscarEmpleado" component={BuscarEmpleado} options={{ title: 'Buscar Empleado' }} />

        {/* Usuarios */}
        <Stack.Screen name="GestionarUsuarios" component={GestionarUsuarios} options={{ title: 'Gestionar Usuarios' }} />
        <Stack.Screen name="RegistrarUsuario" component={RegistrarUsuario} options={{ title: 'Registrar Usuario' }} />
        <Stack.Screen name="ListarUsuarios" component={ListarUsuarios} options={{ title: 'Ver Usuarios' }} />
        <Stack.Screen name="ActualizarUsuario" component={ActualizarUsuario} options={{ title: 'Actualizar Usuario' }} />

        {/* Clientes */}
        <Stack.Screen name="GestionarClientes" component={GestionarClientes} options={{ title: 'Gestionar Clientes' }} />
        <Stack.Screen name="RegistrarClientes" component={RegistrarClientes} options={{ title: 'Registrar Cliente' }} />
        <Stack.Screen name="ListarClientes" component={ListarClientes} options={{ title: 'Ver Clientes' }} />
        <Stack.Screen name="ActualizarCliente" component={ActualizarCliente} options={{ title: 'Actualizar Cliente' }} />

        {/* Productos */}
        <Stack.Screen name="GestionarProductos" component={GestionarProductos} options={{ title: 'Gestionar Productos' }} />
        <Stack.Screen name="RegistrarProducto" component={RegistrarProducto} options={{ title: 'Registrar Producto' }} />
        <Stack.Screen name="VisualizarCatalogo" component={VisualizarCatalogo} options={{ title: 'Catálogo de Productos' }} />
        <Stack.Screen name="ImportarProductos" component={ImportarProductos} options={{ title: 'Importar Productos' }} />
        <Stack.Screen name="EditarProducto" component={EditarProducto} options={{ title: 'Editar Producto' }} />

        {/* Solicitudes */}
        <Stack.Screen name="GestionarSolicitudes" component={GestionarSolicitudes} options={{ title: 'Gestionar Solicitudes' }} />
        <Stack.Screen name="RegistrarSolicitud" component={RegistrarSolicitud} options={{ title: 'Registrar Solicitud' }} />
        <Stack.Screen name="AgregarProductos" component={AgregarProductos} options={{ title: 'Agregar Productos a Solicitud' }} />
        <Stack.Screen name="EditarSolicitud" component={EditarSolicitud} options={{ title: 'Editar Solicitud' }} />
        <Stack.Screen name="VisualizarSolicitudes" component={VisualizarSolicitudes} options={{ title: 'Visualizar Solicitudes' }} />
        <Stack.Screen name="HistorialSolicitudes" component={HistorialSolicitudes} options={{ title: 'Historial de Solicitudes' }} />
        <Stack.Screen name="DetalleSolicitud" component={DetalleSolicitud} options={{ title: 'Detalle de Solicitud' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
