"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export type PricePoint = {
  date: number
  price: number
  volume: number
}

export default function PriceChart({ data }: { data: PricePoint[] }) {
  return (
    <div className="w-full h-64 bg-gray-900 p-3 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip
            labelFormatter={(v) => new Date(v).toLocaleDateString()}
            formatter={(value: number) => [`${value} €`, "Prix"]}
          />
          <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
