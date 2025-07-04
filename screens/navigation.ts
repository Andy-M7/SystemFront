export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;

  // Empleados
  GestionarEmpleados: undefined;
  ListarEmpleados: undefined;
  RegistrarEmpleado: undefined;

  // Clientes
  GestionarClientes: undefined;
  RegistrarClientes: undefined;
  ListarClientes: undefined;
  ActualizarCliente: { id: number };

  // Usuarios
  GestionarUsuarios: undefined;
  ListarUsuarios: undefined;
  RegistrarUsuario: undefined;
  ActualizarUsuario: { id: number };

  //Productos
 
  ImportarProductos: undefined;
  GestionarProductos: undefined;
  RegistrarProducto: undefined;
  VisualizarCatalogo: undefined;
  EditarProducto: { codigo: string };

};
