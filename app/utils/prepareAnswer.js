const QuickChart = require('quickchart-js');

function numberWithIndianCommas(x) {
  let y = x.toString();
  let polarity;
  if (y[0] === '-') {
    polarity = '-';
    y = y.slice(1);
  } else { polarity = ''; }

  if (y.length > 3) {
    const z = y.substr(y.length - 3, 3);
    y = y.substr(0, y.length - 3);
    y = y.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return `${polarity}${y},${z}`;
  }
  return `${polarity}${y}`;
}

function prepareStatsCompactAnswer(body, index, nameState) {
  const { statewise } = body;
  const statedata = statewise[index];
  let data = `<b> ${nameState} </b>`;
  data += `\n\u{1F534} Confirmed: ${numberWithIndianCommas(statedata.confirmed)}`;
  if (parseInt(statedata.deltaconfirmed, 10) > 0) {
    data += `<i> (+${numberWithIndianCommas(statedata.deltaconfirmed, 10)}) </i>`;
  }
  data += `\n\u{1F7E0} Active: ${numberWithIndianCommas(statedata.active)}`;

  let deltaActive = parseInt(statedata.deltaconfirmed, 10)
    - parseInt(statedata.deltarecovered, 10) - parseInt(statedata.deltadeaths, 10);

  // change in active number will not be displayed if it is zero.
  if (deltaActive > 0) {
    data += `<i> (+${numberWithIndianCommas(deltaActive)}) </i>`;
  } else if (deltaActive < 0) {
    // required to display change in active numbers correctly if active number decreases
    deltaActive = Math.abs(deltaActive);
    data += `<i> (-${numberWithIndianCommas(deltaActive)}) </i>`;
  }

  data += `\n\u{1F7E2} Recovered: ${numberWithIndianCommas(statedata.recovered)}`;
  if (parseInt(statedata.deltarecovered, 10) > 0) {
    data += `<i> (+${numberWithIndianCommas(statedata.deltarecovered)}) </i>`;
  }
  data += `\n\u{26AB} Deaths: ${numberWithIndianCommas(statedata.deaths)}`;
  if (parseInt(statedata.deltadeaths, 10) > 0) {
    data += `<i> (+${numberWithIndianCommas(statedata.deltadeaths)}) </i>`;
  }
  return data;
}

function prepareAllIndiaCasesTested(body) {
  const noOfTests = body.tested.reverse()[0].totalsamplestested;
  const data = `\n\u{26AA} ${numberWithIndianCommas(noOfTests)} citizens tested`;
  return data;
}

function prepareStatsStateAnswer(body) {
  const { statewise } = body;
  let data = '\n\n\u{1F4C8} Top 15 states with most cases';

  // Sorting the data
  statewise.sort((a, b) => b.confirmed - a.confirmed);

  statewise.forEach((object, index) => {
    if (index === 0 || index > 15) return;

    data += `\n<b>${object.state}</b>: ${numberWithIndianCommas(object.confirmed)}`;
    if (parseInt(object.deltaconfirmed, 10) > 0) {
      data += `<i> (+${numberWithIndianCommas(object.deltaconfirmed)}) </i>`;
    }
  });
  return data;
}

function prepareStatsDistrictAnswer(body, stateName) {
  if (body === undefined || stateName === undefined || body[stateName] === undefined) return true;

  const districtwise = body[stateName];
  const { districtData } = districtwise;

  // Preparing a sorted array to use it later to
  // access names in sorted order
  const sortedData = [];

  Object.keys(districtData).forEach((key) => {
    sortedData.push({
      name: key,
      confirmed: districtData[key].confirmed,
      delta: districtData[key].delta,
    });
  });

  sortedData.sort((x, y) => y.confirmed - x.confirmed);

  let data = '\n\n\u{1F4C8} District-wise analysis';
  for (let i = 0; i < sortedData.length; i += 1) {
    const eachDistrictData = districtData[sortedData[i].name];
    data += `\n<b>${sortedData[i].name}</b>: ${numberWithIndianCommas(eachDistrictData.confirmed)}`;
    const deltaData = eachDistrictData.delta;
    if (parseInt(deltaData.confirmed, 10) > 0) {
      data += `<i> (+${numberWithIndianCommas(deltaData.confirmed)}) </i>`;
    }
  }
  return data;
}

