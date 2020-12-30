import {
    BarChart as CBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Text as CText,
    Label as CLabel,
  } from "recharts";
  
  export const BarChart = ({ data }) => {
    return (
      <div style={{ width: "95%", height: 300 }}>
        <ResponsiveContainer>
          <CBarChart
            data={data.map((x) => {
              // eslint-disable-next-line
              return { ...x, ["ESD Unlocked"]: x.value };
            })}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <XAxis
              dataKey="name"
              label={
                <CLabel value="LBs" position="bottom">
                  Epoch
                </CLabel>
              }
            />
            <YAxis
              textAnchor="end"
              tick={false}
              label={
                <CText x={0} y={0} dx={50} dy={200} offset={0} angle={-90}>
                  ESD Unlocked
                </CText>
              }
            />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat("en").format(value)}
            />
            <Bar dataKey="ESD Unlocked" fill="#8884d8" />
          </CBarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  