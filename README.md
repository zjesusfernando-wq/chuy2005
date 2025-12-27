# Árbol Genealógico Familiar

Aplicación web mínima y funcional para capturar información de familiares, guardarla localmente y visualizarla como un árbol genealógico sencillo.

## ¿Qué contiene el proyecto?

- `index.html`: estructura de la página, formularios, tabla y contenedor del árbol.
- `style.css`: estilos con un tema limpio tipo cómic.
- `app.js`: lógica en JavaScript puro para CRUD, guardado local (localStorage), generación del árbol con D3.js y funciones de exportar/importar JSON.

## Requisitos

- macOS (cualquier versión reciente).
- Navegador moderno (Safari, Chrome, Edge o Firefox).
- **Sin backend ni dependencias externas para instalar.**

## Cómo ejecutar la app en macOS

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto en Terminal.
3. Levanta un servidor local (requerido porque el navegador puede bloquear archivos locales):

   ```bash
   python3 -m http.server 8000
   ```

4. Abre tu navegador y visita: [http://localhost:8000](http://localhost:8000)
5. Verás la aplicación lista para usar. Los datos se guardan automáticamente en tu navegador.

> Si deseas cambiar el puerto, ajusta el número al lanzar el servidor y abre la misma dirección con el puerto actualizado.

## Cómo usar

1. **Agregar persona:** completa el formulario y presiona "Guardar persona". El listado se actualiza al instante.
2. **Editar:** en la tabla, pulsa "Editar" para cargar los datos en el formulario, modifica y guarda.
3. **Eliminar:** pulsa "Eliminar" y confirma. Las referencias de padre/madre se limpian automáticamente.
4. **Árbol genealógico:** el diagrama se actualiza cada vez que guardas cambios. Pasa el mouse por un nodo para ver detalles.
5. **Exportar JSON:** botón "Exportar JSON" para descargar tus datos.
6. **Importar JSON:** selecciona un archivo exportado y pulsa "Importar archivo" para cargarlo.

## Notas sobre los datos

- Estructura de cada persona: nombre completo, fechas y lugares de nacimiento/fallecimiento, padre, madre, notas.
- Las relaciones se resuelven por ID al guardar. Si faltan padres, el árbol crea nodos raíz para esas personas.
- Para que el diagrama sea estable, cada persona se ancla a un solo padre en el dibujo (si existe padre se usa primero, si no hay se usa la madre). Aun así, ambos padres aparecen en la tabla y en el tooltip del nodo.
- La información permanece en `localStorage`; no se envía a ningún servidor.

## Preparar para GitHub

- Incluye estos archivos en un repositorio git (`git init` si es nuevo).
- Añade un archivo `.gitignore` si deseas excluir artefactos (no es obligatorio para esta app estática).
- Sube el repo a GitHub con `git remote add origin <url>` y `git push -u origin main`.

## Mejoras futuras sugeridas

- Selector para elegir la persona raíz del árbol o mostrar ramas separadas.
- Validaciones adicionales (evitar bucles padre/madre, campos obligatorios). 
- Soporte para fotos o vínculos a documentos familiares.
- Vista de línea de tiempo y filtrado por ramas.
- Tema oscuro y opciones de personalización de colores.
- Sincronización opcional con un backend ligero (por ejemplo, Supabase o Firebase) para compartir con la familia.
