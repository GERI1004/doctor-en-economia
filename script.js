/* ===========================================
   📈 DOCTOR EN ECONOMÍA - Market Overview
   =========================================== */

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  getCryptoData();
  getEtfData();
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

function renderExpenseItem(docId, desc, amount, category) {
  const cat = category || "Otros";
  return `
    <span class="expense-info">
      <span class="cat-badge">${cat}</span>
      ${desc}: <strong>${amount.toFixed(2)} DKK</strong>
    </span>
    <span class="expense-actions">
      <button class="edit-btn" onclick="editExpense('${docId}')">✏️ Editar</button>
      <button class="delete-btn" onclick="deleteExpense('${docId}')">🗑️ Eliminar</button>
    </span>`;
}

if (addExpenseBtn) {
  addExpenseBtn.addEventListener("click", async () => {
    const desc = expenseDesc.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const categorySelect = document.getElementById("expenseCategory");
    const category = categorySelect ? categorySelect.value : "Otros";

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
        category: category,
        date: new Date().toISOString(),
      });

      const li = document.createElement("li");
      li.dataset.id = docRef.id;
      li.dataset.description = desc;
      li.dataset.amount = amount;
      li.dataset.category = category;
      li.innerHTML = renderExpenseItem(docRef.id, desc, amount, category);
      expenseList.appendChild(li);

      // Actualizar localStorage para gráfico y totales
      const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
      expensesData.push({ id: docRef.id, amount, date: new Date().toISOString(), category });
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
    li.innerHTML = renderExpenseItem(docId, newDesc, newAmount, li.dataset.category);

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
  li.innerHTML = renderExpenseItem(docId, li.dataset.description, parseFloat(li.dataset.amount), li.dataset.category);
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

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      expenseList.innerHTML = "";
      let total = 0;
      const expensesData = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const expDate = new Date(data.date);

        expensesData.push({ id: docSnap.id, amount: data.amount, date: data.date, category: data.category });

        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
          const li = document.createElement("li");
          li.dataset.id = docSnap.id;
          li.dataset.description = data.description;
          li.dataset.amount = data.amount;
          li.dataset.category = data.category || "Otros";
          li.innerHTML = renderExpenseItem(docSnap.id, data.description, data.amount, data.category);
          expenseList.appendChild(li);
          total += data.amount;
        }
      });

      totalDisplay.textContent = total.toFixed(2);
      localStorage.setItem("totalExpenses", total);
      localStorage.setItem("expenses", JSON.stringify(expensesData));

      // Cargar ingresos del mes actual desde Firestore
      const incomeSnapshot = await db
        .collection("users")
        .doc(user.uid)
        .collection("income")
        .get();

      if (!incomeSnapshot.empty) {
        let incomeTotal = 0;
        incomeSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const incDate = new Date(data.date);
          if (incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear) {
            incomeTotal += data.amount;
          }
        });
        localStorage.setItem("totalIncome", incomeTotal);
        totalIncome = incomeTotal;
      }

      // Cargar preferencias de usuario desde Firestore
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists && userDoc.data().payday) {
        const savedPayday = userDoc.data().payday;
        localStorage.setItem("payday", savedPayday);
        const paydayDisplay = document.getElementById("paydayDisplay");
        if (paydayDisplay) paydayDisplay.textContent = savedPayday;
      }

      await checkAndAutoSavePreviousMonth(user.uid);
      updateBalanceDisplay();
      updateExpensesChart();
      loadIncomeList();
      loadNotes();
      loadHistory();
      loadCumulativeSavings();
      loadMarketNews();
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

      incomeInput.value = "";
      await loadIncomeList();
    } catch (error) {
      console.error("❌ Error saving income:", error);
      alert("⚠️ Error al guardar el ingreso. Inténtalo de nuevo.");
    }
  });
}

async function loadIncomeList() {
  const user = auth.currentUser;
  if (!user) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  try {
    const snapshot = await db.collection("users").doc(user.uid).collection("income").get();
    const incomeList = document.getElementById("incomeList");
    if (!incomeList) return;

    incomeList.innerHTML = "";
    let incomeTotal = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const incDate = new Date(data.date);
      if (incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear) {
        incomeTotal += data.amount;
        const li = document.createElement("li");
        li.innerHTML = `${data.amount.toFixed(2)} DKK
          <button class="delete-btn" onclick="deleteIncome('${docSnap.id}', ${data.amount})">🗑️ Eliminar</button>`;
        incomeList.appendChild(li);
      }
    });

    totalIncome = incomeTotal;
    localStorage.setItem("totalIncome", incomeTotal);
    updateBalanceDisplay();
  } catch (err) {
    console.error("❌ Error loading income:", err);
  }
}

async function deleteIncome(docId, amount) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection("users").doc(user.uid).collection("income").doc(docId).delete();
    await loadIncomeList();
  } catch (err) {
    console.error("❌ Error deleting income:", err);
    alert("⚠️ Error al eliminar el ingreso. Inténtalo de nuevo.");
  }
}

