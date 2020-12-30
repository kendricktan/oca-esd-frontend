import {
    LineChart as CLineCharts,
    XAxis,
    YAxis,
    Tooltip,
    Line,
    Text,
    Label,
    ResponsiveContainer,
  } from "recharts";
  
  export const LineChart = ({ data }) => {
    // Fills in empty epochs
    const minEpoch = data[0].epoch;
    const maxEpoch = data.slice(-1)[0].epoch;
  
    const dataKV = data.reduce((acc, x) => {
      return { ...acc, [x.epoch]: x.value };
    }, {});
  
    const dataCleaned = Array(maxEpoch + 1)
      .fill(0)
      .map((x, i) => i)
      .filter((x) => x > minEpoch && x < maxEpoch)
      .map((e) => {
        return {
          epoch: e,
          value: dataKV[e] || 0,
        };
      });
  
    return (
      <div style={{ width: "95%", height: 300 }}>
        <ResponsiveContainer>
          <CLineCharts
            width={500}
            height={300}
            data={dataCleaned.map((x) => {
              return {
                ...x,
                // eslint-disable-next-line
                ["Coupons (Purchased)"]: x.value,
              };
            })}
            margin={{
              top: 15,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <XAxis
              domain={[minEpoch, maxEpoch]}
              dataKey="epoch"
              type="number"
              label={<Label position="bottom">Epoch</Label>}
            ></XAxis>
            <YAxis
              textAnchor="end"
              tick={false}
              label={
                <Text x={0} y={0} dx={50} dy={200} offset={0} angle={-90}>
                  Coupons (Purchased)
                </Text>
              }
            />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat("en").format(value)}
            />
            <Line
              dot={false}
              dataKey="Coupons (Purchased)"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </CLineCharts>
        </ResponsiveContainer>
      </div>
    );
  };
  