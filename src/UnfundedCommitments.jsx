import React, { useState, useEffect } from "react";

export default function UnfundedCommitments({
  ceclValue,
  setCeclValueCb,
  showUnfunded,
  formatAsPercentageCb,
  formatAsDolarNumberCb
}) {
  const [currentTotalAllowance, setCurrentTotalAllowance] = useState(0);
  const [lines, setLines] = useState([
    {
      label: "Commercial Loans",
      totalUnfundedCom: 0,
      unconditionallyCancellable: 0,
      netUnfunded: 0,
      estimatedProbabilityOfFunding: 0,
      wtdAverageRemaining: 0,
      annualExpected: 0,
      expectedLifetime: 0,
      impliedCecl: 0
    },
    {
      label: "Credit Card Lines",
      totalUnfundedCom: 0,
      unconditionallyCancellable: 0,
      netUnfunded: 0,
      estimatedProbabilityOfFunding: 0,
      wtdAverageRemaining: 0,
      annualExpected: 0,
      expectedLifetime: 0,
      impliedCecl: 0
    },
    {
      label: "Total Unfunded Commitments",
      totalUnfundedCom: 0,
      unconditionallyCancellable: 0,
      netUnfunded: 0,
      estimatedProbabilityOfFunding: 0,
      wtdAverageRemaining: 0,
      annualExpected: 0,
      expectedLifetime: 0,
      impliedCecl: 0
    }
  ]);

  useEffect(() => {
    calculateValuesByLineIndex(0);
    calculateValuesByLineIndex(1);
  }, []);

  const calculateValuesByLineIndex = index => {
    const linesCopy = lines.slice();
    let item = linesCopy.filter((item, lineIndex) => lineIndex === index)[0];

    item.netUnfunded = item.totalUnfundedCom - item.unconditionallyCancellable;
    item.expectedLifetime =
      parseFloat(item.estimatedProbabilityOfFunding) *
      parseInt(item.wtdAverageRemaining) *
      parseFloat(item.annualExpected);
    item.impliedCecl = item.expectedLifetime * item.netUnfunded;

    setLines(linesCopy);
    calculateTotalValues();
  };

  const calculateTotalValues = () => {
    const total = lines.slice().reduce((total, currentItem, index) => {
      if (index !== lines.length - 1) {
        const sum = {
          totalUnfundedCom:
            parseInt(total.totalUnfundedCom) +
            parseInt(currentItem.totalUnfundedCom),
          totalUnconditionallyCancellable:
            parseInt(total.unconditionallyCancellable) +
            parseInt(currentItem.unconditionallyCancellable),
          totalNetUnfunded:
            parseInt(total.netUnfunded) + parseInt(currentItem.netUnfunded),
          totalImpliedCecl:
            parseFloat(total.impliedCecl) + parseFloat(currentItem.impliedCecl)
        };

        return sum;
      }

      return total;
    });
    let linesCopy = lines.slice();
    let item = linesCopy.filter((item, index) => index === lines.length - 1)[0];

    item.totalUnfundedCom = total.totalUnfundedCom;
    item.unconditionallyCancellable = total.totalUnconditionallyCancellable;
    item.netUnfunded = total.totalNetUnfunded;
    item.impliedCecl = total.totalImpliedCecl;
    item.expectedLifetime =
      item.impliedCecl / item.netUnfunded
        ? item.impliedCecl / item.netUnfunded
        : 0;

    setCeclSurplus();

    setLines(linesCopy);
  };

  const setTotalUnfundedCom = (e, index) => {
    let copy = lines.slice();
    let itemFromLines = copy[index];

    itemFromLines.totalUnfundedCom = e.target.value;
    setLines(copy);
  };

  const setUnconditionallyCancellable = (e, index) => {
    let copy = lines.slice();
    let itemFromLines = copy[index];

    itemFromLines.unconditionallyCancellable = e.target.value;
    setLines(copy);
  };

  const setEstimatedProbabilityOfFunding = (e, index) => {
    let copy = lines.slice();
    let itemFromLines = copy[index];

    itemFromLines.estimatedProbabilityOfFunding = e.target.value;
    setLines(copy);
  };

  const setWtdAverageRemaining = (e, index) => {
    let copy = lines.slice();
    let itemFromLines = copy[index];

    itemFromLines.wtdAverageRemaining = e.target.value;
    setLines(copy);
  };

  const setAnnualExpected = (e, index) => {
    let copy = lines.slice();
    let itemFromLines = copy[index];

    itemFromLines.annualExpected = e.target.value;
    setLines(copy);
  };

  const setCeclSurplus = () => {
    setCeclValueCb(currentTotalAllowance - lines[lines.length - 1].impliedCecl);
  };

  const isNegative = value => {
    return value < 0;
  };

  const simpleLine = (item, index) => {
    return (
      <tr key={item.label}>
        <td style={{ textAlign: "left" }}>{item.label}</td>
        <td>
          <input
            onBlur={() => calculateValuesByLineIndex(index)}
            onChange={e => {
              setTotalUnfundedCom(e, index);
            }}
            value={item.totalUnfundedCom}
          />
        </td>
        <td></td>
        <td>
          <input
            onBlur={() => calculateValuesByLineIndex(index)}
            onChange={e => {
              setUnconditionallyCancellable(e, index);
            }}
            value={item.unconditionallyCancellable}
          />
        </td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.netUnfunded, 0)}</td>
        <td>
          <input
            onBlur={() => calculateValuesByLineIndex(index)}
            onChange={e => {
              setEstimatedProbabilityOfFunding(e, index);
            }}
            value={item.estimatedProbabilityOfFunding}
          />
        </td>
        <td></td>
        <td>
          <input
            onBlur={() => calculateValuesByLineIndex(index)}
            onChange={e => {
              setWtdAverageRemaining(e, index);
            }}
            value={item.wtdAverageRemaining}
          />
        </td>
        <td></td>
        <td>
          <input
            onBlur={() => calculateValuesByLineIndex(index)}
            onChange={e => {
              setAnnualExpected(e, index);
            }}
            value={item.annualExpected}
          />
        </td>
        <td></td>
        <td>{formatAsPercentageCb(item.expectedLifetime)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.impliedCecl, 0)}</td>
      </tr>
    );
  };

  const totalLine = item => {
    return (
      <tr key={item.label}>
        <td style={{ textAlign: "left" }}>{item.label}</td>
        <td>{formatAsDolarNumberCb(item.totalUnfundedCom, 0)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.unconditionallyCancellable)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.netUnfunded, 0)}</td>
        <td colSpan="6"></td>
        <td>{formatAsPercentageCb(item.expectedLifetime)}</td>
        <td></td>
        <td>{formatAsDolarNumberCb(item.impliedCecl, 0)}</td>
      </tr>
    );
  };

  return (
    <table
      style={{ display: showUnfunded ? "" : "none" }}
      border="0"
      cellSpacing="0"
      cellPadding="4"
    >
      <thead className="table-head">
        <tr>
          <td></td>
          <td colSpan="5" className="blue-header underline-header ">
            Unfunded Commitments:
          </td>
          <td colSpan="7" className="blue-header underline-header border-left">
            Expected Future Losses:
          </td>
          <td style={{ background: "white" }}> </td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (A)
          </td>
          <td className="blue-header">-</td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (B)
          </td>
          <td className="blue-header">=</td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (C)
          </td>
          <td
            style={{ fontStyle: "italic" }}
            className="border-left blue-header"
          >
            (D)
          </td>
          <td className="blue-header">x</td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (E)
          </td>
          <td className="blue-header">x</td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (F)
          </td>
          <td className="blue-header">=</td>
          <td className="blue-header" style={{ fontStyle: "italic" }}>
            (G)
          </td>
          <td style={{ background: "white" }}></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td>Total</td>
          <td></td>
          <td>Unconditionally</td>
          <td></td>
          <td>Net</td>
          <td className="border-left">Estimated</td>
          <td></td>
          <td>Wtd. Average</td>
          <td></td>
          <td>Annual</td>
          <td></td>
          <td>Expected</td>
          <td style={{ background: "white" }}></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td>Unfunded</td>
          <td></td>
          <td>Cancellable</td>
          <td></td>
          <td>Unfunded</td>
          <td className="border-left">Probability of</td>
          <td></td>
          <td>Remaining</td>
          <td></td>
          <td>Expected</td>
          <td></td>
          <td>Lifetime</td>
          <td style={{ background: "white" }}></td>
          <td>Implied</td>
        </tr>
        <tr>
          <td></td>
          <td>Commitment</td>
          <td></td>
          <td>Amount (1)</td>
          <td></td>
          <td>Commitment</td>
          <td className="border-left">Funding (2)</td>
          <td></td>
          <td>Commit. (Yrs)</td>
          <td></td>
          <td>Loss Rate (3)</td>
          <td></td>
          <td>Loss Rate</td>
          <td style={{ background: "white" }}></td>
          <td>CECL</td>
        </tr>
      </thead>
      <tbody>
        {lines.map((item, index) => {
          if (index === lines.length - 1) {
            return totalLine(item);
          }
          return simpleLine(item, index);
        })}
        <tr></tr>
        <tr>
          <td colSpan="6"></td>
          <td
            colSpan="8"
            style={{
              backgroundColor: "rgb(0, 179, 255)",
              fontWeight: "bold",
              textAlign: "right"
            }}
          >
            Current Total Allowance for Off-Balance Sheet Credit Exposures
          </td>
          <td>
            <input
              onBlur={e => setCeclSurplus()}
              onChange={e => {
                setCurrentTotalAllowance(e.target.value);
              }}
              value={currentTotalAllowance}
            />
          </td>
        </tr>
        <tr>
          <td colSpan="9"></td>
          <td
            colSpan="5"
            style={{
              background: isNegative(ceclValue) ? "red" : "green",
              fontWeight: "bold",
              textAlign: "right",
              color: "white"
            }}
          >
            CECL {isNegative(ceclValue) ? "ShortFall" : "Surplus"}
          </td>
          <td
            style={{
              background: isNegative(ceclValue) ? "red" : "green",
              fontWeight: "bold",
              textAlign: "right",
              color: "white"
            }}
          >
            {formatAsDolarNumberCb(ceclValue, 0)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