async function checkAndAutoSavePreviousMonth(uid) {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevDate.toLocaleString("es-ES", { month: "long" });
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();

  const existing = await db.collection("users").doc(uid).collection("history")
    .where("month", "==", prevMonthName).where("year", "==", prevYear).get();
  if (!existing.empty) return;

  const [expSnap, incSnap] = await Promise.all([
    db.collection("users").doc(uid).collection("expenses").get(),
    db.collection("users").doc(uid).collection("income").get(),
  ]);

  let prevExpenses = 0;
  expSnap.forEach(doc => {
    const d = new Date(doc.data().date);
    if (d.getMonth() === prevMonth && d.getFullYear() === prevYear)
      prevExpenses += doc.data().amount;
  });

  let prevIncome = 0;
  incSnap.forEach(doc => {
    const d = new Date(doc.data().date);
    if (d.getMonth() === prevMonth && d.getFullYear() === prevYear)
      prevIncome += doc.data().amount;
  });

  if (prevIncome === 0 && prevExpenses === 0) return;

  await db.collection("users").doc(uid).collection("history").add({
    month: prevMonthName,
    year: prevYear,
    income: prevIncome,
    expenses: prevExpenses,
    balance: prevIncome - prevExpenses,
    timestamp: prevDate.toISOString(),
    auto: true,
  });
  console.log(`✅ Mes anterior (${prevMonthName} ${prevYear}) guardado automáticamente.`);
}

async function loadCumulativeSavings() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection("users").doc(user.uid).collection("history").get();
    let cumulative = 0;
    snapshot.forEach((docSnap) => {
      cumulative += docSnap.data().balance || 0;
    });
    const el = document.getElementById("cumulativeSavings");
    if (el) {
      el.textContent = cumulative.toFixed(2);
      el.style.color = cumulative >= 0 ? "#00d084" : "#ff4d4d";
    }
  } catch (err) {
    console.error("❌ Error loading cumulative savings:", err);
  }
}

function updateBalanceDisplay() {
  totalIncome = parseFloat(localStorage.getItem("totalIncome")) || totalIncome || 0;
  totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const currentBalance = totalIncome - totalExpenses;

  if (totalIncomeDisplay) totalIncomeDisplay.textContent = totalIncome.toFixed(2);
  if (totalExpensesDisplay) totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
  if (currentBalanceDisplay) {
    currentBalanceDisplay.textContent = currentBalance.toFixed(2);
    currentBalanceDisplay.style.color = currentBalance >= 0 ? "#00d084" : "#ff4d4d";
  }

  const headerBalance = document.getElementById("headerBalance");
  if (headerBalance) {
    if (totalIncome > 0) {
      headerBalance.textContent = currentBalance >= 0
        ? `💚 Balance del mes: +${currentBalance.toFixed(2)} DKK`
        : `🔴 Balance del mes: ${currentBalance.toFixed(2)} DKK`;
      headerBalance.style.color = currentBalance >= 0 ? "#00d084" : "#ff4d4d";
    } else {
      headerBalance.textContent = "";
    }
  }

  updateProgressBar();
}

// ===========================================
// 📊 GRÁFICO DE GASTOS POR CATEGORÍA
// ===========================================
let expensesChartInstance = null;

function updateExpensesChart() {
  const canvas = document.getElementById("expensesChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const expensesData = JSON.parse(localStorage.getItem("expenses")) || [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("es-ES", { month: "long", year: "numeric" });
  const categoryTotals = {};

  expensesData.forEach((exp) => {
    if (!exp.date) return;
    const d = new Date(exp.date);
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;
    const cat = exp.category || "Otros";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
  });

  const titleEl = document.getElementById("categoryChartTitle");
  if (titleEl) titleEl.textContent = `📊 Gastos por categoría — ${monthName}`;

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  const total = values.reduce((a, b) => a + b, 0);
  const legendEl = document.getElementById("categoryLegend");
  const colors = ["#00d084", "#4ecdc4", "#45b7d1", "#f7dc6f", "#e74c3c"];

  if (labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (legendEl) legendEl.innerHTML = "<p style='color:#aaa;font-size:0.88rem'>Sin gastos registrados este mes.</p>";
    return;
  }

  if (expensesChartInstance) expensesChartInstance.destroy();

  expensesChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length] + "dd"),
        borderColor: "#0e1117",
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const val = item.parsed;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return `  ${val.toFixed(2)} DKK (${pct}%)`;
            },
          },
        },
      },
    },
  });

  if (legendEl) {
    legendEl.innerHTML = "";
    labels.forEach((cat, i) => {
      const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : 0;
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `
        <span class="legend-dot" style="background:${colors[i % colors.length]}"></span>
        <span style="flex:1"><strong>${cat}</strong></span>
        <span>${values[i].toFixed(2)} DKK</span>
        <span class="legend-pct">${pct}%</span>
      `;
      legendEl.appendChild(item);
    });
  }
}

