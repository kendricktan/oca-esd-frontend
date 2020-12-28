import { Link } from "@geist-ui/react";
import { ethers } from "ethers";

export const prettyNumbers = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export const prettyStr18 = (str) => {
  return prettyNumbers(
    parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(str))).toFixed(2)
  );
};

export const str18ToFloat = (str) => {
  return parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(str)));
};

export const formatDaoStats = (daoStats, epoch) => {
  const accounts = Object.keys(daoStats.accounts);

  const accountsPostEpoch = accounts
    .map((x) => {
      return { ...daoStats.accounts[x], user: x };
    })
    .map((x) => {
      return { ...x, fluidUntil: parseInt(x["fluidUntil"]) };
    })
    .filter((x) => x["fluidUntil"] > epoch);

  let epochsDataRaw = {};
  let epochsData = {};
  let treeData = [];
  let barData = [];

  // Addresses can be case-insensitive based on provider...
  let seenAddresses = {};

  for (const acc of accountsPostEpoch) {
    const { user, staged, fluidUntil } = acc;

    // Hacked on filter
    if (user.toLowerCase() in seenAddresses) {
      continue;
    }
    seenAddresses[user.toLowerCase()] = true;

    if (ethers.BigNumber.from(staged).gt(ethers.constants.Zero)) {
      epochsDataRaw[fluidUntil] = [...(epochsDataRaw[fluidUntil] || []), acc];

      epochsData[fluidUntil] = [
        ...(epochsData[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(staged)} Staged`,
          value: staged,
          valueBN: ethers.BigNumber.from(staged),
        },
      ];
    }
  }

  for (const e of Object.keys(epochsData).sort()) {
    // Sort by value
    const curEpochDataSorted = epochsData[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    // Bar chart data
    barData = [
      ...barData,
      {
        name: e,
        value: parseFloat(totalValue.toFixed(2)),
      },
    ];

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} ESD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeData = [
      ...treeData,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} ESD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  return {
    tree: [{ type: "directory", name: "Staged (Fluid)", files: treeData }],
    bar: barData,
  };
};

export const formatLpStats = (lpStats, epoch) => {
  const { esdPerUniV2 } = lpStats;
  const esdPerUniV2BN = ethers.utils.parseEther(esdPerUniV2);

  const accounts = Object.keys(lpStats.accounts);

  const accountsPostEpoch = accounts
    .map((x) => {
      return { ...lpStats.accounts[x], user: x };
    })
    .map((x) => {
      return { ...x, fluidUntil: parseInt(x["fluidUntil"]) };
    })
    .filter((x) => x["fluidUntil"] > epoch);

  let epochsRaw = {};
  let epochsFluid = {};
  let epochsClaimable = {};
  let treeFluid = [];
  let treeClaimable = [];
  let barData = {};

  let seenAddresses = {};

  for (const acc of accountsPostEpoch) {
    const { user, staged, claimable, fluidUntil } = acc;

    // Hacked on filter
    if (user.toLowerCase() in seenAddresses) {
      continue;
    }
    seenAddresses[user.toLowerCase()] = true;

    if (ethers.BigNumber.from(staged).gt(ethers.constants.Zero)) {
      epochsRaw[fluidUntil] = [...(epochsRaw[fluidUntil] || []), acc];

      // Convert from LP tokens to ESD
      const stagedFixed = esdPerUniV2BN
        .mul(ethers.BigNumber.from(staged))
        .div(ethers.utils.parseEther("1"));

      epochsFluid[fluidUntil] = [
        ...(epochsFluid[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(stagedFixed.toString())} Staged`,
          value: stagedFixed.toString(),
          valueBN: stagedFixed,
        },
      ];

      epochsClaimable[fluidUntil] = [
        ...(epochsClaimable[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(claimable)} Staged`,
          value: claimable,
          valueBN: ethers.BigNumber.from(claimable),
        },
      ];
    }
  }

  for (const e of Object.keys(epochsFluid).sort()) {
    // Sort by value
    const curEpochDataSorted = epochsFluid[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    barData[e] = totalValue;

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} ESD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeFluid = [
      ...treeFluid,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} ESD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  for (const e of Object.keys(epochsClaimable).sort()) {
    // Sort by value
    const curEpochDataSorted = epochsClaimable[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    barData[e] = parseFloat(((barData[e] || 0) + totalValue).toFixed(2));

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} ESD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeClaimable = [
      ...treeClaimable,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} ESD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  return {
    tree: [
      { type: "directory", name: "Staged (Fluid)", files: treeFluid },
      { type: "directory", name: "Staged (Claimable)", files: treeClaimable },
    ],
    bar: Object.keys(barData).map((x) => {
      return {
        name: x,
        value: barData[x],
      };
    }),
  };
};
