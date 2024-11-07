import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker';
import { useTimeContext } from './TimeContext'; // Context 추가

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Time({ navigation }) {
  const { timeData, setTimeData } = useTimeContext(); // Context 사용
  const [show, setShow] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = useState('');

  const { date, selectedTimeBefore, alarmTime } = timeData; // Context 값 활용

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

  const registerForPushNotificationsAsync = async () => {
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
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.manifest.extra.projectId })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  };

  const calculateAlarmTime = () => {
    const triggerTime = new Date(date);
    if (selectedTimeBefore === '1') triggerTime.setMinutes(triggerTime.getMinutes() - 10);
    else if (selectedTimeBefore === '2') triggerTime.setMinutes(triggerTime.getMinutes() - 20);
    else triggerTime.setMinutes(triggerTime.getMinutes() - 30);
    return triggerTime;
  };

  const scheduleNotification = async () => {
    const alarmTime = calculateAlarmTime();
    setTimeData({ ...timeData, alarmTime });

    const timeDifference = alarmTime.getTime() - new Date().getTime();

    if (timeDifference > 0) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '알림', body: `약을 먹기까지 ${selectedTimeBefore === '1' ? '10' : selectedTimeBefore === '2' ? '20' : '30'}분 남았습니다.` },
        trigger: { seconds: Math.floor(timeDifference / 1000) },
      });
    } else {
      alert('지정한 시간이 현재 시간보다 이전입니다.');
    }
  };

  const onChange = (event, selectedDate) => {
    setShow(false);
    setTimeData({ ...timeData, date: selectedDate });
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerbody}>
        <View style={styles.timemodalbody}>
          <View style={styles.time_alertmodal}><Text>시간설정</Text></View>
          <TouchableOpacity style={styles.time_alertmodal_content} onPress={() => setShow(true)}>
            <Text>시간설정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.time_bodylabel}>
          <Text>설정한 시간 : {date.toLocaleString()}</Text>
        </View>

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="time"
            is24Hour={true}
            onChange={onChange}
          />
        )}

        <View style={styles.time_bodylabel}>
          <Text>알람 시간 : {alarmTime ? alarmTime.toLocaleString() : '설정되지 않음'}</Text>
        </View>

        <View style={styles.timemodalbody}>
          <View style={styles.time_alertmodal}><Text>알람시간</Text></View>
          <TouchableOpacity style={styles.time_alertmodal_content}>
            <Picker
              selectedValue={selectedTimeBefore}
              onValueChange={(itemValue) => setTimeData({ ...timeData, selectedTimeBefore: itemValue })}
              style={{ height: 50, width: 150 }}
            >
              <Picker.Item label="10분 전" value="1" />
              <Picker.Item label="20분 전" value="2" />
              <Picker.Item label="30분 전" value="3" />
            </Picker>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.containerbottom}>
        <TouchableOpacity
          style={styles.time_alertmodal_content}
          onPress={() => {
            scheduleNotification();
            navigation.navigate('MainPage');
          }}
        >
          <Text>확인</Text>
        </TouchableOpacity>
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
  containerbody: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerbottom: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  time_alertmodal: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width: 200,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  timemodalbody: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20
  },
  time_alertmodal_content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width: 300,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  time_bodylabel: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width: 520,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,

  }


});