function prepareStateTestStat(body, stateName) {
  const stateWise = body.states_tested_data; let stateDataIndex = -1;
  for (let index = stateWise.length - 1; index >= 0; index -= 1) {
    const currentData = stateWise[index];
    if (currentData.state.toLowerCase() === stateName.toLowerCase()) {
      stateDataIndex = index;
      break;
    }
  }
  if (stateDataIndex === -1) { return true; }
  stateDataIndex -= 1;
  const stateData = stateWise[stateDataIndex];
  const data = `\n\u{26AA} ${numberWithIndianCommas(stateData.totaltested)} citizens tested`;
  return data;
}

function prepareDailyStatsAnswer(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  let data = `\n\n\u{1F55C} Daily change analysis for past ${minN} days (<i>All India</i>)\n`;
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    let { date } = dailyData[i];
    date = date.substring(0, date.length - 1);
    data += `\n<b>${date}</b>: ${numberWithIndianCommas(dailyData[i].dailyconfirmed)} new cases.`;
  }
  return data;
}

function prepareDailyActiveAnswer(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  let data = `\n\n\u{1F55C} Daily new active cases analysis for past ${minN} days (<i>All India</i>)\n`;
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    let { date } = dailyData[i];
    date = date.substring(0, date.length - 1);
    data += `\n<b>${date}</b>: ${numberWithIndianCommas(dailyData[i].dailyconfirmed - dailyData[i].dailydeceased - dailyData[i].dailyrecovered)} new active cases.`;
  }
  return data;
}

function prepareDailyRecoveredAnswer(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  let data = `\n\n\u{1F55C} Daily new recovered cases analysis for past ${minN} days (<i>All India</i>)\n`;
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    let { date } = dailyData[i];
    date = date.substring(0, date.length - 1);
    data += `\n<b>${date}</b>: ${numberWithIndianCommas(dailyData[i].dailyrecovered)} new recovery cases.`;
  }
  return data;
}

function prepareDailyDeceasedAnswer(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  let data = `\n\n\u{1F55C} Daily new deceased cases analysis for past ${minN} days (<i>All India</i>)\n`;
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    let { date } = dailyData[i];
    date = date.substring(0, date.length - 1);
    data += `\n<b>${date}</b>: ${numberWithIndianCommas(dailyData[i].dailydeceased)} new deceased cases.`;
  }
  return data;
}

function prepareTestingResourceAnswer(stateResources) {
  if (stateResources.length === 0) {
    const temp = ['\n\n\u{1F9EA} No COVID-19 Testing Labs found'];
    return temp;
  }

  const data = [`\n\n\u{1F9EA} COVID-19 Testing Labs in ${stateResources[0].state}, found ${stateResources.length} results\n`];

  for (let i = 0; i < stateResources.length; i += 1) {
    let tempData = `\n<b>${stateResources[i].nameoftheorganisation}, ${stateResources[i].city}\n`
      + `</b>Description: ${stateResources[i].descriptionandorserviceprovided}.\n`;
    if (stateResources[i].phonenumber.length > 0) { tempData += `<i>Phone Number: ${stateResources[i].phonenumber}</i>\n`; }
    if (stateResources[i].contact.length > 0) { tempData += `<i>Website: ${stateResources[i].contact}</i>\n`; }
    data.push(tempData);
  }
  return data;
}

