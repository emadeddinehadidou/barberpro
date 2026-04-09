import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { date: string; revenue: number }[];
};

export default function RevenueChart({ data }: Props) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#c8a96b"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}