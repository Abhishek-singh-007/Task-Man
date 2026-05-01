import React from "react";
import { IoMdAdd } from "react-icons/io";

const TaskTitle = ({ label, className, onClick }) => {
  return (
    <div className={`p-3 rounded ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white">{label}</span>

        {/* 🔥 IMPORTANT FIX */}
        <IoMdAdd
          className="text-xl cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // 👈 VERY IMPORTANT
            onClick && onClick();
          }}
        />
      </div>
    </div>
  );
};

export default TaskTitle;
