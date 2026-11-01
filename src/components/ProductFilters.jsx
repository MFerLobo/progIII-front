import { useState } from 'react';

import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';

import styles from './ProductFilters.module.css';

function ProductFilters({
  filtros,
  categorias,
  marcas,
  onChange,
  onAplicar,
  onLimpiar
}) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  return (
    <section className={styles.filtersSection}>

      {/* BOTÓN DESPLEGABLE */}
      <button
        type="button"
        className={styles.filtersToggle}
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        aria-expanded={mostrarFiltros}
        aria-controls="panel-filtros"
      >
        <span className={styles.toggleTitle}>
          <SlidersHorizontal size={20} />
          Filtrar productos
        </span>

        <ChevronDown
          size={20}
          className={
            mostrarFiltros
              ? styles.chevronOpen
              : styles.chevron
          }
        />
      </button>

      {/* PANEL DE FILTROS */}
      <div
        id="panel-filtros"
        className={styles.filtersPanel}
        hidden={!mostrarFiltros}
      >

        <form
          onSubmit={onAplicar}
          className={styles.filtersForm}
        >

          {/* BUSCADOR */}
          <div className={styles.searchBox}>
            <Search size={19} />

            <input
              type="search"
              name="q"
              placeholder="Buscar por nombre, descripción o SKU..."
              value={filtros.q}
              onChange={onChange}
            />
          </div>

          <div className={styles.filtersGrid}>

            {/* CATEGORÍA */}
            <div className={styles.filterGroup}>
              <label htmlFor="categoria">
                Categoría
              </label>

              <select
                id="categoria"
                name="categoria"
                value={filtros.categoria}
                onChange={onChange}
              >
                <option value="">
                  Todas las categorías
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria._id}
                    value={categoria._id}
                  >
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* MARCA */}
            <div className={styles.filterGroup}>
              <label htmlFor="marca">
                Marca
              </label>

              <select
                id="marca"
                name="marca"
                value={filtros.marca}
                onChange={onChange}
              >
                <option value="">
                  Todas las marcas
                </option>

                {marcas.map((marca) => (
                  <option
                    key={marca._id}
                    value={marca._id}
                  >
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* PRECIO MÍNIMO */}
            <div className={styles.filterGroup}>
              <label htmlFor="minPrecio">
                Precio mínimo
              </label>

              <input
                id="minPrecio"
                type="number"
                name="minPrecio"
                placeholder="$ 0"
                min="0"
                value={filtros.minPrecio}
                onChange={onChange}
              />
            </div>

            {/* PRECIO MÁXIMO */}
            <div className={styles.filterGroup}>
              <label htmlFor="maxPrecio">
                Precio máximo
              </label>

              <input
                id="maxPrecio"
                type="number"
                name="maxPrecio"
                placeholder="Sin límite"
                min="0"
                value={filtros.maxPrecio}
                onChange={onChange}
              />
            </div>

          </div>

          {/* STOCK Y ACCIONES */}
          <div className={styles.filtersBottom}>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="enStock"
                checked={filtros.enStock}
                onChange={onChange}
              />
              Solo productos disponibles
            </label>

            <div className={styles.filterActions}>

              <button
                type="button"
                onClick={onLimpiar}
                className={styles.clearButton}
              >
                <X size={17} />
                Limpiar
              </button>

              <button
                type="submit"
                className={styles.applyButton}
              >
                Aplicar filtros
              </button>

            </div>
          </div>

        </form>
      </div>
    </section>
  );
}

export default ProductFilters;
