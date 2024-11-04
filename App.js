import React from 'react'
//import MainPage from './pages/main_page';
//import ContentPage from './pages/content_page'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import StackNavigator from './navigation/StackNavigator'
export default function App() {
  console.disableYellowBox = true;
  return ( 
  <NavigationContainer>
    <StatusBar style="black" />
    <StackNavigator/>
 </NavigationContainer>);
}
//return (<MainPage/>)
//return (<ContentPage/>)