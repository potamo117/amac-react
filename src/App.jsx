import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import ListadoVacantes from './pages/ListadoVacantes.jsx'
import DetalleVacante from './pages/DetalleVacante.jsx'
import Login from './pages/Login.jsx'
import RegistroCandidato from './pages/RegistroCandidato.jsx'
import MisSolicitudes from './pages/MisSolicitudes.jsx'
import RegistroEmpresa from './pages/RegistroEmpresa.jsx'
import EmpresaVacantes from './pages/EmpresaVacantes.jsx'
import PublicarVacante from './pages/PublicarVacante.jsx'
import SolicitudesRecibidas from './pages/SolicitudesRecibidas.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<ListadoVacantes />} />
        <Route path="/vacante/:id" element={<DetalleVacante />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegistroCandidato />} />
        <Route path="/registro-empresa" element={<RegistroEmpresa />} />

        {/* Solo candidatos */}
        <Route element={<RutaProtegida rol="candidato" />}>
          <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
        </Route>

        {/* Solo empresas */}
        <Route element={<RutaProtegida rol="empresa" />}>
          <Route path="/empresa/vacantes" element={<EmpresaVacantes />} />
          <Route path="/empresa/publicar" element={<PublicarVacante />} />
          <Route path="/empresa/solicitudes" element={<SolicitudesRecibidas />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
