import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, TextInput, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';// 갤러리 사진 선택 
import TcpSocket from 'react-native-tcp-socket';// react-native-tcp-socket 라이브러리

export default function MainPage({ navigation }) {

  //모달 상태 변수
  const [namemodalupVisible, setnamemodalupVisible] = useState(false);
  const [datemodalupVisible, setDateModalupVisible] = useState(false);
  const [premodalupVisible, setPreModalupVisible] = useState(false);
  const [checkmodalupVisible, setCheckModalupVisible] = useState(false);
  const [cameramodalupVisible, setCameraModalupVisible] = useState(false);

  // textfield
  const [Nametext, onChangeNameText] = React.useState('');
  const [Datetext, onChangeDateText] = React.useState('');
  const [Pretext, onChangePreText] = React.useState('');
  const [Checktext, onChangeCheckText] = React.useState('');


  const [NamebuttonText, setNameButtonText] = useState("내용");
  const [DatebuttonText, setDateButtonText] = React.useState("내용");
  const [PrebuttonText, setPreButtonText] = React.useState("내용");
  const [CheckbuttonText, setCheckButtonText] = React.useState("내용");

  //camera
  const [facing, setFacing] = useState(CameraType);
  const [permission, requestPermission] = useCameraPermissions();

  const [cameraRef, setCameraRef] = useState(null);

  // 사진 저장을 위한 상태 변수
  const [photoUri, setPhotoUri] = useState(null);

  const [serverbuttonText, setServerButtonText] = useState("서버에서 데이터를 기다리는 중...");
  const [count, setCount] = useState(0);

  // Flask 서버에서 카운트 값을 가져오는 함수
  const fetchCount = () => {
    fetch('http://172.29.1.44:5000/count')  // 라즈베리파이 IP 주소로 변경
    .then(response => response.json())
    .then(data => {
      const newCount = data.count;
      setCount(newCount);
      
      // 새로운 count 값을 받아 조건에 따라 CheckbuttonText 상태를 업데이트합니다.
      if (newCount > 0) {
        setCheckButtonText("약을 먹었음");
      } else {
        setCheckButtonText("아직 약을 먹지 않음");
      }
    })
    .catch(error => console.error("Error fetching count:", error));
      
  };

  // 주기적으로 카운트 값을 가져오기 (1초마다 호출)
  useEffect(() => {
    const intervalId = setInterval(fetchCount, 1000);  // 1초마다 카운트 요청
    console.log(fetchCount);
    return () => clearInterval(intervalId);  // 컴포넌트 언마운트 시 인터벌 제거
  }, []);


  //카메라 권한
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  //카메라 확인 버튼
  const takepicture = async () => {
    if (cameraRef) {
      try {
        console.log('takepicture 실행중');
        const photo = await cameraRef.takePictureAsync();
        setPhotoUri(photo.uri); // 찍은 사진의 URI 저장

        setCameraModalupVisible(false);
      } catch (error) {
        console.error('사진 찍기 중 오류 발생:', error);
      }
    } else {
      console.error('Camera reference is null.');
    }
  }

  //갤러리
  const gallery = async () => {
    console.log('갤러리 버튼 실행');
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      // 선택한 이미지의 URI를 photoUri에 저장
      setPhotoUri(result.assets[0].uri);
      setCameraModalupVisible(false);
    }
  };

  // 이름 모달 열기
  const namemodalup = () => {
    console.log('namemodalup');
    setnamemodalupVisible(true);
  };

  //소비기한 모달 열기
  const Datemodalup = () => {
    console.log('Datemodalup');
    setDateModalupVisible(true);
  };

  //주의사항 모달 열기
  const Premodalup = () => {
    console.log('Premodalup');
    setPreModalupVisible(true);
  };

  //카메라 모달 열기
  const cameramodal = () => {
    console.log('cameramodal');
    setCameraModalupVisible(true);
  };

  const closemodal = () => {
    console.log('close modal');

    setNameButtonText(Nametext);
    setDateButtonText(Datetext);
    setPreButtonText(Pretext);
    setCheckButtonText(Checktext);

    setnamemodalupVisible(false);
    setDateModalupVisible(false);
    setPreModalupVisible(false);
    setCameraModalupVisible(false);

  };

  //확인 버튼 
  const Bodycheck = () => {
    //console.log
    console.log("name:" + Nametext);
    console.log("Date:" + Datetext);
    console.log("Pre:" + Pretext);
    console.log("Check:" + Checktext);

  };

  return (
    <View style={styles.container}>
      {/* 이름 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={namemodalupVisible}
        onRequestClose={() => {
          setnamemodalupVisible(!namemodalupVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modaltop}><Text>이름</Text></View>
            <View style={styles.modalbody}><TextInput style={styles.textfieldinput} onChangeText={onChangeNameText} value={Nametext} placeholder="이름 입력" /></View>
            <View style={styles.modalbottom}><TouchableOpacity style={styles.modalcheckbtn} onPress={closemodal}><Text>확인</Text></TouchableOpacity></View>
          </View>
        </View>
      </Modal>

      {/* 소비기한 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={datemodalupVisible}
        onRequestClose={() => {
          setDateModalupVisible(!datemodalupVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modaltop}><Text>소비기한</Text></View>
            <View style={styles.modalbody}><TextInput style={styles.textfieldinput} onChangeText={onChangeDateText} value={Datetext} placeholder="날짜 입력" /></View>
            <View style={styles.modalbottom}><TouchableOpacity style={styles.modalcheckbtn} onPress={closemodal}><Text>확인</Text></TouchableOpacity></View>
          </View>
        </View>
      </Modal>

      {/* 주의사항 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={premodalupVisible}
        onRequestClose={() => {
          setPreModalupVisible(!premodalupVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modaltop}><Text>주의사항</Text></View>
            <View style={styles.modalbody}><TextInput style={styles.textfieldinput} onChangeText={onChangePreText} value={Pretext} placeholder="주의사항 입력" /></View>
            <View style={styles.modalbottom}><TouchableOpacity style={styles.modalcheckbtn} onPress={closemodal}><Text>확인</Text></TouchableOpacity></View>
          </View>
        </View>
      </Modal>

      {/* 카메라 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cameramodalupVisible}
        onRequestClose={() => {
          setCameraModalupVisible(!cameramodalupVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.CameraModalView}>
            <CameraView style={styles.camera} facing={facing} ref={(ref) => setCameraRef(ref)}></CameraView>
            <View style={styles.CameraModalView_Bottom}>
              <TouchableOpacity style={styles.Cameramodelbutton} onPress={gallery}><Text>갤러리</Text></TouchableOpacity>
              <TouchableOpacity style={styles.Cameramodelbutton} onPress={toggleCameraFacing}><Text>전환</Text></TouchableOpacity>
              <TouchableOpacity style={styles.Cameramodelbutton} onPress={takepicture}><Text>확인</Text></TouchableOpacity>
              <TouchableOpacity style={styles.Cameramodelbutton} onPress={closemodal}><Text>닫기</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.containerTop}>
        <TouchableOpacity style={styles.photo_button} onPress={cameramodal}>
          {photoUri ? (
            // 찍은 사진 표시
            <Image source={{ uri: photoUri }} style={styles.photoImage} />
          ) : (
            <Text>photo</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.containerBody}>
        <View style={styles.contentlabel}>
          <View style={styles.category_name}><Text>이름</Text></View>
          <TouchableOpacity style={styles.containerbodybutton} onPress={namemodalup}><Text style={styles.textfont}>{NamebuttonText}</Text></TouchableOpacity>
        </View>

        <View style={styles.contentlabel}>
          <View style={styles.category_name}><Text>소비기한</Text></View>
          <TouchableOpacity style={styles.containerbodybutton} onPress={Datemodalup}><Text style={styles.textfont}>{DatebuttonText}</Text></TouchableOpacity>
        </View>

        <View style={styles.contentlabel}>
          <View style={styles.category_name}><Text>주의사항</Text></View>
          <TouchableOpacity style={styles.containerbodybutton} onPress={Premodalup}><Text style={styles.textfont}>{PrebuttonText}</Text></TouchableOpacity>
        </View>

        <View style={styles.contentlabel}>
          <View style={styles.category_name}><Text>섭취여부</Text></View>
          <TouchableOpacity style={styles.containerbodybutton}><Text style={styles.textfont}>{CheckbuttonText}</Text></TouchableOpacity>
        </View>

      </View>


      <View style={styles.containerBottom}>
        <View style={styles.contentlabel}>
          <TouchableOpacity style={styles.containerbottombutton} onPress={() => { navigation.navigate('Time') }}><Text style={styles.textfont}>알람설정</Text></TouchableOpacity>
          <TouchableOpacity style={styles.containerbottombutton} onPress={Bodycheck}><Text style={styles.textfont}>확인</Text></TouchableOpacity>
          <TouchableOpacity style={styles.containerbottombutton} onPress={fetchCount}><Text style={styles.textfont}>서버연결</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerTop: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerBody: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerBottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo_button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 5,
    width: 320,
    height: 320,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  containerbodybutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    width: 300,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 7,
  },
  contentlabel: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  category_name: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width: 100,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 7,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    width: 300,
    height: 300
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  textfieldinput: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  CameraModalView_Top: {
    flex: 4
  },
  CameraModalView_Bottom: {
    flex: 1,
    flexDirection: "row",
  },
  CameraModalView: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    width: '80%',
    height: '60%'
  },
  Cameramodelbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    width: 60,
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  camera: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    width: 320,
    height: 320,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  containerbottombutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    width: 130,
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
  },
  modalcheckbtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
    padding: 10,
    width: 60,
    height: 60,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    margin: 7,
  },
  modaltop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalbody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalbottom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});