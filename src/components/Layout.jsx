import { Outlet } from 'react-router-dom'
import SaltarContenido from './SaltarContenido.jsx'
import Encabezado from './Encabezado.jsx'
import Pie from './Pie.jsx'
import BotonAyuda from './BotonAyuda.jsx'

export default function Layout() {
  return (
    <>
      <SaltarContenido />
      <Encabezado />
      <main className="principal" id="principal">
        <div className="contenedor">
          <Outlet />
        </div>
      </main>
      <Pie />
      <BotonAyuda />
    </>
  )
}
