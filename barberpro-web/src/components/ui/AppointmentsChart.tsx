import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { date: string; count: number }[];
};

export default function AppointmentsChart({ data }: Props) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="count" fill="#c8a96b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}