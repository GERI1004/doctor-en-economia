/* ===========================================
   📈 DOCTOR EN ECONOMÍA - Market Overview
   =========================================== */

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  getCryptoData();
  getEtfData();
  loadMarketNews();
});

/* ==============================
   🪙 CRYPTOS - COINGECKO API
   ============================== */
async function getCryptoData() {
  const cryptoDiv = document.getElementById("crypto");
  if (!cryptoDiv) return;

  const ids = [
    "bitcoin",
    "ethereum",
    "chainlink",
    "singularitynet",
    "fetch-ai",
    "ocean-protocol",
    "render-token",
    "akash-network",
    "peaq-network",
    "golem",
    "oraichain-token",
    "numeraire",
    "singularitydao"
  ];

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
    ","
  )}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    cryptoDiv.innerHTML = `
      <h3>Cryptos & AI Tokens</h3>
      ${Object.entries(data)
        .map(([key, value]) => {
          const change = value.usd_24h_change;
          const color = change >= 0 ? "#00d084" : "#ff4d4d";
          const symbol = change >= 0 ? "📈" : "📉";
          const name = key.replace(/-/g, " ").toUpperCase();

          return `
            <p>💰 <strong>${name}</strong><br>
            USD ${value.usd.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} 
            <span style="color:${color}">${symbol} ${change.toFixed(2)}%</span></p>
          `;
        })
        .join("")}
      <p class="update-time">Updated: ${new Date().toLocaleTimeString()}</p>
    `;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    cryptoDiv.innerHTML =
      "<p>⚠️ Error loading crypto data. Please try again later.</p>";
  }
}

// Actualizar cada 5 minutos
setInterval(getCryptoData, 5 * 60 * 1000);

/* ==============================
   📊 ETF DATA - TwelveData
   ============================== */
