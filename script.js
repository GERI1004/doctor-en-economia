console.log("Doctor en Economía iniciado correctamente ✅");

/* ===============================
   🧾 MÓDULO DE GASTOS DIARIOS
   =============================== */

const inputConcepto = document.getElementById("gastoConcepto");
const inputMonto = document.getElementById("gastoMonto");
const btnAgregarGasto = document.getElementById("btnAgregarGasto");
const listaGastos = document.getElementById("listaGastos");
const gastoTotal = document.getElementById("gastoTotal");

// Cargar gastos guardados
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

function renderGastos() {
  listaGastos.innerHTML = "";
  let total = 0;
  gastos.forEach((gasto) => {
    const li = document.createElement("li");
    li.textContent = `${gasto.concepto} — ${gasto.monto} DKK`;
    listaGastos.appendChild(li);
    total += gasto.monto;
  });
  gastoTotal.textContent = total.toFixed(2);
}

btnAgregarGasto.addEventListener("click", () => {
  const concepto = inputConcepto.value.trim();
  const monto = parseFloat(inputMonto.value);

  if (concepto === "" || isNaN(monto)) {
    alert("Por favor, completa ambos campos correctamente.");
    return;
  }

  gastos.push({ concepto, monto });
  localStorage.setItem("gastos", JSON.stringify(gastos));
  inputConcepto.value = "";
  inputMonto.value = "";
  renderGastos();
});

// Mostrar los gastos al cargar la página
renderGastos();

/* ===============================
   🧠 MÓDULO DE NOTAS E INTUICIONES
   =============================== */

const btnGuardar = document.getElementById("guardar");
const inputNota = document.getElementById("nota");
const listaNotas = document.getElementById("lista");

let notas = JSON.parse(localStorage.getItem("notas")) || [];

function renderNotas() {
  listaNotas.innerHTML = "";
  notas.forEach((texto) => {
    const li = document.createElement("li");
    li.textContent = texto;
    listaNotas.appendChild(li);
  });
}

btnGuardar.addEventListener("click", () => {
  const texto = inputNota.value.trim();
  if (texto === "") return;
  notas.push(texto);
  localStorage.setItem("notas", JSON.stringify(notas));
  inputNota.value = "";
  renderNotas();
});

// Mostrar las notas al cargar
renderNotas();
/* ===============================
   💰 MÓDULO DE CRIPTOMONEDAS (CoinGecko)
   =============================== */

async function obtenerCriptos() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,chainlink,pepe";
  
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    const div = document.getElementById("crypto-data");
    div.innerHTML = "";

    datos.forEach((coin) => {
      const card = document.createElement("div");
      card.innerHTML = `
        <strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})<br>
        💵 Precio: $${coin.current_price.toLocaleString()} <br>
        📈 Cambio 24h: ${coin.price_change_percentage_24h.toFixed(2)}%
        <hr>
      `;
      div.appendChild(card);
    });
  } catch (error) {
    console.error("Error al obtener datos de CoinGecko:", error);
    document.getElementById("crypto-data").textContent = "Error al cargar datos.";
  }
}

// Ejecutar al cargar
obtenerCriptos();
/* ===============================
   🚀 MÓDULO DE TOKENS EMERGENTES (CoinGecko)
   =============================== */

async function obtenerTokensEmergentes() {
  // IDs de tokens pequeños o con proyección. Puedes cambiarlos cuando quieras.
  const ids = [
    "pepe",
    "bonk",
    "dogwifcoin",
    "floki",
    "popcat"
  ];

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(",")}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    const div = document.getElementById("tokens-data");
    div.innerHTML = "";

    datos.forEach((token) => {
      const card = document.createElement("div");
      card.innerHTML = `
        <strong>${token.name}</strong> (${token.symbol.toUpperCase()})<br>
        💰 Precio: $${token.current_price.toLocaleString()}<br>
        📈 Cambio 24h: ${token.price_change_percentage_24h?.toFixed(2)}%
        <hr>
      `;
      div.appendChild(card);
    });

  } catch (error) {
    console.error("Error al obtener tokens emergentes:", error);
    document.getElementById("tokens-data").textContent = "Error al cargar tokens.";
  }
}

// Ejecutar al cargar
obtenerTokensEmergentes();

/* ===============================
   📊 MÓDULO DE ETFs / S&P500 (modo demo estable)
   =============================== */

async function obtenerETFs() {
  const div = document.getElementById("etf-data");
  div.innerHTML = "Cargando datos...";

  try {
    // --- PRUEBA: simulamos datos reales (para que veas el formato en tu web) ---
    const datosDemo = [
      { symbol: "S&P 500 (SPY)", price: 582.47, change: 0.21 },
      { symbol: "Nasdaq 100 (QQQ)", price: 481.12, change: -0.18 },
      { symbol: "Vanguard S&P 500 (VOO)", price: 452.09, change: 0.33 },
    ];

    div.innerHTML = "";
    datosDemo.forEach((etf) => {
      const card = document.createElement("div");
      card.innerHTML = `
        <strong>${etf.symbol}</strong><br>
        💰 Precio actual: $${etf.price.toLocaleString()}<br>
        📈 Cambio 24h: ${etf.change.toFixed(2)}%
        <hr>
      `;
      div.appendChild(card);
    });
  } catch (error) {
    console.error("Error al obtener ETFs:", error);
    div.textContent = "Error al cargar datos de ETFs.";
  }
}

obtenerETFs();
/* ===============================
   🥧 MÓDULO DE CARTERA 65/20/15
   =============================== */

function crearGraficoCartera() {
  const ctx = document.getElementById("graficoCartera").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Fondos Indexados (65%)", "Criptomonedas (20%)", "Tokens Emergentes (15%)"],
      datasets: [
        {
          data: [65, 20, 15],
          backgroundColor: ["#013220", "#0FA958", "#FFD700"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 14 },
            color: "#013220",
          },
        },
        title: {
          display: true,
          text: "Distribución actual de cartera",
          color: "#013220",
          font: { size: 16 },
        },
      },
    },
  });
}

// Ejecutar al cargar
crearGraficoCartera();
/* ===============================
   🔄 BOTÓN DE ACTUALIZACIÓN GLOBAL
   =============================== */

document.getElementById("btnActualizar").addEventListener("click", () => {
  console.log("Actualizando datos del mercado...");
  obtenerETFs();
  obtenerCriptos();
  obtenerTokensEmergentes();
});
// Refrescar datos automáticamente cada 5 minutos (300000 ms)
setInterval(() => {
  obtenerETFs();
  obtenerCriptos();
  obtenerTokensEmergentes();
}, 300000);
