import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    edad: "",
    pais: "",
    cargo: "",
    anios: ""
  });

  const [editar, setEditar] = useState(false);
  const [empleadosList, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar cambios en el formulario
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Editar empleado
  const editarEmpleado = (empleado) => {
    setEditar(true);
    setFormData({
      id: empleado.id,
      nombre: empleado.nombre,
      edad: empleado.edad,
      pais: empleado.pais,
      cargo: empleado.cargo,
      anios: empleado.anios
    });
  };

  // Eliminar empleado con confirmación
  const eliminarEmpleado = async (id, nombre) => {
    // Mostrar cuadro de confirmación
    const confirmarEliminacion = window.confirm(`¿Está seguro que desea eliminar al empleado ${nombre}? Esta acción no se puede deshacer.`);
    
    // Proceder solo si el usuario confirma
    if (confirmarEliminacion) {
      try {
        await axios.delete(`http://localhost:3001/delete/${id}`);
        await getEmpleados();
        alert("Empleado eliminado exitosamente");
      } catch (err) {
        setError("Error al eliminar el empleado");
        console.error("Error al eliminar:", err);
      }
    }
  };

  // Obtener empleados
  const getEmpleados = async () => {
    try {
      const response = await axios.get("http://localhost:3001/empleados");
      setEmpleados(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los empleados");
      console.error("Error al cargar:", err);
    }
  };

  // Cargar empleados al montar el componente
  useEffect(() => {
    getEmpleados();
  }, []);

  // Registrar o actualizar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editar) {
        // Actualizar empleado existente
        await axios.put(`http://localhost:3001/update/${formData.id}`, formData);
        alert("Empleado actualizado exitosamente");
      } else {
        // Crear nuevo empleado
        await axios.post("http://localhost:3001/create", formData);
        alert("Empleado registrado exitosamente");
      }
      
      await getEmpleados(); // Actualizar lista
      resetForm(); // Limpiar formulario
    } catch (err) {
      setError(`Error al ${editar ? 'actualizar' : 'registrar'} el empleado`);
      console.error(`Error al ${editar ? 'actualizar' : 'registrar'}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      id: "",
      nombre: "",
      edad: "",
      pais: "",
      cargo: "",
      anios: ""
    });
    setEditar(false);
  };

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">GESTIÓN DE EMPLEADOS</div>

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {['nombre', 'edad', 'pais', 'cargo', 'anios'].map((field) => (
              <div className="input-group mb-3" key={field}>
                <span className="input-group-text">
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </span>
                <input
                  type={field === 'edad' || field === 'anios' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={`Ingrese ${field === 'anios' ? 'años de experiencia' : field}`}
                  required
                  min={field === 'edad' || field === 'anios' ? "0" : undefined}
                />
              </div>
            ))}
          </div>

          <div className="card-footer text-muted">
            <button type="submit" 
              className={`btn ${editar ? 'btn-warning' : 'btn-success'}`}
              disabled={loading}
            >
              {loading 
                ? (editar ? 'Actualizando...' : 'Registrando...') 
                : (editar ? 'Actualizar' : 'Registrar')
              }
            </button>
            {editar && (
              <button type="button" 
                className="btn btn-secondary ml-2"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Edad</th>
            <th scope="col">País</th>
            <th scope="col">Cargo</th>
            <th scope="col">Experiencia</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosList.map((empleado) => (
            <tr key={empleado.id}>
              <th>{empleado.id}</th>
              <td>{empleado.nombre}</td>
              <td>{empleado.edad}</td>
              <td>{empleado.pais}</td>
              <td>{empleado.cargo}</td>
              <td>{empleado.anios}</td>
              <td>
                <div className="btn-group" role="group" aria-label="Acciones">
                  <button type="button"
                    onClick={() => editarEmpleado(empleado)}
                    className="btn btn-info"
                  >
                    Editar
                  </button>
                  <button type="button" 
                    className="btn btn-danger"
                    onClick={() => eliminarEmpleado(empleado.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;