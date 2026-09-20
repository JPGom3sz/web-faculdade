/* menu mobile */
const navToggle = document.getElementById("home-nav-toggle");
const navLinks = document.getElementById("home-nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const aberto = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(aberto));
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* scroll suave para os links internos */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const alvo = document.querySelector(link.getAttribute("href"));
    if (alvo) {
      e.preventDefault();
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* animação de entrada ao rolar a página */
const prefereReduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// LISTA DE SELETORES ATUALIZADA: Agora o JS enxerga as novas áreas do site premium
const elementosAnimados = document.querySelectorAll(
  ".home-strip-item, .home-step, .home-esp-card, .home-contato-text, .home-contato-card, .home-sobre-text, .badge-card, .home-stat, .img-back, .img-front"
);

elementosAnimados.forEach(el => el.classList.add("reveal"));

if (!prefereReduzirMovimento && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);           
        }
      });
    },
    { threshold: 0.15 }
  );
  elementosAnimados.forEach(el => observer.observe(el));
} else {
  elementosAnimados.forEach(el => el.classList.add("in"));
}

/* contagem animada das estatísticas ao entrar na tela */
function animarContador(el) {
  const alvo = parseInt(el.dataset.count, 10) || 0;
  const duracao = 1200;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const valorAtual = Math.round(alvo * (1 - Math.pow(1 - progresso, 3)));
    el.textContent = valorAtual.toLocaleString('pt-BR');
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

const numerosEstatistica = document.querySelectorAll(".home-stat-num");
if (numerosEstatistica.length) {
  if (!prefereReduzirMovimento && "IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animarContador(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    numerosEstatistica.forEach(el => statsObserver.observe(el));
  } else {
    numerosEstatistica.forEach(el => {
      el.textContent = (parseInt(el.dataset.count, 10) || 0).toLocaleString('pt-BR');
    });
  }
}

const botoesEspecialidades = document.querySelectorAll(".botaoteste");

// Passa por cada um deles adicionando o evento de clique
botoesEspecialidades.forEach(function(botao) {
    botao.addEventListener("click", function () {
        window.location.href = "agendamento.html";
    });
});



//header Foda

let ultimaPosicao = 0
const header = document.querySelector('.home-nav')

window.addEventListener('scroll', () =>{
    
  let posicaoAtual = window.scrollY;

  if (posicaoAtual > ultimaPosicao) {
    header.classList.add('escondido');

  }else {
    header.classList.remove('escondido');       
  }




ultimaPosicao = Math.max(0, posicaoAtual);
});