async function getEtfData() {
  const etfDiv = document.getElementById("etfs");
  if (!etfDiv) return;

  const etfs = [
    { symbol: "SPY", name: "S&P 500 ETF" },
    { symbol: "QQQ", name: "NASDAQ 100 ETF" },
    { symbol: "SMH", name: "Semiconductors ETF" },
    { symbol: "AIQ", name: "Artificial Intelligence ETF" },
  ];

  const apiKey = "cb561cab92d7402c938ce6cc9bf41a2a";

  try {
    const responses = await Promise.all(
      etfs.map(async (etf) => {
        const url = `https://api.twelvedata.com/quote?symbol=${etf.symbol}&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        return { ...etf, data };
      })
    );

    etfDiv.innerHTML = `
      <h3>ETFs & Index Funds</h3>
      ${responses
        .map((etf) => {
          const info = etf.data;
          if (info && info.close) {
            const color = parseFloat(info.percent_change) >= 0 ? "#00d084" : "#ff4d4d";
            const changeSymbol = parseFloat(info.percent_change) >= 0 ? "📈" : "📉";
            return `
              <p>💹 <strong>${etf.name}</strong><br>
              USD ${parseFloat(info.close).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} 
              <span style="color:${color}">${changeSymbol} ${info.percent_change}%</span></p>
            `;
          } else {
            return `
              <p>💹 <strong>${etf.name}</strong><br>
              ⚠️ Data unavailable (symbol: ${etf.symbol})</p>
            `;
          }
        })
        .join("")}
      <p class="update-time">Updated: ${new Date().toLocaleTimeString()}</p>
    `;
  } catch (error) {
    console.error("Error fetching ETF data:", error);
    etfDiv.innerHTML = `<p>⚠️ Error loading ETF data. Please try again later.</p>`;
  }
}

// Actualizar cada 10 minutos
setInterval(getEtfData, 10 * 60 * 1000);

/* ==============================
   💸 GESTOR DE GASTOS (Firestore + UI)
   ============================== */

const addExpenseBtn = document.getElementById("addExpense");
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");
const totalDisplay = document.getElementById("total");

if (addExpenseBtn) {
  addExpenseBtn.addEventListener("click", async () => {
    const desc = expenseDesc.value.trim();
    const amount = parseFloat(expenseAmount.value);

    if (!desc || isNaN(amount) || amount <= 0) {
      alert("⚠️ Please enter a valid description and amount.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Please log in first.");
      return;
    }

    try {
      await db.collection("users").doc(user.uid).collection("expenses").add({
        description: desc,
        amount: amount,
        date: new Date().toISOString(),
      });

      // Mostrar en la lista
      const li = document.createElement("li");
      li.textContent = `${desc}: ${amount.toFixed(2)} DKK`;
      expenseList.appendChild(li);

      // Actualizar localStorage para gráfico y totales
      const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
      expensesData.push({ id: new Date().toISOString(), amount });
      localStorage.setItem("expenses", JSON.stringify(expensesData));

      const prevTotal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
      const newTotal = prevTotal + amount;
      localStorage.setItem("totalExpenses", newTotal);
      totalDisplay.textContent = newTotal.toFixed(2);
      updateBalanceDisplay();
      updateExpensesChart();

      // Limpiar inputs
      expenseDesc.value = "";
      expenseAmount.value = "";

      console.log("✅ Expense saved successfully to Firestore!");
    } catch (error) {
      console.error("❌ Error saving expense:", error);
    }
  });
}

// Cargar gastos al iniciar sesión
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const snapshot = await db
        .collection("users")
        .doc(user.uid)
        .collection("expenses")
        .get();

      expenseList.innerHTML = "";
      let total = 0;
      const expensesData = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const li = document.createElement("li");
        li.textContent = `${data.description}: ${data.amount.toFixed(2)} DKK`;
        expenseList.appendChild(li);
        total += data.amount;

        expensesData.push({
          id: data.date || new Date().toISOString(),
          amount: data.amount,
        });
      });

      totalDisplay.textContent = total.toFixed(2);
      localStorage.setItem("totalExpenses", total);
      localStorage.setItem("expenses", JSON.stringify(expensesData));
      updateBalanceDisplay();
      updateExpensesChart();
    } catch (err) {
      console.error("❌ Error loading expenses:", err);
    }
  } else {
    // Si no hay usuario, limpiar
    expenseList.innerHTML = "";
    totalDisplay.textContent = "0.00";
  }
});

/* ==============================
   💰 BALANCE & RESUMEN
   ============================== */

const incomeInput = document.getElementById("income");
const addIncomeBtn = document.getElementById("addIncome");
const totalIncomeDisplay = document.getElementById("totalIncome");
const totalExpensesDisplay = document.getElementById("totalExpenses");
const currentBalanceDisplay = document.getElementById("currentBalance");

let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;

updateBalanceDisplay();

if (addIncomeBtn) {
  addIncomeBtn.addEventListener("click", () => {
    const amount = parseFloat(incomeInput.value);
    if (isNaN(amount) || amount <= 0) {
      alert("⚠️ Please enter a valid income amount.");
      return;
    }

    totalIncome += amount;
    localStorage.setItem("totalIncome", totalIncome);
    incomeInput.value = "";
    updateBalanceDisplay();
  });
}

function updateBalanceDisplay() {
  totalIncome = parseFloat(localStorage.getItem("totalIncome")) || totalIncome || 0;
  totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const currentBalance = totalIncome - totalExpenses;

  if (totalIncomeDisplay) totalIncomeDisplay.textContent = totalIncome.toFixed(2);
  if (totalExpensesDisplay) totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
  if (currentBalanceDisplay) currentBalanceDisplay.textContent = currentBalance.toFixed(2);
}

// ===========================================
// 📊 GRÁFICO DE GASTOS MENSUALES
// ===========================================
function updateExpensesChart() {
  const canvas = document.getElementById("expensesChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
  const monthlyTotals = {};

  expensesData.forEach((exp) => {
    const date = new Date(exp.id);
    const month = date.toLocaleString("default", { month: "short" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  const labels = Object.keys(monthlyTotals);
  const values = Object.values(monthlyTotals);

  if (labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monthly Expenses (DKK)",
          data: values,
          backgroundColor: "#00d08490",
          borderColor: "#00d084",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" },
        },
        x: {
          ticks: { color: "#ccc" },
        },
      },
    },
  });
}

/* ==============================
   🕒 CONTEXTO TEMPORAL Y NÓMINA
   ============================== */

window.addEventListener("load", () => {
  const currentDate = document.getElementById("currentDate");
  const currentTime = document.getElementById("currentTime");
  const daysToPayday = document.getElementById("daysToPayday");
  const paydayDisplay = document.getElementById("paydayDisplay");

  const payday = 30;
  if (paydayDisplay) paydayDisplay.textContent = payday;

  function updateDateTime() {
    const now = new Date();

    if (currentDate) {
      const dateStr = now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      currentDate.textContent = dateStr;
    }

    if (currentTime) {
      const timeStr = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      currentTime.textContent = timeStr;
    }

    const today = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();

    let nextPayday = new Date(year, month, payday);
    if (today > payday) nextPayday = new Date(year, month + 1, payday);

    const diff = nextPayday - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysToPayday) daysToPayday.textContent = daysLeft;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
});

/* ==============================
   🧠 RESUMEN FINANCIERO INTELIGENTE
   ============================== */

function updateSmartSummary() {
  const summaryBox = document.getElementById("smartSummary");
  if (!summaryBox) return;

  const totalIncomeVal = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalExpensesVal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const currentBalance = totalIncomeVal - totalExpensesVal;

  const now = new Date();
  const payday = 30;
  const today = now.getDate();
  const daysLeft = payday >= today ? payday - today : payday + (30 - today);

  let summary = "";

  if (totalIncomeVal === 0) {
    summary = "💡 Add your monthly income to start tracking your balance.";
  } else {
    const expenseRatio = (totalExpensesVal / totalIncomeVal) * 100;
    const dailyLimit = (currentBalance / (daysLeft || 1)).toFixed(2);

    summary = `
      💰 You’ve earned <strong>${totalIncomeVal.toFixed(2)} DKK</strong> this month.<br>
      💸 You’ve spent <strong>${totalExpensesVal.toFixed(2)} DKK</strong> (${expenseRatio.toFixed(1)}% of your income).<br>
      ⏳ There are <strong>${daysLeft}</strong> days left until your next paycheck.<br>
      📊 You can safely spend about <strong>${dailyLimit} DKK/day</strong> to stay on budget.<br>
    `;

    if (expenseRatio < 60) {
      summary += "🟢 Excellent! You’re saving very efficiently this month.";
    } else if (expenseRatio < 90) {
      summary += "🟡 You’re doing fine, but keep an eye on your expenses.";
    } else {
      summary += "🔴 Warning! You’ve spent too much; slow down a bit.";
    }
  }

  summaryBox.innerHTML = summary;
}

setInterval(updateSmartSummary, 3000);
updateSmartSummary();

/* ==============================
   📅 HISTORIAL MENSUAL + CSV
   ============================== */

const saveMonthBtn = document.getElementById("saveMonth");
const historyBody = document.getElementById("historyBody");
const exportCSVBtn = document.getElementById("exportCSV");

let historyData = JSON.parse(localStorage.getItem("monthlyHistory")) || [];

renderHistory();

if (saveMonthBtn) {
  saveMonthBtn.addEventListener("click", () => {
    const totalIncomeVal = parseFloat(localStorage.getItem("totalIncome")) || 0;
    const totalExpensesVal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    const balance = totalIncomeVal - totalExpensesVal;

    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    const existing = historyData.find(
      (h) => h.month === month && h.year === year
    );

    if (existing) {
      alert("⚠️ This month's data has already been saved.");
      return;
    }

    const record = { month, year, income: totalIncomeVal, expenses: totalExpensesVal, balance };
    historyData.push(record);
    localStorage.setItem("monthlyHistory", JSON.stringify(historyData));

    renderHistory();
  });
}

function renderHistory() {
  if (!historyBody) return;
  historyBody.innerHTML = "";

  historyData.forEach((h) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${h.month} ${h.year}</td>
      <td>${h.income.toFixed(2)}</td>
      <td>${h.expenses.toFixed(2)}</td>
      <td>${h.balance.toFixed(2)}</td>
    `;
    historyBody.appendChild(row);
  });
}

if (exportCSVBtn) {
  exportCSVBtn.addEventListener("click", () => {
    if (historyData.length === 0) {
      alert("⚠️ No data to export yet!");
      return;
    }

    let csvContent = "Month,Income (DKK),Expenses (DKK),Balance (DKK)\n";
    historyData.forEach((h) => {
      csvContent += `${h.month} ${h.year},${h.income},${h.expenses},${h.balance}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "financial-history.csv";
    link.click();
  });
}

/* ==============================
   📰 MÓDULO DE NOTICIAS
   ============================== */

const trackedAssets = ["RNDR", "AKT", "FET", "OCEAN", "AGIX", "BTC", "ETH", "S&P500"];
const newsFeed = document.getElementById("newsFeed");
const loadNewsBtn = document.getElementById("loadNews");
const newsApiKey = "pub_6561e61294f94e71ac555b551d6dc3b6";

async function loadMarketNews() {
  if (!newsFeed) return;
  newsFeed.innerHTML = "<p>Loading latest news...</p>";

  try {
    const query = trackedAssets.join(" OR ");
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${newsApiKey}&q=${encodeURIComponent(query)}&language=en`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      newsFeed.innerHTML = "<p>No recent news found for your tracked assets.</p>";
      return;
    }

    newsFeed.innerHTML = "";
    data.results.slice(0, 10).forEach(article => {
      const div = document.createElement("div");
      div.classList.add("news-item");
      div.innerHTML = `
        <h3>${article.title}</h3>
        <p><a href="${article.link}" target="_blank">🔗 Read more</a></p>
        <p class="date">🕒 ${new Date(article.pubDate).toLocaleString()}</p>
      `;
      newsFeed.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error loading news:", error);
    newsFeed.innerHTML = "<p>⚠️ Error loading news. Please try again later.</p>";
  }
}

if (loadNewsBtn) loadNewsBtn.addEventListener("click", loadMarketNews);

/* ==============================
   🔐 LOGIN REAL CON FIREBASE
   ============================== */

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const nameInput = document.getElementById("nameInput");
  const actionBtn = document.getElementById("actionBtn");
  const toggleMode = document.getElementById("toggleMode");
  const loginStatus = document.getElementById("loginStatus");
  const mainContent = document.querySelector("main");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  let isLoginMode = true;

  if (!loginSection) return;

  // Cambiar entre Login y Registro
  toggleMode.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      nameInput.classList.add("hidden");
      actionBtn.textContent = "Login";
      document.getElementById("formTitle").textContent = "Sign in to Doctor en Economía";
      toggleMode.textContent = "Don’t have an account? Create one";
    } else {
      nameInput.classList.remove("hidden");
      actionBtn.textContent = "Create Account";
      document.getElementById("formTitle").textContent = "Create your Doctor en Economía account";
      toggleMode.textContent = "Already have an account? Sign in";
    }
  });

  // Acciones de login/registro
  actionBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      loginStatus.textContent = "⚠️ Please enter email and password.";
      return;
    }

    try {
      if (isLoginMode) {
        await auth.signInWithEmailAndPassword(email, password);
        loginStatus.textContent = `✅ Welcome back, ${email}`;
      } else {
        await auth.createUserWithEmailAndPassword(email, password);
        loginStatus.textContent = "✅ Account created successfully!";
      }
    } catch (error) {
      loginStatus.textContent = "⚠️ " + error.message;
    }
  });

  // Mostrar/ocultar app al cambiar el estado de auth
  auth.onAuthStateChanged((user) => {
    const allSections = document.querySelectorAll(
      "main, header, footer, #context, #market, #expenses, #portfolio, #notes, #balance, #summary, #news, #history, #exportCSV"
    );

    if (user) {
      loginSection.classList.add("hidden");
      allSections.forEach(section => {
        section.style.display = "block";
        section.style.opacity = "1";
        section.style.pointerEvents = "auto";
        section.style.transition = "opacity 0.6s ease";
      });
      updateBalanceDisplay();
      updateSmartSummary();
    } else {
      allSections.forEach(section => {
        section.style.display = "none";
        section.style.opacity = "0";
        section.style.pointerEvents = "none";
      });
      loginSection.classList.remove("hidden");
    }
  });

  // Botón de Logout
  if (footer) {
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.style.background = "#00d084";
    logoutBtn.style.color = "#000";
    logoutBtn.style.border = "none";
    logoutBtn.style.borderRadius = "6px";
    logoutBtn.style.padding = "8px 16px";
    logoutBtn.style.marginTop = "15px";
    logoutBtn.style.cursor = "pointer";
    logoutBtn.onclick = async () => {
      await auth.signOut();
      alert("👋 You’ve been logged out.");
      window.location.reload();
    };
    footer.appendChild(logoutBtn);
  }
});
