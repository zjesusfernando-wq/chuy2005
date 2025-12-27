// Aplicación simple para gestionar un árbol genealógico en el navegador.
// Los datos se guardan en localStorage y se pueden exportar/importar como JSON.

const storageKey = "familyTreePeople";
const form = document.querySelector("#personForm");
const peopleTableBody = document.querySelector("#peopleTable tbody");
const fatherSelect = form.elements.fatherId;
const motherSelect = form.elements.motherId;
const formTitle = document.querySelector("#formTitle");
const submitButton = document.querySelector("#submitButton");
const resetButton = document.querySelector("#resetButton");
const exportButton = document.querySelector("#exportButton");
const importButton = document.querySelector("#importButton");
const importFile = document.querySelector("#importFile");

let people = [];
let editingId = null;

// Datos de ejemplo para que el usuario vea la app funcionando desde el inicio.
const demoData = [
  {
    id: "1",
    fullName: "Juana Pérez",
    birthDate: "1948-05-12",
    birthPlace: "Lima, Perú",
    deathDate: "",
    deathPlace: "",
    fatherId: "",
    motherId: "",
    notes: "Le encantaba pintar y preparar postres." 
  },
  {
    id: "2",
    fullName: "Carlos Ruiz",
    birthDate: "1945-10-03",
    birthPlace: "Cusco, Perú",
    deathDate: "",
    deathPlace: "",
    fatherId: "",
    motherId: "",
    notes: "Mecánico y fanático del fútbol." 
  },
  {
    id: "3",
    fullName: "María Ruiz Pérez",
    birthDate: "1975-02-20",
    birthPlace: "Arequipa, Perú",
    deathDate: "",
    deathPlace: "",
    fatherId: "2",
    motherId: "1",
    notes: "Doctora, primera de su promoción." 
  },
];

// Carga inicial desde localStorage o con datos demo.
function loadPeople() {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    people = JSON.parse(raw);
    return;
  }
  people = demoData;
  savePeople();
}

function savePeople() {
  localStorage.setItem(storageKey, JSON.stringify(people));
}

// Crea un id simple basado en tiempo para nuevos registros.
function createId() {
  return String(Date.now());
}

function clearForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Agregar persona";
  submitButton.textContent = "Guardar persona";
}

function fillSelect(select) {
  // Borra opciones antiguas y deja la opción vacía.
  select.innerHTML = "<option value=''> (Ninguno) </option>";
  people.forEach((person) => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = person.fullName;
    select.appendChild(option);
  });
}

function renderSelects() {
  fillSelect(fatherSelect);
  fillSelect(motherSelect);
}

// Despliega la tabla de personas guardadas.
function renderTable() {
  peopleTableBody.innerHTML = "";
  if (people.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan='5' class='empty'>Aún no hay personas cargadas.</td>";
    peopleTableBody.appendChild(row);
    return;
  }

  people.forEach((person) => {
    const father = people.find((p) => p.id === person.fatherId);
    const mother = people.find((p) => p.id === person.motherId);

    const row = document.createElement("tr");
    const birthInfo = person.birthDate
      ? `${person.birthDate}${person.birthPlace ? ` · ${person.birthPlace}` : ""}`
      : person.birthPlace || "-";

    row.innerHTML = `
      <td><strong>${person.fullName}</strong></td>
      <td>${birthInfo || "-"}</td>
      <td>
        <div class="chip">Padre: ${father ? father.fullName : "—"}</div><br />
        <div class="chip">Madre: ${mother ? mother.fullName : "—"}</div>
      </td>
      <td>${person.notes ? person.notes : "-"}</td>
      <td>
        <button class="ghost" data-edit="${person.id}">Editar</button>
        <button class="primary" data-delete="${person.id}">Eliminar</button>
      </td>
    `;
    peopleTableBody.appendChild(row);
  });
}

// Convierte la lista plana en una estructura jerárquica para D3.
function buildHierarchy() {
  const nodeMap = new Map();
  const hasParent = new Set();

  people.forEach((person) => {
    nodeMap.set(person.id, { ...person, children: [] });
  });

  people.forEach((person) => {
    const childNode = nodeMap.get(person.id);
    const mainParentId = person.fatherId || person.motherId;
    if (mainParentId && nodeMap.has(mainParentId)) {
      nodeMap.get(mainParentId).children.push(childNode);
      hasParent.add(person.id);
    }
  });

  const roots = people
    .filter((person) => !hasParent.has(person.id))
    .map((person) => nodeMap.get(person.id));

  if (roots.length === 0) {
    return { fullName: "Familia", children: Array.from(nodeMap.values()) };
  }

  if (roots.length === 1) {
    return roots[0];
  }

  return { fullName: "Familia", children: roots };
}

