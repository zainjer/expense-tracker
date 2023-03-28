import * as echarts from "echarts";

function createPie(elementId, title, data) {
  var chartDom = document.getElementById(elementId);
  var myChart = echarts.init(chartDom);

  var option;

  option = {
    title: {
      text: title,
      subtext: 'Hover to view details',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      // orient: 'horizontal',
      top: 'bottom'
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

 

  option && myChart.setOption(option);
}

function createBarChart(elementId, title, data) {
  var chartDom = document.getElementById(elementId);
  var myChart = echarts.init(chartDom);
  var option;
  
  option = {
    title: {
      text: title,
      subtext: 'Hover to view details',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      // orient: 'horizontal',
      top: 'bottom'
    },
    dataset: {
      source: [
        ['Date', 'Income', 'Expense'],
        ...data
      ]
    },
    xAxis: { type: 'category' },
    yAxis: {},
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [{ type: 'bar' }, { type: 'bar' }]
  };
  
  option && myChart.setOption(option);


}

function createBarAndLineChart(elementId, title, data) {
  debugger;
  var chartDom = document.getElementById(elementId);
  var myChart = echarts.init(chartDom);
  var option;
  
  option = {
    title: {
      text: title,
      subtext: 'Shows the relative available balance',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      // orient: 'horizontal',
      top: 'bottom'
    },
    dataset: {
      source: [
        ['Date', 'Income', 'Expense','Avialable Balance'],
        ...data
      ]
    },
    xAxis: { type: 'category' },
    yAxis: {},
    // Declare several bar series, each will be mapped
    // to a column of dataset.source by default.
    series: [{ type: 'bar' }, { type: 'bar' }, { type: 'line' }]
  };
  
  option && myChart.setOption(option);


}

function calculateExpenseBreakdownData(expenseList) {
  let expenseBreakdownData = [];

  let debitTransactions = (expenseList.filter(y => y.debit > 0)).map(x=> ({category: x.expenseCategory !== "" ? x.expenseCategory : "Uncategorized" , debit: x.debit}));
  //aggregate sum of debit transactions by category
  let debitTransactionsByCategory = debitTransactions.reduce((a, b) => {
    a[b.category] = (a[b.category] || 0) + b.debit;
    return a;
  }, {});

  Object.keys(debitTransactionsByCategory).forEach(key => {
    expenseBreakdownData.push({name: key, value: debitTransactionsByCategory[key]})
  });

  return expenseBreakdownData;
}

function calculateIncomeBreakdownData(expenseList) {
  let incomeBreakdownData = [];

  let creditTransactions = (expenseList.filter(y => y.credit > 0)).map(x=> ({category: x.incomeCategory !== "" ? x.incomeCategory : "Uncategorized" , credit: x.credit}));
  //aggregate sum of debit transactions by category
  let debitTransactionsByCategory = creditTransactions.reduce((a, b) => {
    a[b.category] = (a[b.category] || 0) + b.credit;
    return a;
  }, {});

  Object.keys(debitTransactionsByCategory).forEach(key => {
    incomeBreakdownData.push({name: key, value: debitTransactionsByCategory[key]})
  });

  return incomeBreakdownData;
}
function calculateExpenseBarChartData(expenseList) {

  //aggregate sum of debit and credit by date
  let expenseData = expenseList.reduce((a, b) => {
    a[b.date] = (a[b.date] || 0) + b.debit;
    return a;
  }, {});

  let incomeData = expenseList.reduce((a, b) => {
    a[b.date] = (a[b.date] || 0) + b.credit;
    return a;
  }, {});

  let expenseBarChartData = [];
  Object.keys(expenseData).forEach(key => {
    expenseBarChartData.push([key,incomeData[key], expenseData[key], ])
  });

  return expenseBarChartData;

}

function calculateExpenseIncomeBalanceData(expenseList) {
   //aggregate sum of debit and credit by date
   let expenseData = expenseList.reduce((a, b) => {
    a[b.date] = (a[b.date] || 0) + b.debit;
    return a;
  }, {});

  let incomeData = expenseList.reduce((a, b) => {
    a[b.date] = (a[b.date] || 0) + b.credit;
    return a;
  }, {});

  let availableBalanceData = expenseList.reduce((a, b) => {
    a[b.date] = b.availableBalance;
    return a;
  }, {});

  let data = [];
  Object.keys(expenseData).forEach(key => {
    data.push([key,incomeData[key], expenseData[key],availableBalanceData[key] ])
  });

  return data;
}
export {
  createPie,
  createBarChart,
  createBarAndLineChart,
  calculateExpenseBreakdownData,
  calculateIncomeBreakdownData,
  calculateExpenseBarChartData,
  calculateExpenseIncomeBalanceData,
};