// ===========================================
// 📊 BARRA DE PROGRESO DEL PRESUPUESTO
// ===========================================
function updateProgressBar() {
  const totalIncomeVal = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalExpensesVal = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("budgetText");
  const detail = document.getElementById("budgetDetail");
  if (!bar || !text || !detail) return;

  if (totalIncomeVal === 0) {
    text.textContent = "Añade tus ingresos para ver el progreso del mes.";
    bar.style.width = "0%";
    detail.textContent = "";
    return;
  }

  const pct = Math.min((totalExpensesVal / totalIncomeVal) * 100, 100);
  const color = pct < 60 ? "#00d084" : pct < 90 ? "#f7dc6f" : "#ff4d4d";

  bar.style.width = `${pct.toFixed(1)}%`;
  bar.style.background = color;
  text.innerHTML = `Has usado el <strong style="color:${color}">${pct.toFixed(1)}%</strong> de tus ingresos este mes`;
  detail.textContent = `${totalExpensesVal.toFixed(2)} DKK gastados de ${totalIncomeVal.toFixed(2)} DKK ingresados`;
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
    savePaydayBtn.addEventListener("click", async () => {
      const newDay = parseInt(paydayInput.value);
      if (isNaN(newDay) || newDay < 1 || newDay > 31) {
        alert("⚠️ Introduce un día válido entre 1 y 31.");
        return;
      }
      payday = newDay;
      localStorage.setItem("payday", payday);
      if (paydayDisplay) paydayDisplay.textContent = payday;
      paydayInput.value = "";

      const user = auth.currentUser;
      if (user) {
        try {
          await db.collection("users").doc(user.uid).set({ payday }, { merge: true });
        } catch (err) {
          console.error("❌ Error saving payday:", err);
        }
      }
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
      await loadCumulativeSavings();
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

const newsFeed = document.getElementById("newsFeed");
const loadNewsBtn = document.getElementById("loadNews");
const newsApiKey = "pub_6561e61294f94e71ac555b551d6dc3b6";
const newsQuery = "bitcoin OR ethereum OR ETF OR nasdaq OR inflation OR \"interest rates\" OR \"stock market\" OR investing OR cryptocurrency OR \"S&P 500\" OR dividends";

async function loadMarketNews(forceRefresh = false) {
  if (!newsFeed) return;

  const CACHE_KEY = "newsCache";
  const CACHE_TTL = 30 * 60 * 1000;
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");

  if (!forceRefresh && cached && Date.now() - cached.ts < CACHE_TTL) {
    renderNews(cached.results);
    return;
  }

  newsFeed.innerHTML = "<p>Cargando noticias...</p>";

  try {
    const url = `https://newsdata.io/api/1/news?apikey=${newsApiKey}&q=${encodeURIComponent(newsQuery)}&language=en`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.status !== "success" || !data.results || data.results.length === 0) {
      newsFeed.innerHTML = "<p>No se han encontrado noticias recientes.</p>";
      return;
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), results: data.results.slice(0, 9) }));
    renderNews(data.results.slice(0, 9));

  } catch (error) {
    console.error("❌ Error loading news:", error);
    newsFeed.innerHTML = `<p>⚠️ Error al cargar las noticias: ${error.message}</p>`;
  }
}

function renderNews(articles) {
  if (!newsFeed) return;
  newsFeed.innerHTML = "";

  articles.forEach(article => {
    if (!article.title || !article.link) return;

    const card = document.createElement("div");
    card.className = "news-card";

    if (article.image_url) {
      const img = document.createElement("img");
      img.src = article.image_url;
      img.className = "news-img";
      img.alt = "";
      img.onerror = () => img.remove();
      card.appendChild(img);
    }

    const content = document.createElement("div");
    content.className = "news-content";

    const meta = document.createElement("div");
    meta.className = "news-meta";

    const source = document.createElement("span");
    source.className = "news-source";
    source.textContent = (article.source_id || "").replace(/-/g, " ").toUpperCase();

    const dateEl = document.createElement("span");
    dateEl.className = "news-date";
    dateEl.textContent = article.pubDate
      ? "📅 " + new Date(article.pubDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
      : "";

    meta.appendChild(source);
    meta.appendChild(dateEl);

    const titleEl = document.createElement("h3");
    titleEl.className = "news-title";
    titleEl.textContent = article.title;

    const btn = document.createElement("a");
    btn.href = article.link;
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.className = "news-btn";
    btn.textContent = "Leer artículo →";

    content.appendChild(meta);
    content.appendChild(titleEl);

    if (article.description) {
      const desc = document.createElement("p");
      desc.className = "news-desc";
      desc.textContent = article.description.slice(0, 160) + (article.description.length > 160 ? "…" : "");
      content.appendChild(desc);
    }

    content.appendChild(btn);
    card.appendChild(content);
    newsFeed.appendChild(card);
  });
}

if (loadNewsBtn) loadNewsBtn.addEventListener("click", () => loadMarketNews(true));

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
