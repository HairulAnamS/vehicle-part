import React from 'react';

const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <i className="fa-solid fa-circle-info text-slate-400 hover:text-blue-500 cursor-help"></i>
    <div className="hidden group-hover:block absolute z-[100] w-64 p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2 font-normal text-center leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export default InfoTooltip;
