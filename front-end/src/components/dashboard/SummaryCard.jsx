import React from 'react'

const SummaryCard = ({ icon: Icon, text, number, color = "blue" }) => {
  // Map the color prop to a Tailwind background class
  const colors = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    orange: "bg-amber-500",
    red: "bg-red-500",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
      
  
      <div className={`w-10 h-10 rounded-md ${colors[color]} flex items-center justify-center text-white shrink-0`}>
        <Icon />
      </div>

     
      <div className="flex flex-col">
        <p className="text-xs text-gray-500">{text}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{number}</p>
      </div>

    </div>
  )
}

export default SummaryCard