function prepareNewTopStatesStat(body) {
  const statesData = body.statewise; const sortedData = [];
  let storeIndex = new Map();
  for (let index = 0; index < statesData.length; index += 1) {
    const currentState = statesData[index];
    if (parseInt(currentState.deltaconfirmed, 10) > 0
      && currentState.state !== 'State Unassigned'
      && currentState.state !== 'Total') storeIndex.set(index, parseInt(currentState.deltaconfirmed, 10));
  }

  storeIndex = new Map([...storeIndex.entries()].sort((a, b) => b[1] - a[1]));

  const itr = storeIndex.keys();
  for (let i = 0; i < storeIndex.size; i += 1) sortedData.push(itr.next().value);

  let data = `<b>Total New Cases: </b>${numberWithIndianCommas(body.statewise[0].deltaconfirmed)}\n`;
  data += '\n<b>\u{1F4C8}Top States With Most New Confirmed Cases</b>';
  let len;
  if (sortedData.length === 0) {
    data += '\nNo data for new cases available right now!!';
    return data;
  }
  if (sortedData.length > 15) {
    len = 15;
  } else {
    len = sortedData.length;
  }

  for (let i = 0; i < len; i += 1) {
    const currentState = statesData[sortedData[i]];
    data += `\n<b>${currentState.state}:</b> ${numberWithIndianCommas(currentState.confirmed)} <i>(+${numberWithIndianCommas(currentState.deltaconfirmed)})</i>`;
  }
  return data;
}

function prepareNewDistrictWiseState(body, stateName) {
  const stateData = body[stateName];
  if (stateData === undefined) {
    const data = '\nNo data for district wise new cases available right now !';
    return data;
  }
  const { districtData } = stateData;
  const sortedData = [];
  let flag = false;

  Object.keys(districtData).forEach((key) => {
    if (parseInt(districtData[key].delta.confirmed, 10) > 0) flag = true;
    sortedData.push({
      name: key,
      delta: districtData[key].delta.confirmed,
      confirmed: districtData[key].confirmed,
    });
  });

  let data = `\n\n\u{1F4C8} <b>Top districts with most new confirmed cases for ${stateName}</b>\n`;

  if (!flag) {
    data += '\nNo data for district wise new cases available right now !';
    return data;
  }

  sortedData.sort((x, y) => y.confirmed - x.confirmed);// applied this to display district with
  // higher no of cases above other district
  // if they both have equal new confirmed cases
  sortedData.sort((x, y) => y.delta - x.delta);

  for (let i = 0; i < sortedData.length; i += 1) {
    const eachDistrictData = districtData[sortedData[i].name];
    const deltaData = eachDistrictData.delta;
    if (parseInt(deltaData.confirmed, 10) > 0) {
      data += `\n<b>${sortedData[i].name}</b>: ${numberWithIndianCommas(eachDistrictData.confirmed)}`;
      data += `<i> (+${numberWithIndianCommas(deltaData.confirmed)}) </i>`;
    }
  }
  return data;
}

async function dailyStatsGraph(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  const data = [];
  const dateLabel = [];
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    data.push(dailyData[i].dailyconfirmed);
    dateLabel.push(`${dailyData[i].date}`);
  }
  data.reverse();
  dateLabel.reverse();

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'line',
      data: {
        labels: dateLabel,
        datasets: [
          {
            label: 'Daily new cases', data, backgroundColor: 'white', fill: false, borderColor: 'red',
          }],
      },
      options: {
        title: {
          display: true,
          text: `Daily confirmed cases analysis for past ${minN} days`,
        },
      },
    }).setDevicePixelRatio(2);

  const url = await myChart.getShortUrl();

  return url;
}

async function dailyActiveStatsGraph(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  const data = [];
  const dateLabel = [];
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    data.push(
      dailyData[i].dailyconfirmed - dailyData[i].dailydeceased - dailyData[i].dailyrecovered,
    );
    dateLabel.push(`${dailyData[i].date}`);
  }
  data.reverse();
  dateLabel.reverse();

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'line',
      data: {
        labels: dateLabel,
        datasets: [
          {
            label: 'Daily new active cases', data, backgroundColor: 'white', fill: false, borderColor: 'blue',
          }],
      },
      options: {
        title: {
          display: true,
          text: `Daily active cases analysis for past ${minN} days`,
        },
      },
    }).setDevicePixelRatio(2);

  const url = await myChart.getShortUrl();

  return url;
}

