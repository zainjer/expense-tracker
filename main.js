import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import {
  createPie,
  createBarChart,
  createBarAndLineChart,
  calculateExpenseBreakdownData,
  calculateIncomeBreakdownData,
  calculateExpenseBarChartData,
  calculateExpenseIncomeBalanceData,
} from "./charts.js";
import Papa from "papaparse";

// when document is ready
document.addEventListener("DOMContentLoaded", () => {
  window.deleteExpenseList = deleteExpenseList;
  window.updateExpenseCategory = updateExpenseCategory;
  window.updateIncomeCategory = updateIncomeCategory;

  document
    .querySelector('#upload-expense-form>button[type="button"]')
    .addEventListener("click", onUploadExpenseButtonClick);

  const val = localStorage.getItem("expense-lists");
  if (val) {
    JSON.parse(val).forEach((item) => {
      renderExpenseList(item.id, item.expenses);
    });
  }
});

const onUploadExpenseButtonClick = (e) => {
  e.preventDefault();
  const form = document.querySelector("#upload-expense-form");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  let v = data["file"];
  if (v instanceof File) {
    v.text()
      .then((text) => {
        debugger;
        let result = Papa.parse(text);
        let expenses = generateExpenseList(result);
        let id = guid();
        renderExpenseList(id, expenses);
        persistInLocalStorage(id, expenses);
        form.reset();
      })
      .catch((e) => {
        alert(JSON.stringify(e));
        console.log(e);
      });
  }
};

const persistInLocalStorage = (id, expenses) => {
  const val = localStorage.getItem("expense-lists");
  if (val) {
    localStorage.setItem(
      "expense-lists",
      JSON.stringify([...JSON.parse(val), { id, expenses }])
    );
  } else {
    localStorage.setItem("expense-lists", JSON.stringify([{ id, expenses }]));
  }
};

const generateExpenseList = (papaParsed) => {
  let data = papaParsed.data;
  let count = data.length;
  console.log(count);
  let expenseList = [];

  for (let i = 1; i < count; i++) {
    if (data[i][0] === "") {
      continue;
    }
    let expense = {
      date: data[i][0],
      description: data[i][1],
      debit: Number(data[i][2]),
      credit: Number(data[i][3]),
      availableBalance: Number(data[i][4]),
      incomeCategory: "",
      expenseCategory: "",
      itemId: i - 1,
    };
    expenseList.push(expense);
  }
  console.log(expenseList, "EXPENSE LIST");
  return expenseList;
};

const renderExpenseList = (id, expenseList) => {
  let template = document.querySelector("#expense-card-template").innerHTML;
  let lastItem = expenseList[expenseList.length - 1];
  //generate random guid

  template = template.replaceAll("{{expenseListId}}", id);
  template = template.replace(
    "{{dateRange}}",
    `${expenseList[0].date} - ${lastItem.date}`
  );
  template = template.replace(
    "{{totalExpense}}",
    `${expenseList
      .map((x) => x.debit)
      .reduce((a, b) => a + b, 0)
      .toFixed(2)} PKR`
  );
  template = template.replace(
    "{{totalIncome}}",
    `${expenseList
      .map((x) => x.credit)
      .reduce((a, b) => a + b, 0)
      .toFixed(2)} PKR`
  );
  template = template.replace(
    "{{openingBalance}}",
    `${
      expenseList[0].availableBalance -
      expenseList[0].debit +
      expenseList[0].credit
    }`
  );
  template = template.replace(
    "{{closingBalance}}",
    `${lastItem.availableBalance}`
  );

  template = template.replace(
    "{{deleteButton}}",
    `<button type="button" class="btn btn-danger" onclick="deleteExpenseList('${id}')">Delete</button>`
  );
  

  let expenseListContainer = document.querySelector("#expenses-container");
  expenseListContainer.innerHTML += template;

  let rows = "";
  expenseList.forEach((item, i) => {
    rows += `<tr data-expense-id="${i}">
                    <td scope="row">${item.date}</td>
                    <td>${item.description}</td>
                    <td><span class="text-danger">${
                      item.debit > 0 ? item.debit : ""
                    }</span></td>
                    <td><span class="text-success">${
                      item.credit > 0 ? item.credit : ""
                    }</span></td>
                    <td>${item.availableBalance}</td>
                    <td col-span="2">${
                      item.credit > 0
                        ? getIncomeDropDown(item, id)
                        : getExpenseDropDown(item, id)
                    }</td>
                </tr>`;
  });

  document.querySelector(`#table-${id} tbody`).innerHTML = rows;


  populateCharts(id,expenseList)
};

