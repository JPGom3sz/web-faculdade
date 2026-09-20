/* =========================================================================
   CAMADA DE DADOS
   Tenta consumir a API real (backend). Se a chamada falhar (porque o
   backend ainda não está no ar), cai para dados de demonstração em memória,
   para permitir testar o frontend de forma isolada.

   Contrato esperado da API:
   GET    /api/especialidades
   GET    /api/profissionais?especialidade_id=ID
   GET    /api/disponibilidade?profissional_id=ID
   POST   /api/agendamentos            body: {nome, cpf, profissional_id, data, hora}
   GET    /api/agendamentos?cpf=CPF
   DELETE /api/agendamentos/:id
   ========================================================================= */

const API_BASE = "/api";

const MOCK = {
  especialidades: [
    { id: 1, nome: "Clínico geral" },
    { id: 2, nome: "Nutrição" },
    { id: 3, nome: "Cardiologia" }
  ],
  profissionais: [
    { id: 10, nome: "Dr. Carlos Andrade", especialidade_id: 1 },
    { id: 11, nome: "Dra. Fernanda Lima", especialidade_id: 1 },
    { id: 12, nome: "Dra. Beatriz Souza", especialidade_id: 2 },
    { id: 13, nome: "Dr. Rafael Nunes", especialidade_id: 3 }
  ],
  agendamentosSalvos: []
};

function gerarDatasUteis(qtd) {
  const datas = [];
  let d = new Date();
  while (datas.length < qtd) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) {
      datas.push(new Date(d));
    }
  }
  return datas;
}

function formatarData(d) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

async function apiGet(path, fallback) {
  try {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error("resposta não ok");
    return await res.json();
  } catch (e) {
    console.warn("API indisponível, usando dados de demonstração:", path);
    return fallback;
  }
}

async function apiPost(path, body, fallback) {
  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("resposta não ok");
    return await res.json();
  } catch (e) {
    console.warn("API indisponível, salvando localmente (demonstração):", path);
    return fallback();
  }
}

async function apiDelete(path, fallback) {
  try {
    const res = await fetch(API_BASE + path, { method: "DELETE" });
    if (!res.ok) throw new Error("resposta não ok");
    return true;
  } catch (e) {
    console.warn("API indisponível, cancelando localmente (demonstração):", path);
    return fallback();
  }
}

function buscarEspecialidades() {
  return apiGet("/especialidades", MOCK.especialidades);
}

function buscarProfissionais(especialidadeId) {
  return apiGet(
    `/profissionais?especialidade_id=${especialidadeId}`,
    MOCK.profissionais.filter(p => p.especialidade_id === especialidadeId)
  );
}

function buscarDisponibilidade(profissionalId) {
  const datas = gerarDatasUteis(5).map(d => ({
    data: d.toISOString().slice(0, 10),
    label: formatarData(d),
    horarios: ["09:00", "10:00", "11:00", "14:00", "15:00"].filter(() => Math.random() > 0.25)
  }));
  return apiGet(`/disponibilidade?profissional_id=${profissionalId}`, datas);
}

function criarAgendamento(dados) {
  return apiPost("/agendamentos", dados, () => {
    const registro = {
      id: Date.now(),
      protocolo: "AG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "agendado",
      ...dados
    };
    MOCK.agendamentosSalvos.push(registro);
    return registro;
  });
}

function buscarAgendamentosPorCpf(cpf) {
  return apiGet(
    `/agendamentos?cpf=${cpf}`,
    MOCK.agendamentosSalvos.filter(a => a.cpf === cpf)
  );
}

function cancelarAgendamento(id) {
  return apiDelete(`/agendamentos/${id}`, () => {
    const item = MOCK.agendamentosSalvos.find(a => a.id === id);
    if (item) item.status = "cancelado";
    return true;
  });
}

/* =========================================================================
   ESTADO DA APLICAÇÃO
   ========================================================================= */

const estado = {
  especialidadeId: null,
  especialidadeNome: null,
  profissionalId: null,
  profissionalNome: null,
  data: null,
  dataLabel: null,
  hora: null,
  nome: "",
  cpf: ""
};

/* =========================================================================
   NAVEGAÇÃO ENTRE ABAS
   ========================================================================= */

const tabNovo = document.getElementById("tab-novo");
const tabConsulta = document.getElementById("tab-consulta");
const viewNovo = document.getElementById("view-novo");
const viewConsulta = document.getElementById("view-consulta");