async function dailyRecStatsGraph(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  const data = [];
  const dateLabel = [];
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    data.push(dailyData[i].dailyrecovered);
    dateLabel.push(`${dailyData[i].date}`);
  }
  data.reverse();
  dateLabel.reverse();

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'line',
      data: {
        labels: dateLabel,
        datasets: [
          {
            label: 'Daily new recovered cases', data, backgroundColor: 'white', fill: false, borderColor: 'green',
          }],
      },
      options: {
        title: {
          display: true,
          text: `Daily recovered cases analysis for past ${minN} days`,
        },
      },
    }).setDevicePixelRatio(2);

  const url = await myChart.getShortUrl();

  return url;
}

async function dailyDecStatsGraph(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  const data = [];
  const dateLabel = [];
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    data.push(dailyData[i].dailydeceased);
    dateLabel.push(`${dailyData[i].date}`);
  }
  data.reverse();
  dateLabel.reverse();

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'line',
      data: {
        labels: dateLabel,
        datasets: [
          {
            label: 'Daily new deceased cases', data, backgroundColor: 'white', fill: false, borderColor: 'grey',
          }],
      },
      options: {
        title: {
          display: true,
          text: `Daily deceased cases analysis for past ${minN} days`,
        },
      },
    }).setDevicePixelRatio(2);

  const url = await myChart.getShortUrl();

  return url;
}

async function summaryGraph(body, n) {
  const dailyData = body.cases_time_series;
  const minN = Math.min(n, dailyData.length);
  const confirmed = []; const active = []; const recovered = []; const
    deaths = [];
  const dateLabel = [];
  dailyData.reverse();
  for (let i = 0; i < minN; i += 1) {
    confirmed.push(dailyData[i].dailyconfirmed);
    recovered.push(dailyData[i].dailyrecovered);
    deaths.push(dailyData[i].dailydeceased);
    active.push(
      dailyData[i].dailyconfirmed - dailyData[i].dailydeceased - dailyData[i].dailyrecovered,
    );
    dateLabel.push(`${dailyData[i].date}`);
  }
  confirmed.reverse();
  recovered.reverse();
  deaths.reverse();
  active.reverse();
  dateLabel.reverse();

  const myChart = new QuickChart();
  myChart
    .setConfig({
      type: 'line',
      data: {
        labels: dateLabel,
        datasets: [{
          label: 'Confirmed', data: confirmed, backgroundColor: 'white', fill: false, borderColor: 'red',
        },
        {
          label: 'Active', data: active, backgroundColor: 'white', fill: false, borderColor: 'blue',
        },
        {
          label: 'Recovered', data: recovered, backgroundColor: 'white', fill: false, borderColor: 'green',
        },
        {
          label: 'Deceased', data: deaths, backgroundColor: 'white', fill: false, borderColor: 'grey',
        }],
      },
      options: {
        title: {
          display: true,
          text: `Daily cases analysis for past ${minN} days`,
        },
      },
    }).setDevicePixelRatio(2);

  const url = await myChart.getShortUrl();

  return url;
}

module.exports = {
  prepareStatsCompactAnswer,
  prepareAllIndiaCasesTested,
  prepareStatsStateAnswer,
  prepareStatsDistrictAnswer,
  prepareDailyStatsAnswer,
  prepareDailyActiveAnswer,
  prepareDailyRecoveredAnswer,
  prepareTestingResourceAnswer,
  prepareStateTestStat,
  prepareNewTopStatesStat,
  prepareNewDistrictWiseState,
  dailyStatsGraph,
  dailyActiveStatsGraph,
  prepareDailyDeceasedAnswer,
  dailyRecStatsGraph,
  summaryGraph,
  dailyDecStatsGraph,
};
