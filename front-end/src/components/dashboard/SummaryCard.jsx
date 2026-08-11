import React from 'react'

const SummaryCard = ({ icon: Icon, text, number }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
      
      
      <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
        <Icon />
      </div>


      <div className="flex flex-col justify-center">
        <p className="text-xs text-gray-500">{text}</p>
        <p className="text-xl font-semibold text-gray-800">{number}</p>
      </div>

    </div>
  )
}

export default SummaryCard