tabNovo.onclick = () => {
  tabNovo.classList.add("active");
  tabConsulta.classList.remove("active");
  viewNovo.classList.remove("hidden");
  viewConsulta.classList.add("hidden");
};
tabConsulta.onclick = () => {
  tabConsulta.classList.add("active");
  tabNovo.classList.remove("active");
  viewConsulta.classList.remove("hidden");
  viewNovo.classList.add("hidden");
};

/* =========================================================================
   PASSO 1: especialidade e profissional
   ========================================================================= */

const listaEspecialidades = document.getElementById("lista-especialidades");
const listaProfissionais = document.getElementById("lista-profissionais");
const btnStep1Next = document.getElementById("btn-step1-next");

async function carregarEspecialidades() {
  const especialidades = await buscarEspecialidades();
  listaEspecialidades.innerHTML = "";
  especialidades.forEach(esp => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `<strong>${esp.nome}</strong><span>Especialidade</span>`;
    btn.onclick = async () => {
      estado.especialidadeId = esp.id;
      estado.especialidadeNome = esp.nome;
      estado.profissionalId = null;
      [...listaEspecialidades.children].forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      btnStep1Next.disabled = true;
      await carregarProfissionais(esp.id);
    };
    listaEspecialidades.appendChild(btn);
  });
}

async function carregarProfissionais(especialidadeId) {
  const profissionais = await buscarProfissionais(especialidadeId);
  listaProfissionais.innerHTML = "";
  if (profissionais.length === 0) {
    listaProfissionais.innerHTML = `<div class="empty-note">Nenhum profissional disponível para esta especialidade.</div>`;
    return;
  }
  profissionais.forEach(prof => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `<strong>${prof.nome}</strong><span>Profissional</span>`;
    btn.onclick = () => {
      estado.profissionalId = prof.id;
      estado.profissionalNome = prof.nome;
      [...listaProfissionais.children].forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      btnStep1Next.disabled = false;
    };
    listaProfissionais.appendChild(btn);
  });
}

/* =========================================================================
   PASSO 2: data e horário
   ========================================================================= */

const listaDatas = document.getElementById("lista-datas");
const listaHorarios = document.getElementById("lista-horarios");
const btnStep2Next = document.getElementById("btn-step2-next");
let disponibilidadeAtual = [];

async function carregarDisponibilidade() {
  disponibilidadeAtual = await buscarDisponibilidade(estado.profissionalId);
  listaDatas.innerHTML = "";
  listaHorarios.innerHTML = "";
  btnStep2Next.disabled = true;
  estado.data = null;
  estado.hora = null;

  disponibilidadeAtual.forEach(dia => {
    const btn = document.createElement("button");
    btn.className = "slot";
    btn.textContent = dia.label;
    btn.onclick = () => {
      estado.data = dia.data;
      estado.dataLabel = dia.label;
      estado.hora = null;
      [...listaDatas.children].forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      renderHorarios(dia.horarios);
      btnStep2Next.disabled = true;
    };
    listaDatas.appendChild(btn);
  });
}

function renderHorarios(horarios) {
  listaHorarios.innerHTML = "";
  if (horarios.length === 0) {
    listaHorarios.innerHTML = `<div class="empty-note">Sem horários livres nesta data.</div>`;
    return;
  }
  horarios.forEach(h => {
    const btn = document.createElement("button");
    btn.className = "slot";
    btn.textContent = h;
    btn.onclick = () => {
      estado.hora = h;
      [...listaHorarios.children].forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      btnStep2Next.disabled = false;
    };
    listaHorarios.appendChild(btn);
  });
}

/* =========================================================================
   PASSO 3: dados do paciente
   ========================================================================= */

const inputNome = document.getElementById("input-nome");
const inputCpf = document.getElementById("input-cpf");
const btnStep3Next = document.getElementById("btn-step3-next");
const inputNascimento = document.getElementById("input-nascimento")
const inputTelefone = document.getElementById("input-telefone")


function validarStep3() {
  const nomeOk = inputNome.value.trim().length >= 3;
  const cpfOk = /^\d{11}$/.test(inputCpf.value.trim());
  const nascimentoOk = inputNascimento.value.trim().length > 0;
  const telefoneOk = /^\d{10,11}$/.test(inputTelefone.value.trim());
  btnStep3Next.disabled = !(nomeOk && cpfOk && nascimentoOk && telefoneOk);
}
inputNome.addEventListener("input", validarStep3);
inputCpf.addEventListener("input", () => {
  inputCpf.value = inputCpf.value.replace(/\D/g, "");
  validarStep3();
});
inputNascimento.addEventListener("input", validarStep3);
inputTelefone.addEventListener("input", () => {
  inputTelefone.value = inputTelefone.value.replace(/\D/g, "");
  validarStep3();
});

