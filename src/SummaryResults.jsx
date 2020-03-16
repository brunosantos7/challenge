import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SummaryResults({
  formatAsPercentageCb,
  formatAsDolarNumberCb,
  ceclValue,
  showSummary
}) {
  const [totalCecl, setTotalCecl] = useState(0);
  const [bankAllValue, setBankAllValue] = useState(0);
  const [
    bankAllValueToCurrentBalanceTotal,
    setBankAllValueToCurrentBalanceTotal
  ] = useState(0);

  const [lines, setLines] = useState([
    {
      fieldId: 1,
      label: "Unsecured Credit Card Loans",
      years: 5,
      averageLoans: 0,
      netChargeoffsSum: 0,
      historicalRate: 0,
      userAdjustments: 0,
      futureRate: 0,
      currentBalance: 0,
      impliedResult: 0
    },
    {
      fieldId: 2,
      label: "New Vehicle Loans",
      years: 4,
      averageLoans: 0,
      netChargeoffsSum: 0,
      historicalRate: 0,
      userAdjustments: 0,
      futureRate: 0,
      currentBalance: 0,
      impliedResult: 0
    },
    {
      fieldId: 999,
      label: "Total Gross Loans",
      years: 0,
      averageLoans: 0,
      netChargeoffsSum: 0,
      historicalRate: 0,
      userAdjustments: 0,
      futureRate: 0,
      currentBalance: 0,
      impliedResult: 0
    }
  ]);

  const loadLineByYearsAndFieldId = (years, fieldId) => {
    axios
      .get(
        `https://react-code-challenge.herokuapp.com/codeChallenge?fieldId=${fieldId}&years=${years}`
      )
      .then(result => {
        const { averageLoans, netChargeoffsSum } = result.data;

        calculateAllData(averageLoans, fieldId, netChargeoffsSum);
      });
  };

  const calculateAllData = (averageLoans, fieldId, netChargeoffsSum) => {
    let linesCopy = lines.slice();
    let item = linesCopy.filter(item => item.fieldId === fieldId)[0];
    item.averageLoans = averageLoans;
    item.netChargeoffsSum = netChargeoffsSum;
    item.historicalRate = netChargeoffsSum / averageLoans;

    item.futureRate =
      parseFloat(item.historicalRate) + parseFloat(item.userAdjustments / 100);

    item.impliedResult = item.futureRate * item.currentBalance;

    setLines(linesCopy);

    calculeTotal();
  };

  useEffect(() => {
    loadLineByYearsAndFieldId(lines[0].years, lines[0].fieldId);
    loadLineByYearsAndFieldId(lines[1].years, lines[1].fieldId);
  }, []);

  const calculeTotal = () => {
    const totalLine = lines.reduce((total, currentItem) => {
      if (currentItem.fieldId !== 999) {
        const sum = {
          averageLoans: total.averageLoans + currentItem.averageLoans,
          netChargeoffsSum:
            total.netChargeoffsSum + currentItem.netChargeoffsSum,

          currentBalance:
            parseFloat(total.currentBalance) +
            parseFloat(currentItem.currentBalance),

          impliedResult: total.impliedResult + currentItem.impliedResult
        };
        return sum;
      }

      return total;
    });

    let linesCopy = lines.slice();
    let item = linesCopy.filter(item => item.fieldId === 999)[0];

    item.averageLoans = totalLine.averageLoans;
    item.netChargeoffsSum = totalLine.netChargeoffsSum;
    item.currentBalance = totalLine.currentBalance;
    item.historicalRate = totalLine.netChargeoffsSum / totalLine.averageLoans;
    item.impliedResult = totalLine.impliedResult;

    item.years = getYearsTotal().yearsTotal;
    item.userAdjustments = getYearsTotal().userAdjustmentsTotal;
    item.futureRate = getYearsTotal().futureRateTotal;

    setLines(linesCopy);
    calculeBankAllValueToCurrentBalanceTotal();
  };

  const getYearsTotal = () => {
    let value = lines.map(line => {
      if (line.fieldId !== 999) {
        const totalIndex = lines.length - 1;

        return {
          years:
            line.years * (line.averageLoans / lines[totalIndex].averageLoans),
          userAdjustments:
            line.userAdjustments *
            (line.currentBalance / lines[totalIndex].currentBalance),
          futureRate:
            line.futureRate *
            (line.currentBalance / lines[totalIndex].currentBalance)
        };
      }
    });

    return value.reduce((totalValues, currentItem) => {
      if (currentItem !== undefined) {
        return {
          yearsTotal: totalValues.years + currentItem.years,
          userAdjustmentsTotal:
            totalValues.userAdjustments + currentItem.userAdjustments,
          futureRateTotal: totalValues.futureRate + currentItem.futureRate
        };
      }

      return totalValues;
    });
  };

  const setYears = (e, item) => {
    if (e.target.value > 5 || e.target.value < 0) {
      return;
    }

    let copy = lines.slice();
    let itemFromLines = copy.filter(t => t.fieldId === item.fieldId).slice();

    itemFromLines[0].years = e.target.value;
    setLines(copy);
  };

  const setUserAdjustments = (e, item) => {
    let copy = lines.slice();
    let itemFromLines = copy.filter(t => t.fieldId === item.fieldId).slice();

    itemFromLines[0].userAdjustments = e.target.value;
    setLines(copy);
  };

  const setCurrentBalance = (e, item) => {
    let copy = lines.slice();
    let itemFromLines = copy.filter(t => t.fieldId === item.fieldId).slice();

    itemFromLines[0].currentBalance = e.target.value;
    setLines(copy);
  };

  const isNegative = value => {
    return value < 0;
  };

  const calculeBankAllValueToCurrentBalanceTotal = () => {
    const value = bankAllValue / lines[lines.length - 1].currentBalance;
    const result = value && value !== Infinity ? value : 0;

    setBankAllValueToCurrentBalanceTotal(result);
  };

  const simpleTableLine = item => {
    return (
      <tr key={item.fieldId}>
        <td>{item.label}</td>
        <td>
          <input
            onBlur={() => loadLineByYearsAndFieldId(item.years, item.fieldId)}
            onChange={e => setYears(e, item)}
            value={item.years}
          />
        </td>
        <td>{formatAsDolarNumberCb(item.averageLoans, 0)} </td>
        <td>{formatAsDolarNumberCb(item.netChargeoffsSum, 0)}</td>
        <td className="border-left">
          {formatAsPercentageCb(item.historicalRate)}
        </td>
        <td></td>
        <td>
          <input
            onBlur={() =>
              calculateAllData(
                item.averageLoans,
                item.fieldId,
                item.netChargeoffsSum
              )
            }
            onChange={e => setUserAdjustments(e, item)}
            value={item.userAdjustments}
          />
        </td>
        <td></td>
        <td> {formatAsPercentageCb(item.futureRate)}</td>
        <td></td>
        <td>
          <input
            onBlur={() =>
              calculateAllData(
                item.averageLoans,
                item.fieldId,
                item.netChargeoffsSum
              )
            }
            onChange={e => setCurrentBalance(e, item)}
            value={item.currentBalance}
          />
        </td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.impliedResult)}</td>
      </tr>
    );
  };

  const totalTableLine = item => {
    return (
      <tr key={item.fieldId}>
        <td>{item.label}</td>
        <td>{item.years.toFixed(2)}</td>
        <td>{formatAsDolarNumberCb(item.averageLoans, 0)} </td>
        <td>{formatAsDolarNumberCb(item.netChargeoffsSum, 0)}</td>
        <td className="border-left">
          {formatAsPercentageCb(item.historicalRate)}
        </td>
        <td></td>
        <td>{item.userAdjustments ? item.userAdjustments.toFixed(2) : 0}%</td>
        <td></td>
        <td> {formatAsPercentageCb(item.futureRate ? item.futureRate : 0)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.currentBalance, 0)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.impliedResult)}</td>
      </tr>
    );
  };

  return (
    <div style={{ display: showSummary ? "" : "none" }}>
      <table border="0" cellSpacing="0" cellPadding="4">
        <thead className="table-head">
          <tr>
            <td colSpan="4"></td>
            <td
              className="blue-header underline-header border-left"
              colSpan="5"
            >
              Life of Loan Net Chargeoff Rate:
            </td>
            <td style={{ background: "white" }}></td>
            <td
              className="blue-header underline-header  border-left"
              colSpan="3"
            >
              Current Expected Credit Loss
            </td>
          </tr>
          <tr>
            <td colSpan="4"></td>
            <td style={{ fontStyle: "italic" }} className="border-left">
              (A)
            </td>
            <td>+</td>
            <td style={{ fontStyle: "italic" }}>(B)</td>
            <td>=</td>
            <td style={{ fontStyle: "italic" }}>(C)</td>
            <td style={{ background: "white" }}></td>
            <td style={{ fontStyle: "italic" }}>(D)</td>
            <td></td>
            <td style={{ fontStyle: "italic" }}>(D x C)</td>
          </tr>
          <tr>
            <td></td>
            <td>WARM</td>
            <td>Avg</td>
            <td>Agg</td>
            <td className="border-left">Historical</td>
            <td></td>
            <td>User</td>
            <td></td>
            <td>Future</td>
            <td style={{ background: "white" }}></td>
            <td>Current</td>
            <td></td>
            <td>Implied</td>
          </tr>
          <tr>
            <td></td>
            <td>In Years</td>
            <td>Balance</td>
            <td>Net Chargeoffs</td>
            <td className="border-left">Rate</td>
            <td></td>
            <td>Adjustment </td>
            <td></td>
            <td>Rate</td>
            <td style={{ background: "white" }}></td>
            <td>Balance</td>
            <td></td>
            <td>Result</td>
          </tr>
        </thead>
        <tbody align="right">
          {lines.map(item => {
            if (item.fieldId !== 999) {
              return simpleTableLine(item);
            }
            return totalTableLine(item);
          })}
          <tr>
            <td colSpan="4"></td>
            <td style={{ background: "lightblue" }} colSpan="4"></td>
            <td style={{ background: "lightblue" }}>
              {formatAsPercentageCb(bankAllValueToCurrentBalanceTotal)}
            </td>
            <td style={{ background: "lightblue" }} colSpan="3">
              Bank ALL
            </td>
            <td>
              <input
                onBlur={e => {
                  calculeBankAllValueToCurrentBalanceTotal();

                  setTotalCecl(
                    bankAllValue -
                      lines[lines.length - 1].impliedResult +
                      ceclValue
                  );
                }}
                onChange={e => setBankAllValue(e.target.value)}
                value={bankAllValue}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="9"></td>
            <td
              style={{ background: isNegative(ceclValue) ? "red" : "green" }}
            ></td>
            <td
              style={{ background: isNegative(ceclValue) ? "red" : "green" }}
              colSpan="2"
            >
              CECL {isNegative(ceclValue) ? "ShortFall" : "Surplus"} for
              Unfunded
            </td>
            <td style={{ background: isNegative(ceclValue) ? "red" : "green" }}>
              {formatAsDolarNumberCb(ceclValue, 0)}
            </td>
          </tr>
          <tr>
            <td colSpan="9"></td>
            <td
              style={{ background: isNegative(totalCecl) ? "red" : "green" }}
            ></td>
            <td
              style={{ background: isNegative(totalCecl) ? "red" : "green" }}
              colSpan="2"
            >
              Total CECL {isNegative(totalCecl) ? "ShortFall" : "Surplus"}
            </td>
            <td style={{ background: isNegative(totalCecl) ? "red" : "green" }}>
              {formatAsDolarNumberCb(totalCecl)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
