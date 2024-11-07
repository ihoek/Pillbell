import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainPage from '../pages/main_page';
import Time from '../pages/time_page';

const Stack = createStackNavigator();
const StackNavigator = () =>{
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#0e0b49",
                    borderBottomColor: "#0e0b49",
                    shadowColor: "black",
                    height:100
                },
                headerTintColor: "#FFFFFF",
                headerBackTitleVisible: false
            }}            
        >
            <Stack.Screen name="MainPage" component={MainPage}/>
            <Stack.Screen name="Time" component={Time}/>
           
        </Stack.Navigator>
    )
}
export default StackNavigator;