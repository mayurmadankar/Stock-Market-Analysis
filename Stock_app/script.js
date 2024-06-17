const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];
let stockRes;
let stockInd = 0;

async function getStocksData(){
  try {
    const resData = {};
    resData.stockDetails = await fetch(`https://stocks3.onrender.com/api/stocks/getstocksdata`).then((res) => res.json());
    resData.stockStatsDetails = await fetch(`https://stocks3.onrender.com/api/stocks/getstockstatsdata`).then((res) => res.json());
    resData.stockProfileDetails = await fetch(`https://stocks3.onrender.com/api/stocks/getstocksprofiledata`).then((res) => res.json());
    return resData; 
  } catch (err) {
    console.error(err);
  }
}

function displayCompanyDescription(stockCompany){
  const stockDescriptonDiv = document.getElementById('stock-description');
  if(stockRes.stockProfileDetails){
    const stockSummaryData = stockRes.stockProfileDetails.stocksProfileData[0];
    const stockData = stockRes.stockStatsDetails.stocksStatsData[0];
    const newHTML = `
      <div class="stock-des-name">Book value: <span class="bluetext">${stockData[stockCompany].bookValue}</span></div>
      <div class="stock-des-name">Profit: <span class="profit">${stockData[stockCompany].profit}</span></div>
      <p class="stock-des-para">${stockSummaryData[stockCompany].summary}</p>
    `;
    stockDescriptonDiv.innerHTML = newHTML;
  }
}

function displayChartData(stockCompany, timePeriod = '1mo'){
  const chartDiv = document.getElementById('chart');
  const companyNameDiv = document.getElementById('company-name');
  const lastDurationDiv = document.getElementById('last-duration');
  const stockRangesDiv = document.getElementById('stock-range-vals');
  const timeBtn = document.getElementById(timePeriod);

  document.querySelector('.active-btn').classList.remove('active-btn');
  timeBtn.classList.add('active-btn');

  const stockVals = stockRes.stockDetails.stocksData[0][stockCompany][timePeriod];

  companyNameDiv.textContent = stockCompany;
  lastDurationDiv.textContent = `Last ${timePeriod}`

  const newHTML = `
    <h4>Peak value: <span id="peak-value">${Math.max(...stockVals.value).toFixed(2)}</span></h4>
    <h4>Low value: <span id="low-value">${Math.min(...stockVals.value).toFixed(2)}</span></h4>
  `;
  stockRangesDiv.innerHTML = newHTML;

  Plotly.newPlot(chartDiv, [{ 
    x: stockVals.timeStamp.map((time) =>  new Date(time * 1000).toLocaleDateString()), 
    y: stockVals.value, 
    type: 'scatter' 
  }])

  displayCompanyDescription(stockCompany);
}

function displayListedCompany(){
  const companyList = document.getElementById('company-list');
  if(stockRes.stockStatsDetails){
    const stockData = stockRes.stockStatsDetails.stocksStatsData[0];
    stocks.forEach((stock) => {
      const newHTML = `
        <div class="company-item">
          <div class="company-list-name">${stock}</div>
          <div>Book value: <span class="bluetext">${stockData[stock].bookValue}</span></div>
          <div>Profit: <span class="${stockData[stock].profit > 0 ? 'profit' : 'loss'}">${stockData[stock].profit}</span></div>
        </div>
      `;
      companyList.insertAdjacentHTML('beforeend', newHTML);
    })
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  stockRes = await getStocksData();
  displayChartData(stocks[stockInd]);
  document.querySelector('#time-div').style.display = 'flex';
  displayListedCompany(stocks[stockInd]);

  const timeBtns = document.getElementById('time-div').querySelectorAll('button');
  timeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      displayChartData(stocks[stockInd], btn.id)
    });
  })

  const companyItemBtns = document.getElementById('company-list').querySelectorAll('.company-item');
  companyItemBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      stockInd = index;
      displayChartData(stocks[stockInd])
    });
  })
});