const guid = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

const getExpenseDropDown = (item, expenseListId) => {
  let expense = [
    "Bills",
    "Charity",
    "Education",
    "Entertainment",
    "Food / Dining",
    "Family",
    "Gifts",
    "Groceries",
    "Healthcare",
    "Home",
    "Loan",
    "Committee / BC",
    "Personal Care",
    "Shopping",
    "Software / Subscription",
    "Telecom",
    "Transporation / Fuel",
    "Car / Motorcycle Maintainance",
    "Investments",
    "Other",
    "Taxes / Fees",
  ];

  let options = `<option ${
    item.expenseCategory == "" ? "selected" : ""
  }>Expense</option>`;
  expense.forEach((e) => {
    options += `<option value="${e}" ${
      e == item.expenseCategory ? "selected" : ""
    } >${e}</option>`;
  });

  return `<select class="form-select form-select-lg" name="" onchange="updateExpenseCategory('${expenseListId}',${item.itemId})"> ${options} </select>`;
};

const getIncomeDropDown = (item, expenseListId) => {
  let income = [
    "Salary",
    "Projects",
    "Self Deposit",
    "Dividends",
    "Investments",
    "Rent",
  ];
  let options = `<option ${
    item.incomeCategory == "" ? "selected" : ""
  }>Income</option>`;
  income.forEach((e) => {
    options += `<option value="${e}" ${
      e == item.incomeCategory ? "selected" : ""
    } >${e}</option>`;
  });

  return `<select class="form-select form-select-lg" name="" onchange="updateIncomeCategory('${expenseListId}',${item.itemId})"> ${options} </select>`;
};

const populateCharts = (id,expenseList) => {
  let expensePieData = calculateExpenseBreakdownData(expenseList);
  createPie(`expense-breakdown-${id}`, "Expenses Breakdown", expensePieData);

   let incomePieData = calculateIncomeBreakdownData(expenseList);
   createPie(`income-breakdown-${id}`, "Income Breakdown", incomePieData);

  let expenseBarChartData = calculateExpenseBarChartData(expenseList);
  createBarChart(
    `expense-barchart-${id}`,
    "Expenses Bar Chart",
    expenseBarChartData
  );

  let expenseIncomeBalanceData = calculateExpenseIncomeBalanceData(expenseList);
  createBarAndLineChart(
    `expense-income-balance-barchart-${id}`,
    "Expenses vs Income",
    expenseIncomeBalanceData
  );
}

function deleteExpenseList(id) {
  let val = localStorage.getItem("expense-lists");
  if (val) {
    let parsed = JSON.parse(val);
    let filtered = parsed.filter((x) => x.id !== id);
    localStorage.setItem("expense-lists", JSON.stringify(filtered));
  }

  //remove from DOM
  document.querySelector(`#expense-${id}`).remove();
}

function updateExpenseCategory(expenseListId, itemId) {
  debugger;
  let expensesLists = JSON.parse(localStorage.getItem("expense-lists"));
  let expenseList = expensesLists.find((x) => x.id == expenseListId);
  let expense = expenseList.expenses[itemId];
  let value = document.querySelector(
    `#table-${expenseListId} [data-expense-id="${itemId}"] select`
  ).value;
  expense.expenseCategory = value;
  expensesLists = expensesLists.filter((x) => x.id != expenseListId);
  expensesLists.push(expenseList);
  localStorage.setItem("expense-lists", JSON.stringify(expensesLists));
  populateCharts(expenseListId,expenseList.expenses)
}

function updateIncomeCategory(expenseListId, itemId) {
  let expensesLists = JSON.parse(localStorage.getItem("expense-lists"));
  let expenseList = expensesLists.find((x) => x.id == expenseListId);
  let expense = expenseList.expenses[itemId];
  let value = document.querySelector(
    `#table-${expenseListId} [data-expense-id="${itemId}"] select`
  ).value;
  expense.incomeCategory = value;
  expensesLists = expensesLists.filter((x) => x.id != expenseListId);
  expensesLists.push(expenseList);
  localStorage.setItem("expense-lists", JSON.stringify(expensesLists));
  populateCharts(expenseListId,expenseList.expenses)
}
