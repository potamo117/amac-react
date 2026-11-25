import Boton from '../components/Boton.jsx'

export default function NoEncontrada() {
  return (
    <section className="cabecera-pagina">
      <h1>Página no encontrada</h1>
      <p className="cabecera-pagina__descripcion">
        La dirección que escribió no existe o la página cambió de lugar.
      </p>
      <p>
        <Boton to="/">Ir a las vacantes</Boton>
      </p>
    </section>
  )
}