// Dibuja el árbol con D3.js.
function renderTree() {
  const svg = d3.select("#tree");
  svg.selectAll("*").remove();

  if (people.length === 0) {
    svg.append("text")
      .attr("x", 20)
      .attr("y", 40)
      .text("Agrega personas para ver el árbol.");
    return;
  }

  const containerWidth = document.querySelector("#treeContainer").clientWidth;
  const width = Math.max(containerWidth, 720);
  const height = 60 + people.length * 65;

  svg.attr("width", width);
  svg.attr("height", height);

  const hierarchyData = buildHierarchy();
  const root = d3.hierarchy(hierarchyData);

  const treeLayout = d3.tree().size([height - 60, width - 180]);
  treeLayout(root);

  svg
    .selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y + 80)
        .y((d) => d.x + 30)
    );

  const node = svg
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.y + 80}, ${d.x + 30})`);

  node
    .append("circle")
    .attr("r", 26)
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "#2b90d9");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "#ff9773");
    });

  node
    .append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .text((d) => d.data.fullName || d.data.name || "(Sin nombre)");

  node
    .append("title")
    .text((d) => {
      const p = d.data;
      const father = people.find((x) => x.id === p.fatherId);
      const mother = people.find((x) => x.id === p.motherId);
      const birthLine = p.birthDate || p.birthPlace ? `Nacimiento: ${p.birthDate || "¿?"} (${p.birthPlace || ""})` : "";
      const deathLine = p.deathDate || p.deathPlace ? `\nFallecimiento: ${p.deathDate || "¿?"} (${p.deathPlace || ""})` : "";
      return `${p.fullName || "(Sin nombre)"}\nPadre: ${father ? father.fullName : "—"}\nMadre: ${mother ? mother.fullName : "—"}\n${birthLine}${deathLine}${p.notes ? `\nNotas: ${p.notes}` : ""}`;
    });
}

// Muestra datos en el formulario para editar.
function startEdit(id) {
  const person = people.find((p) => p.id === id);
  if (!person) return;

  editingId = id;
  formTitle.textContent = "Editar persona";
  submitButton.textContent = "Actualizar";

  form.elements.fullName.value = person.fullName;
  form.elements.birthDate.value = person.birthDate;
  form.elements.birthPlace.value = person.birthPlace;
  form.elements.deathDate.value = person.deathDate;
  form.elements.deathPlace.value = person.deathPlace;
  form.elements.fatherId.value = person.fatherId;
  form.elements.motherId.value = person.motherId;
  form.elements.notes.value = person.notes;
}

function removePerson(id) {
  const person = people.find((p) => p.id === id);
  if (!person) return;

  const confirmed = confirm(`¿Eliminar a ${person.fullName}?`);
  if (!confirmed) return;

  // Limpia referencias en otros registros.
  people = people.map((p) => {
    if (p.fatherId === id) return { ...p, fatherId: "" };
    if (p.motherId === id) return { ...p, motherId: "" };
    return p;
  });

  people = people.filter((p) => p.id !== id);
  savePeople();
  renderSelects();
  renderTable();
  renderTree();
  clearForm();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);

  const person = {
    id: editingId || createId(),
    fullName: data.get("fullName").trim(),
    birthDate: data.get("birthDate") || "",
    birthPlace: data.get("birthPlace").trim(),
    deathDate: data.get("deathDate") || "",
    deathPlace: data.get("deathPlace").trim(),
    fatherId: data.get("fatherId") || "",
    motherId: data.get("motherId") || "",
    notes: data.get("notes").trim(),
  };

  if (!person.fullName) {
    alert("El nombre es obligatorio.");
    return;
  }

  if (person.fatherId && person.fatherId === person.id) {
    alert("Una persona no puede ser su propio padre.");
    return;
  }

  if (person.motherId && person.motherId === person.id) {
    alert("Una persona no puede ser su propia madre.");
    return;
  }

  if (editingId) {
    people = people.map((p) => (p.id === editingId ? person : p));
  } else {
    people.push(person);
  }

  savePeople();
  renderSelects();
  renderTable();
  renderTree();
  clearForm();
}

// Exporta a un archivo JSON descargable.
function exportData() {
  const blob = new Blob([JSON.stringify(people, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arbol-familiar.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Importa un archivo JSON seleccionado por el usuario.
function importData() {
  const file = importFile.files[0];
  if (!file) {
    alert("Selecciona un archivo JSON primero.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!Array.isArray(parsed)) {
        alert("El archivo debe contener una lista de personas.");
        return;
      }
      people = parsed;
      savePeople();
      renderSelects();
      renderTable();
      renderTree();
      clearForm();
      alert("Datos importados correctamente.");
    } catch (error) {
      alert("No se pudo leer el archivo. ¿Es un JSON válido?");
    }
  };
  reader.readAsText(file);
}

function handleTableClick(event) {
  const editId = event.target.getAttribute("data-edit");
  const deleteId = event.target.getAttribute("data-delete");
  if (editId) {
    startEdit(editId);
  }
  if (deleteId) {
    removePerson(deleteId);
  }
}

function init() {
  loadPeople();
  renderSelects();
  renderTable();
  renderTree();

  form.addEventListener("submit", handleFormSubmit);
  peopleTableBody.addEventListener("click", handleTableClick);
  resetButton.addEventListener("click", clearForm);
  exportButton.addEventListener("click", exportData);
  importButton.addEventListener("click", importData);
}

init();
