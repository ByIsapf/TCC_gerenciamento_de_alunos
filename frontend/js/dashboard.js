const students = [
  {name:"Ana Beatriz Silva", ra:"20260124", time:"07:02", status:"present", label:"Presente"},
  {name:"Bruno Henrique", ra:"20260318", time:"07:18", status:"late", label:"Atrasado"},
  {name:"Camila Oliveira", ra:"20260402", time:"06:55", status:"present", label:"Presente"},
  {name:"Daniel Souza", ra:"20260541", time:"—", status:"absent", label:"Ausente"},
  {name:"Eduarda Martins", ra:"20260715", time:"07:04", status:"present", label:"Presente"},
  {name:"Felipe Santos", ra:"20260831", time:"07:26", status:"late", label:"Atrasado"},
  {name:"Giovana Costa", ra:"20260944", time:"07:01", status:"present", label:"Presente"},
  {name:"Henrique Lima", ra:"20261012", time:"—", status:"absent", label:"Ausente"}
];

const activities = [
  ["Camila Oliveira","Entrada registrada às 06:55","presente"],
  ["Felipe Santos","Entrada registrada às 07:26","atrasado"],
  ["Ana Beatriz Silva","Entrada registrada às 07:02","presente"],
  ["Daniel Souza","Ausência identificada","ausente"],
  ["Giovana Costa","Entrada registrada às 07:01","presente"]
];

function renderTable(list = students) {
  document.getElementById("studentTable").innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.ra}</td>
      <td>${s.time}</td>
      <td><span class="status ${s.status}">${s.label}</span></td>
    </tr>`).join("");
}

document.getElementById("activities").innerHTML = activities.map(a => `
  <div class="activity"><div class="activity-dot"></div><div><strong>${a[0]}</strong><span>${a[1]}</span></div></div>
`).join("");

document.getElementById("search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  renderTable(students.filter(s => s.name.toLowerCase().includes(term) || s.ra.includes(term)));
});

renderTable();