/* =========================================================================
   PASSO 4: confirmação
   ========================================================================= */

async function confirmarAgendamento() {
  estado.nome = inputNome.value.trim();
  estado.cpf = inputCpf.value.trim();
  estado.dataNascimento = inputNascimento.value.trim();
  estado.telefone = inputTelefone.value.trim();

  const registro = await criarAgendamento({
    nome: estado.nome,
    cpf: estado.cpf,
    data_nascimento: estado.dataNascimento,
    telefone: estado.telefone,
    profissional_id: estado.profissionalId,
    data: estado.data,
    hora: estado.hora
  });

  document.getElementById("tk-nome").textContent = estado.nome;
  document.getElementById("tk-especialidade").textContent = estado.especialidadeNome;
  document.getElementById("tk-profissional").textContent = estado.profissionalNome;
  document.getElementById("tk-data").textContent = estado.dataLabel;
  document.getElementById("tk-hora").textContent = estado.hora;
  document.getElementById("tk-protocolo").textContent = registro.protocolo || registro.id;

  irParaStep(4);
}

/* =========================================================================
   CONTROLE DE ETAPAS (STEPPER)
   ========================================================================= */

function irParaStep(n) {
  [1, 2, 3, 4].forEach(i => {
    document.getElementById(`step-${i}`).classList.toggle("hidden", i !== n);
    document.getElementById(`seg${i}`).classList.toggle("done", i <= n);
  });
}

document.getElementById("btn-step1-next").onclick = async () => {
  await carregarDisponibilidade();
  irParaStep(2);
};
document.getElementById("btn-step2-back").onclick = () => irParaStep(1);
document.getElementById("btn-step2-next").onclick = () => irParaStep(3);
document.getElementById("btn-step3-back").onclick = () => irParaStep(2);
document.getElementById("btn-step3-next").onclick = confirmarAgendamento;

document.getElementById("btn-novo-agendamento").onclick = () => {
  estado.especialidadeId = null;
  estado.profissionalId = null;
  estado.data = null;
  estado.hora = null;
  inputNome.value = "";
  inputCpf.value = "";
  listaProfissionais.innerHTML = "";
  btnStep1Next.disabled = true;
  [...listaEspecialidades.children].forEach(c => c.classList.remove("selected"));
  irParaStep(1);
};

/* =========================================================================
   CONSULTA POR CPF
   ========================================================================= */

const inputCpfBusca = document.getElementById("input-cpf-busca");
const resultadoBusca = document.getElementById("resultado-busca");

inputCpfBusca.addEventListener("input", () => {
  inputCpfBusca.value = inputCpfBusca.value.replace(/\D/g, "");
});

document.getElementById("btn-buscar-cpf").onclick = async () => {
  const cpf = inputCpfBusca.value.trim();
  if (!/^\d{11}$/.test(cpf)) {
    resultadoBusca.innerHTML = `<div class="empty-note">Digite um CPF válido, com 11 números.</div>`;
    return;
  }
  const agendamentos = await buscarAgendamentosPorCpf(cpf);
  renderResultadoBusca(agendamentos);
};

function renderResultadoBusca(agendamentos) {
  if (agendamentos.length === 0) {
    resultadoBusca.innerHTML = `<div class="empty-note">Nenhum agendamento encontrado para este CPF.</div>`;
    return;
  }
  resultadoBusca.innerHTML = "";
  agendamentos.forEach(ag => {
    const item = document.createElement("div");
    item.className = "agendamento-item";
    const statusClasse = ag.status === "cancelado" ? "status-cancelado" : "status-agendado";
    item.innerHTML = `
      <div class="info">
        <strong>${ag.data} às ${ag.hora}</strong>
        <span>${ag.nome} &middot; protocolo ${ag.protocolo || ag.id}</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="status-tag ${statusClasse}">${ag.status}</span>
      </div>
    `;
    if (ag.status !== "cancelado") {
      const btnCancelar = document.createElement("button");
      btnCancelar.className = "cancel-btn";
      btnCancelar.textContent = "Cancelar";
      btnCancelar.onclick = async () => {
        await cancelarAgendamento(ag.id);
        const atualizados = await buscarAgendamentosPorCpf(inputCpfBusca.value.trim());
        renderResultadoBusca(atualizados);
      };
      item.querySelector("div:last-child").appendChild(btnCancelar);
    }
    resultadoBusca.appendChild(item);
  });
}

/* =========================================================================
   INICIALIZAÇÃO
   ========================================================================= */

carregarEspecialidades();

if (window.location.hash === "#consulta") {
  tabConsulta.click();
}
