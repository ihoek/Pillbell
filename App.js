import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import StackNavigator from './navigation/StackNavigator'
import { TimeProvider } from './pages/TimeContext'

export default function App() {
  console.disableYellowBox = true;
  return ( 
    <TimeProvider>
      <NavigationContainer>
        <StatusBar style="black" />
        <StackNavigator/>
    </NavigationContainer>
  </TimeProvider>);
}
