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
    "solana",
    "cardano",
    "binancecoin"
  ];

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
    ","
  )}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    cryptoDiv.innerHTML = `
      <h3>Criptomonedas principales</h3>
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
      <p class="update-time">Actualizado: ${new Date().toLocaleTimeString()}</p>
    `;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    cryptoDiv.innerHTML =
      "<p>⚠️ Error al cargar los datos. Inténtalo de nuevo más tarde.</p>";
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
      <h3>ETFs y fondos índice</h3>
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
              ⚠️ Datos no disponibles (símbolo: ${etf.symbol})</p>
            `;
          }
        })
        .join("")}
      <p class="update-time">Actualizado: ${new Date().toLocaleTimeString()}</p>
    `;
  } catch (error) {
    console.error("Error fetching ETF data:", error);
    etfDiv.innerHTML = `<p>⚠️ Error al cargar los datos. Inténtalo de nuevo más tarde.</p>`;
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

function renderExpenseItem(docId, desc, amount) {
  return `${desc}: ${amount.toFixed(2)} DKK
    <button class="delete-btn" style="color:#00d084;" onclick="editExpense('${docId}')">✏️ Editar</button>
    <button class="delete-btn" onclick="deleteExpense('${docId}')">🗑️ Eliminar</button>`;
}

if (addExpenseBtn) {
  addExpenseBtn.addEventListener("click", async () => {
    const desc = expenseDesc.value.trim();
    const amount = parseFloat(expenseAmount.value);

    if (!desc || isNaN(amount) || amount <= 0) {
      alert("⚠️ Introduce una descripción y un importe válidos.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Debes iniciar sesión primero.");
      return;
    }

    try {
      const docRef = await db.collection("users").doc(user.uid).collection("expenses").add({
        description: desc,
        amount: amount,
        date: new Date().toISOString(),
      });

      // Mostrar en la lista con botones de editar y eliminar
      const li = document.createElement("li");
      li.dataset.id = docRef.id;
      li.dataset.description = desc;
      li.dataset.amount = amount;
      li.innerHTML = renderExpenseItem(docRef.id, desc, amount);
      expenseList.appendChild(li);

      // Actualizar localStorage para gráfico y totales
      const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
      expensesData.push({ id: docRef.id, amount });
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

async function deleteExpense(docId) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await db.collection("users").doc(user.uid).collection("expenses").doc(docId).delete();

    // Eliminar de localStorage y recalcular total
    const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
    const index = expensesData.findIndex(e => e.id === docId);
    let removedAmount = 0;
    if (index !== -1) {
      removedAmount = expensesData[index].amount;
      expensesData.splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expensesData));
    }

    const prevTotal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    const newTotal = Math.max(0, prevTotal - removedAmount);
    localStorage.setItem("totalExpenses", newTotal);

    // Actualizar pantalla
    const li = document.querySelector(`li[data-id="${docId}"]`);
    if (li) li.remove();
    totalDisplay.textContent = newTotal.toFixed(2);
    updateBalanceDisplay();
    updateExpensesChart();

  } catch (error) {
    console.error("❌ Error al eliminar el gasto:", error);
    alert("⚠️ Error al eliminar el gasto. Inténtalo de nuevo.");
  }
}

function editExpense(docId) {
  const li = document.querySelector(`li[data-id="${docId}"]`);
  if (!li) return;

  const currentDesc = li.dataset.description;
  const currentAmount = li.dataset.amount;

  li.innerHTML = `
    <input type="text" id="editDesc_${docId}" value="${currentDesc}"
      style="background:#1b1f2a; color:white; border:1px solid #333; border-radius:4px; padding:4px; margin-right:6px;">
    <input type="number" id="editAmount_${docId}" value="${currentAmount}"
      style="width:80px; background:#1b1f2a; color:white; border:1px solid #333; border-radius:4px; padding:4px; margin-right:6px;">
    <button class="delete-btn" style="color:#00d084;" onclick="saveExpenseEdit('${docId}')">✅ Guardar</button>
    <button class="delete-btn" onclick="cancelEdit('${docId}')">✖ Cancelar</button>
  `;
}

async function saveExpenseEdit(docId) {
  const user = auth.currentUser;
  if (!user) return;

  const newDesc = document.getElementById(`editDesc_${docId}`).value.trim();
  const newAmount = parseFloat(document.getElementById(`editAmount_${docId}`).value);

  if (!newDesc || isNaN(newAmount) || newAmount <= 0) {
    alert("⚠️ Introduce una descripción y un importe válidos.");
    return;
  }

  const li = document.querySelector(`li[data-id="${docId}"]`);
  const oldAmount = parseFloat(li.dataset.amount);

  try {
    await db.collection("users").doc(user.uid).collection("expenses").doc(docId).update({
      description: newDesc,
      amount: newAmount,
    });

    // Actualizar localStorage
    const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
    const index = expensesData.findIndex(e => e.id === docId);
    if (index !== -1) {
      expensesData[index].amount = newAmount;
      localStorage.setItem("expenses", JSON.stringify(expensesData));
    }

    const prevTotal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    const newTotal = Math.max(0, prevTotal - oldAmount + newAmount);
    localStorage.setItem("totalExpenses", newTotal);
    totalDisplay.textContent = newTotal.toFixed(2);

    // Actualizar el <li> con los nuevos datos
    li.dataset.description = newDesc;
    li.dataset.amount = newAmount;
    li.innerHTML = renderExpenseItem(docId, newDesc, newAmount);

    updateBalanceDisplay();
    updateExpensesChart();

  } catch (error) {
    console.error("❌ Error al actualizar el gasto:", error);
    alert("⚠️ Error al actualizar el gasto. Inténtalo de nuevo.");
  }
}

function cancelEdit(docId) {
  const li = document.querySelector(`li[data-id="${docId}"]`);
  if (!li) return;
  li.innerHTML = renderExpenseItem(docId, li.dataset.description, parseFloat(li.dataset.amount));
}

// Cargar gastos al iniciar sesión
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Si el usuario es distinto al que tenía la sesión anterior, limpiar localStorage
    const storedUid = localStorage.getItem("currentUserId");
    if (storedUid !== user.uid) {
      localStorage.removeItem("totalIncome");
      localStorage.removeItem("totalExpenses");
      localStorage.removeItem("expenses");
      localStorage.setItem("currentUserId", user.uid);
    }

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
        li.dataset.id = docSnap.id;
        li.dataset.description = data.description;
        li.dataset.amount = data.amount;
        li.innerHTML = renderExpenseItem(docSnap.id, data.description, data.amount);
        expenseList.appendChild(li);
        total += data.amount;

        expensesData.push({
          id: docSnap.id,
          amount: data.amount,
        });
      });

      totalDisplay.textContent = total.toFixed(2);
      localStorage.setItem("totalExpenses", total);
      localStorage.setItem("expenses", JSON.stringify(expensesData));

      // Cargar ingresos desde Firestore
      const incomeSnapshot = await db
        .collection("users")
        .doc(user.uid)
        .collection("income")
        .get();

      if (!incomeSnapshot.empty) {
        let incomeTotal = 0;
        incomeSnapshot.forEach((docSnap) => {
          incomeTotal += docSnap.data().amount;
        });
        localStorage.setItem("totalIncome", incomeTotal);
        totalIncome = incomeTotal;
      }

      updateBalanceDisplay();
      updateExpensesChart();
      loadNotes();
      loadHistory();
    } catch (err) {
      console.error("❌ Error loading data:", err);
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
let portfolioChartInstance = null;

updateBalanceDisplay();

if (addIncomeBtn) {
  addIncomeBtn.addEventListener("click", async () => {
    const amount = parseFloat(incomeInput.value);
    if (isNaN(amount) || amount <= 0) {
      alert("⚠️ Introduce un importe válido.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Debes iniciar sesión primero.");
      return;
    }

    try {
      await db.collection("users").doc(user.uid).collection("income").add({
        amount: amount,
        date: new Date().toISOString(),
      });

      totalIncome += amount;
      localStorage.setItem("totalIncome", totalIncome);
      incomeInput.value = "";
      updateBalanceDisplay();
    } catch (error) {
      console.error("❌ Error saving income:", error);
      alert("⚠️ Error al guardar el ingreso. Inténtalo de nuevo.");
    }
  });
}

function updateBalanceDisplay() {
  totalIncome = parseFloat(localStorage.getItem("totalIncome")) || totalIncome || 0;
  totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const currentBalance = totalIncome - totalExpenses;

  if (totalIncomeDisplay) totalIncomeDisplay.textContent = totalIncome.toFixed(2);
  if (totalExpensesDisplay) totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
  if (currentBalanceDisplay) currentBalanceDisplay.textContent = currentBalance.toFixed(2);
  updatePortfolioChart();
}

// ===========================================
// 📊 GRÁFICO DE GASTOS MENSUALES
// ===========================================
let expensesChartInstance = null;

function updateExpensesChart() {
  const canvas = document.getElementById("expensesChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
  const monthlyTotals = {};

  expensesData.forEach((exp) => {
    const date = new Date(exp.id);
    const month = date.toLocaleString("es-ES", { month: "short" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  const labels = Object.keys(monthlyTotals);
  const values = Object.values(monthlyTotals);

  if (labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (expensesChartInstance) expensesChartInstance.destroy();

  expensesChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos mensuales (DKK)",
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

// ===========================================
// 🥧 GRÁFICO DE PORTFOLIO (datos reales)
// ===========================================
function updatePortfolioChart() {
  const canvas = document.getElementById("portfolioChart");
  if (!canvas) return;

  const totalIncomeVal = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalExpensesVal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const savings = Math.max(0, totalIncomeVal - totalExpensesVal);

  const ctx = canvas.getContext("2d");

  if (totalIncomeVal === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (portfolioChartInstance) portfolioChartInstance.destroy();

  portfolioChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Gastos", "Ahorro"],
      datasets: [{
        data: [totalExpensesVal, savings],
        backgroundColor: ["#ff4d4d90", "#00d08490"],
        borderColor: ["#ff4d4d", "#00d084"],
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#ccc" }
        }
      }
    }
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

  let payday = parseInt(localStorage.getItem("payday")) || 30;
  if (paydayDisplay) paydayDisplay.textContent = payday;

  const savePaydayBtn = document.getElementById("savePayday");
  const paydayInput = document.getElementById("paydayInput");
  if (savePaydayBtn && paydayInput) {
    savePaydayBtn.addEventListener("click", () => {
      const newDay = parseInt(paydayInput.value);
      if (isNaN(newDay) || newDay < 1 || newDay > 31) {
        alert("⚠️ Introduce un día válido entre 1 y 31.");
        return;
      }
      payday = newDay;
      localStorage.setItem("payday", payday);
      if (paydayDisplay) paydayDisplay.textContent = payday;
      paydayInput.value = "";
    });
  }

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
  const payday = parseInt(localStorage.getItem("payday")) || 30;
  const today = now.getDate();
  const daysLeft = payday >= today ? payday - today : payday + (30 - today);

  let summary = "";

  if (totalIncomeVal === 0) {
    summary = "💡 Añade tus ingresos del mes para empezar a ver tu balance.";
    summary += "<br><br>📚 <em>Consejo financiero: saber exactamente cuánto ganas al mes es el primer paso para controlar tu dinero. No puedes gestionar lo que no mides.</em>";
  } else {
    const expenseRatio = (totalExpensesVal / totalIncomeVal) * 100;
    const dailyLimit = (currentBalance / (daysLeft || 1)).toFixed(2);

    summary = `
      💰 Has ingresado <strong>${totalIncomeVal.toFixed(2)} DKK</strong> este mes.<br>
      💸 Has gastado <strong>${totalExpensesVal.toFixed(2)} DKK</strong> (${expenseRatio.toFixed(1)}% de tus ingresos).<br>
      ⏳ Quedan <strong>${daysLeft}</strong> días hasta tu próxima nómina.<br>
      📊 Puedes gastar aproximadamente <strong>${dailyLimit} DKK/día</strong> para no pasarte del presupuesto.<br>
    `;

    if (expenseRatio < 60) {
      summary += "🟢 ¡Excelente! Estás ahorrando muy bien este mes.";
      summary += "<br><br>📚 <em>Consejo financiero: si tienes 100€ o más ahorrados, ya puedes empezar a explorar la inversión de bajo riesgo. Los ETFs (fondos índice) te permiten invertir en cientos de empresas a la vez, algo mucho más seguro que comprar acciones individuales o criptomonedas.</em>";
    } else if (expenseRatio < 90) {
      summary += "🟡 Vas bien, pero vigila tus gastos.";
      summary += "<br><br>📚 <em>Consejo financiero: prueba la regla 50/30/20 — 50% para necesidades (alquiler, comida, facturas), 30% para caprichos (ocio, suscripciones) y 20% para ahorro. Los pequeños cambios de hábito marcan una gran diferencia con el tiempo.</em>";
    } else {
      summary += "🔴 ¡Atención! Has gastado demasiado. Es momento de frenar.";
      summary += "<br><br>📚 <em>Consejo financiero: cuando los gastos superan los ingresos, lo primero es hacer una lista de todo en lo que gastas. Después, separa lo que es una necesidad real (sin ello no puedes vivir) de lo que es un capricho (puedes prescindir de ello). Empieza recortando los caprichos.</em>";
    }
  }

  summaryBox.innerHTML = summary;
}

setInterval(updateSmartSummary, 3000);
updateSmartSummary();

/* ==============================
   📅 HISTORIAL MENSUAL (Firestore)
   ============================== */

const saveMonthBtn = document.getElementById("saveMonth");
const historyBody = document.getElementById("historyBody");

function renderHistory(historyData) {
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

async function loadHistory() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection("users").doc(user.uid).collection("history")
      .orderBy("timestamp", "asc").get();
    const historyData = snapshot.docs.map(doc => doc.data());
    renderHistory(historyData);
  } catch (err) {
    console.error("❌ Error loading history:", err);
  }
}

if (saveMonthBtn) {
  saveMonthBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const totalIncomeVal = parseFloat(localStorage.getItem("totalIncome")) || 0;
    const totalExpensesVal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
    const balance = totalIncomeVal - totalExpensesVal;

    const now = new Date();
    const month = now.toLocaleString("es-ES", { month: "long" });
    const year = now.getFullYear();

    try {
      const existing = await db.collection("users").doc(user.uid).collection("history")
        .where("month", "==", month).where("year", "==", year).get();

      if (!existing.empty) {
        alert("⚠️ Los datos de este mes ya están guardados.");
        return;
      }

      await db.collection("users").doc(user.uid).collection("history").add({
        month, year, income: totalIncomeVal, expenses: totalExpensesVal, balance,
        timestamp: new Date().toISOString(),
      });

      await loadHistory();
    } catch (err) {
      console.error("❌ Error saving history:", err);
    }
  });
}


/* ==============================
   🧾 NOTAS (Firestore)
   ============================== */

const saveNoteBtn = document.getElementById("saveNote");
const noteText = document.getElementById("noteText");
const savedNotesDiv = document.getElementById("savedNotes");

function renderNotes(notes) {
  if (!savedNotesDiv) return;
  savedNotesDiv.innerHTML = "";
  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <p>${note.text}</p>
      <small style="color:#aaa;">${note.date}</small>
      <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑️ Eliminar</button>
    `;
    savedNotesDiv.appendChild(div);
  });
}

async function loadNotes() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection("users").doc(user.uid).collection("notes")
      .orderBy("timestamp", "desc").get();
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderNotes(notes);
  } catch (err) {
    console.error("❌ Error loading notes:", err);
  }
}

async function deleteNote(docId) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection("users").doc(user.uid).collection("notes").doc(docId).delete();
    await loadNotes();
  } catch (err) {
    console.error("❌ Error deleting note:", err);
  }
}

if (saveNoteBtn) {
  saveNoteBtn.addEventListener("click", async () => {
    const text = noteText.value.trim();
    if (!text) {
      alert("⚠️ Escribe algo antes de guardar.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    try {
      await db.collection("users").doc(user.uid).collection("notes").add({
        text,
        date: new Date().toLocaleString(),
        timestamp: new Date().toISOString(),
      });
      noteText.value = "";
      await loadNotes();
    } catch (err) {
      console.error("❌ Error saving note:", err);
    }
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
  newsFeed.innerHTML = "<p>Cargando noticias...</p>";

  try {
    const query = trackedAssets.join(" OR ");
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${newsApiKey}&q=${encodeURIComponent(query)}&language=en`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      newsFeed.innerHTML = "<p>No se han encontrado noticias recientes.</p>";
      return;
    }

    newsFeed.innerHTML = "";
    data.results.slice(0, 10).forEach(article => {
      const div = document.createElement("div");
      div.classList.add("news-item");
      div.innerHTML = `
        <h3>${article.title}</h3>
        <p><a href="${article.link}" target="_blank">🔗 Leer más</a></p>
        <p class="date">🕒 ${new Date(article.pubDate).toLocaleString()}</p>
      `;
      newsFeed.appendChild(div);
    });

  } catch (error) {
    console.error("❌ Error loading news:", error);
    newsFeed.innerHTML = "<p>⚠️ Error al cargar las noticias. Inténtalo de nuevo más tarde.</p>";
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
      actionBtn.textContent = "Iniciar sesión";
      document.getElementById("formTitle").textContent = "Inicia sesión en Doctor en Economía";
      toggleMode.textContent = "¿No tienes cuenta? Créala aquí";
    } else {
      nameInput.classList.remove("hidden");
      actionBtn.textContent = "Crear cuenta";
      document.getElementById("formTitle").textContent = "Crea tu cuenta en Doctor en Economía";
      toggleMode.textContent = "¿Ya tienes cuenta? Inicia sesión";
    }
  });

  // Acciones de login/registro
  actionBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      loginStatus.textContent = "⚠️ Introduce el correo y la contraseña.";
      return;
    }

    try {
      if (isLoginMode) {
        await auth.signInWithEmailAndPassword(email, password);
        loginStatus.textContent = `✅ Bienvenido/a de nuevo, ${email}`;
      } else {
        await auth.createUserWithEmailAndPassword(email, password);
        loginStatus.textContent = "✅ ¡Cuenta creada correctamente!";
      }
    } catch (error) {
      const mensajesError = {
        "auth/wrong-password": "Contraseña incorrecta. Inténtalo de nuevo.",
        "auth/user-not-found": "No existe ninguna cuenta con ese correo.",
        "auth/email-already-in-use": "Este correo ya está registrado. Inicia sesión.",
        "auth/invalid-email": "El formato del correo no es válido.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
        "auth/network-request-failed": "Sin conexión. Comprueba tu red e inténtalo de nuevo.",
      };
      const mensaje = mensajesError[error.code] || "Ha ocurrido un error. Inténtalo de nuevo.";
      loginStatus.textContent = "⚠️ " + mensaje;
    }
  });

  // Mostrar/ocultar app al cambiar el estado de auth
  auth.onAuthStateChanged((user) => {
    const allSections = document.querySelectorAll(
      "main, header, footer, #mainNav, #context, #market, #expenses, #portfolio, #notes, #balance, #summary, #news, #history, #exportCSV"
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
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.style.background = "#00d084";
    logoutBtn.style.color = "#000";
    logoutBtn.style.border = "none";
    logoutBtn.style.borderRadius = "6px";
    logoutBtn.style.padding = "8px 16px";
    logoutBtn.style.marginTop = "15px";
    logoutBtn.style.cursor = "pointer";
    logoutBtn.onclick = async () => {
      await auth.signOut();
      alert("👋 Has cerrado sesión correctamente.");
      window.location.reload();
    };
    footer.appendChild(logoutBtn);
  }
});
