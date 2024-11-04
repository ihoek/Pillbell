import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {Picker} from '@react-native-picker/picker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



export default function Time({navigation,route}) {
    //변수 선언
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [alarmTime, setAlarmTime] = useState(null);

    //카테고리 Picker 변수 선언
    const [selectedTimeBefore, setSelectedTimeBefore] = useState('10');

    //알람 변수 선언
    const notificationListener = useRef();
    const responseListener = useRef();
    const [expoPushToken, setExpoPushToken] = useState('');

    useEffect(() => {
      registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
  
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification Received:', notification);
      });
  
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification Response:', response);
      });
  
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }, []);

    //알람 설정
    async function registerForPushNotificationsAsync() {
      let token;
    
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }

        try {
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
            throw new Error('Project ID not found');
          }
          token = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
          ).data;
          console.log(token);
        } catch (e) {
          token = `${e}`;
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    
      return token;
    }
    
    // 알림 및 시간 설정
    function calculateAlarmTime() {
      const triggerTime = new Date(date); // 사용자가 선택한 시간을 복사
      switch (selectedTimeBefore) {
        case '1':
          triggerTime.setMinutes(triggerTime.getMinutes() - 10); // 10분 전
          break;
        case '2':
          triggerTime.setMinutes(triggerTime.getMinutes() - 20); // 20분 전
          break;
        case '3':
          triggerTime.setMinutes(triggerTime.getMinutes() - 30); // 30분 전
          break;
        default:
          triggerTime.setMinutes(triggerTime.getMinutes() - 10); // 기본적으로 10분 전
          break;
      }
      setAlarmTime(triggerTime); // 계산된 알람 시간을 상태에 저장
    }

    // 현재 시간과 비교하여 얼마나 뒤에 알림이 발생할지 계산
    async function scheduleNotification() {
      calculateAlarmTime(); // 알람 시간을 먼저 계산
      const timeDifference = alarmTime.getTime() - new Date().getTime();
  
      if (timeDifference > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '알림',
            body: `약을 먹기까지 ${selectedTimeBefore}분 남았습니다.`,
          },
          trigger: {
            seconds: Math.floor(timeDifference / 1000), // 밀리초를 초로 변환
          },
        });
      } else {
        alert('지정한 시간이 현재 시간보다 이전입니다.');
      }
    }


    //시간 설정
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    //날짜 설정
    const showDatepicker = () => {
        showMode('date');
    };
    
    //시간 설정
    const showTimepicker = () => {
        showMode('time');
    };
    
    //카테고리 Picker 설정
    const pickerRef = useRef();

    function open() {
      pickerRef.current.focus();
    }

    function close() {
      pickerRef.current.blur();
    }



    return (
        <View style={styles.container}>
            <View style={styles.containertop}>
                <Text>알람설정</Text>
            </View>

            <View style={styles.containerbody}>
                <View style={styles.timemodalbody}>
                    <View style={styles.time_alertmodal}><Text>시간설정</Text></View>
                    <TouchableOpacity style={styles.time_alertmodal_content} onPress={showTimepicker}><Text>시간설정</Text></TouchableOpacity>
                    
                </View>
                    <Text>현재 시간 : {date.toLocaleString()}</Text>
                            {show && (
                                <DateTimePicker testID="dateTimePicker" value={date}
                                mode={mode} is24Hour={true} onChange={onChange}/>
                            )}
                    <Text>알람 시간 : {alarmTime ? alarmTime.toLocaleString() : '설정되지 않음'}</Text>
                <View style={styles.timemodalbody}>
                    <View style={styles.time_alertmodal}><Text>알람시간</Text></View>
                    <TouchableOpacity style={styles.time_alertmodal_content}>
                      <Picker ref={pickerRef} selectedValue={selectedTimeBefore} 
                        onValueChange={(itemValue, itemIndex) => setSelectedTimeBefore(itemValue)}  style={{ height: 50, width: 150 }}>
                          <Picker.Item label="10분 전" value="1"/>
                          <Picker.Item label="20분 전" value="2" />
                          <Picker.Item label="30분 전" value="3" />
                      </Picker>
                    </TouchableOpacity>
                </View>

            </View>

            <View style={styles.containerbottom}>
            <TouchableOpacity style={styles.time_alertmodal_content} onPress={() => { 
              scheduleNotification(); 
              navigation.navigate('ContentPageOne') }} ><Text>확인</Text></TouchableOpacity>
            </View>


        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containertop : {
    flex : 1
  },
  containerbody : {
    flex : 3
  },
  containerbottom : {
    flex : 1
  },
  time_alertmodal : {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width : 100,
    height : 45,
    borderColor:'#000',
    borderWidth:1,
    borderRadius:10,
    margin:10,
  },
  timemodalbody : {
    flexDirection:"row",
    alignItems: 'center',
    justifyContent: 'center',
  },
  time_alertmodal_content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width : 140,
    height : 45,
    borderColor:'#000',
    borderWidth:1,
    borderRadius:10,
    margin:10,
  }

  
});