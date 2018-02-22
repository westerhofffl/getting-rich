const ALPHA_VANTAGE_API_KEY = 'YFIGM2L9A2765AB9';
const ALPHA_VANTAGE_ENDPOINT = 'https://www.alphavantage.co/query';

const incomes = [];
const expenses = [];
const investments = [];
const debts = [];

const secondsIn30Days = 2592000;

function listenForUserIncome () {
  $('#income-form').submit(function(event) {
    event.preventDefault();

    let userIncomeType = $('#income-option').val();
    let userIncomeAmount = $('#income').val();

    $('#income').val('');

    storingIncomes(userIncomeType, userIncomeAmount);
  });
}

function storingIncomes (userIncomeType, userIncomeAmount) {
  incomes.push({
    'Income Type': userIncomeType,
    'Income Amount': userIncomeAmount
  });
  displayIncomes();
}

function displayIncomes () {
  let output = '';
  incomes.map(function(income) {
    output += `${income['Income Type']}: $${income['Income Amount']}<br>`;
  });
  $('.user-income-values').html(output);
  displayIncomePerSecond();
}

function listenForUserExpense () {
  $('#expense-form').submit(function(event) {
    event.preventDefault();

    let userExpenseType = $('#expense-option').val();
    let userExpenseAmount = $('#expense').val();

    $('#expense').val('');

    storingExpenses(userExpenseType, userExpenseAmount);
  });
}

function storingExpenses (userExpenseType, userExpenseAmount) {
  expenses.push({
    'Expense Type': userExpenseType,
    'Expense Amount': userExpenseAmount
  });
  displayExpenses();
}

function displayExpenses () {
  let output = '';
  expenses.map(function(expense) {
    output += `${expense['Expense Type']}: $${expense['Expense Amount']}<br>`;
  });
  $('.user-expense-values').html(output);
  displayExpensePerSecond();
}

function listenForUserInvestments () {
  $('#investment-form').submit(function(event) {
    event.preventDefault();
    let userInvestment = $('#investment').val().toUpperCase();
    let numberOfShares = $('#investment-quantity').val();
    $('#investment').val('');
    $('#investment-quantity').val('');

    const params = {
      function: 'TIME_SERIES_INTRADAY',
      symbol: userInvestment,
      interval: '1min',
      apikey: ALPHA_VANTAGE_API_KEY
    };

    let investmentData = $.getJSON(ALPHA_VANTAGE_ENDPOINT, params, storingInvestments(userInvestment, numberOfShares)).fail(investmentError);
    console.log(investmentData);
  });
}

function storingInvestments (userInvestment, numberOfShares) {
  investments.push({
    'Investment': userInvestment,
    'Amount Owned': numberOfShares
  });

  console.log(investments);
  displayInvestments();
}

function displayInvestments () {
  let output = '';
  investments.map(function(investment) {
    output += `${investment['Investment']}: ${investment['Amount Owned']}<br>`;
  });
  $('.user-investment-values').html(output);
}

function investmentError () {
  console.log('Sorry. We\'re having trouble finding that investment right now.');
}

function listenForUserDebts () {
  $('#debt-form').submit(function(event) {
    event.preventDefault();
    let userDebt = $('#debt-option').val();
    let userDebtAmountOwed = parseInt($('#debt').val());
    let userDebtInterestRate = parseInt($('#interest-rate').val());
    let userDebtMonthlyPayment = parseInt($('#monthly-payment').val());
    $('#debt').val('');
    $('#interest-rate').val('');
    $('#monthly-payment').val('')
    storingDebts(userDebt, userDebtAmountOwed, userDebtInterestRate, userDebtMonthlyPayment);
  });
}

function storingDebts (userDebt, userDebtAmountOwed, userDebtInterestRate, userDebtMonthlyPayment) {
  debts.push({
    'Debt Type': userDebt,
    'Amount Owed': userDebtAmountOwed,
    'Interest Rate': userDebtInterestRate,
    'Monthly Payment': userDebtMonthlyPayment
  });
  console.log(debts);
  displayDebts();
}

function displayDebts () {
  let output = '';
  debts.map(function(debt) {
    output += `${debt['Debt Type']}: $${debt['Amount Owed']} @ ${debt['Interest Rate']}% interest<br>Monthly Payment: $${debt['Monthly Payment']}<br>`;
  });
  $('.user-debt-values').html(output);
}

function ticker () {
  let tickerValue = 0;
  function incrementTicker () {
    tickerValue += totalIncomePerSecond() - totalExpensesPerSecond() - totalDebtPerSecond() - totalDebtPaymentPerSecond();
    console.log(tickerValue);
    $('.ticker').html(`$ ${tickerValue.toFixed(5)}`);
  }
  setInterval(incrementTicker, 1000);
}

function totalIncomePerSecond () {
  return incomes.reduce(function(total, income) {
    return total + incomePerSecond(income['Income Amount']);
  }, 0);
}

function incomePerSecond(income) {
  return income / secondsIn30Days;
}

function totalExpensesPerSecond () {
  return expenses.reduce(function(total, expense) {
    return total + expensesPerSecond(expense['Expense Amount']);
  }, 0);
}

function expensesPerSecond (expense) {
  return expense / secondsIn30Days;
}

function totalDebtPerSecond () {
  return debts.reduce(function(total, debt) {
    return total + debtPerSecond(debt['Amount Owed'], debt['Interest Rate']);
  }, 0);
}

function debtPerSecond (principal, interestRate) {
  const monthsInYear = 12;
  const compoundDaily = 365;
  const oneYear = 1;
  return compoundInterestFormula(principal, interestRate, compoundDaily, oneYear) / monthsInYear / secondsIn30Days;
}

function totalDebtPaymentPerSecond () {
  return debts.reduce(function(total, debt) {
    return total + debtPaymentPerSecond(debt['Monthly Payment']);
  }, 0);
}

function debtPaymentPerSecond (monthlyPayment) {
  return monthlyPayment / secondsIn30Days;
}

function compoundInterestFormula (principal, interestRate, compoundRatePerYear, lengthOfDebtInYears) {
  //calculates interest sans principal amount
  return principal * Math.pow((1 + (interestRate / 100) / compoundRatePerYear), (compoundRatePerYear * lengthOfDebtInYears)) - principal;
}

function totalInvestmentsPerSecond () { // look up how to handle a 503 error

}

function investmentsPerSecond () {

}

function displayIncomePerSecond () {
  let output = '';
  let incomesPer = incomes.map(function(income) {
    let incomePer = incomePerSecond(income['Income Amount']);
    output += `<li>${income['Income Type']}: $${incomePer.toFixed(5)}</li>`;
  });
  $('.income-list').html(output);
  $('.income-total').html(totalIncomePerSecond().toFixed(5));
}

function displayExpensePerSecond () {
  let output = '';
  let expensesPer = expenses.map(function(expense) {
    let expensePer = expensesPerSecond(expense['Expense Amount']);
    output += `<li>${expense['Expense Type']}: $${expensePer.toFixed(5)}</li>`;
  });
  $('.expense-list').html(output);
  $('.expense-total').html(totalExpensesPerSecond().toFixed(5));
}


$(listenForUserIncome);
$(listenForUserInvestments);
$(listenForUserExpense);
$(listenForUserDebts);
$(ticker);
$(displayIncomePerSecond);
$(displayExpensePerSecond);
