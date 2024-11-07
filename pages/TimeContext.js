// TimeContext.js
import React, { createContext, useContext, useState } from 'react';

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  const [timeData, setTimeData] = useState({
    date: new Date(),
    selectedTimeBefore: '10',
    alarmTime: null,
  });

  return (
    <TimeContext.Provider value={{ timeData, setTimeData }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTimeContext = () => useContext(TimeContext);
