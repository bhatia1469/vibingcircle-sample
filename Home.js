import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import FilterIcon from '../assets/icons/equalizer-fill.svg'
import ChatIcon from '../assets/icons/chat-1-line.svg'
import appStyles from '../utils/appStyles';
import ReactNativeModal from 'react-native-modal';
import Closefill from '../assets/icons/close-fill.svg'
import AppTextInput from '../components/AppTextInput';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import GradientButton from '../components/GradientButton';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Api from '../repo/Api';
import AsyncStorage from '@react-native-community/async-storage';
import ChatHelper from '../repo/ChatHelper';
import { Notifications } from 'react-native-notifications';
import messaging from '@react-native-firebase/messaging';
import { not } from 'react-native-reanimated';
import { EventRegister } from 'react-native-event-listeners';
import { firebase } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Home() {
    const [temp, setTemp] = useState(0)
    const [gender, setGender] = useState('male')
    const [age, setAge] = useState([20, 30])
    const [distance, setDistance] = useState(10)
    const [likeToModal, setLikeToModal] = useState(false)
    const [filterModal, setFilterModal] = useState(false)
    const [datePicker, setDatePicker] = useState(false);
    const [date, setDate] = useState(false);
    const [likeToText, setLikeToText] = useState('')
    const [likeToItem, setLikeToItem] = useState({ text: '', selected: false })
    const [likeTo, setLikeTo] = useState([
        { text: "Hangout", selected: true },
        { text: "Explore", selected: false },
        { text: "Grab-drinks", selected: false },
        { text: "Go-Party", selected: false },
    ])
    const navigation = useNavigation()

    const [vibingNowUsers, setVibingNowUsers] = useState([])
    const [myPlans, setMyPlans] = useState([])
    const [plans, setPlans] = useState([])

    useEffect(() => {
        Api.getUsers().then(res => {
            setVibingNowUsers(res)
            Api.upadateDataSilently({ notiToken: global.notiToken })
        })
        auth()
            .signInAnonymously()
            .then(() => {
                console.log('User signed in anonymously');
            })
            .catch(error => {
                if (error.code === 'auth/operation-not-allowed') {
                    console.log('Enable anonymous in your firebase console.');
                }
                console.error(error);
            });
        checkIfUserExistOnFirebase()
        initNotifications()
    }, [])

    function initNotifications() {

        Notifications.registerRemoteNotifications();

        Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
            completion({ alert: true, sound: true, badge: true });
        });

        messaging().onMessage(async remoteMessage => {
            console.log('getNotification')
            EventRegister.emit('checkNotifications')
            Notifications.postLocalNotification({
                title: remoteMessage.notification.title,
                body: remoteMessage.notification.body,
                ...remoteMessage.data
            });
        });

        messaging().getInitialNotification().then(res => {
            console.log("getInitialNotification", res)
            if (res) {
                if (res.data.type == 'message')
                    navigation.navigate('Chat', { opponentId: res.data.senderUid })
                else if (res.data.type == 'request') {
                    navigation.navigate('Chat', { opponentId: res.data.senderUid })
                }
            }
        }).catch(err => { console.log(err) })

        Notifications.events().registerNotificationOpened((notification, completion) => {
            console.log(notification)
            if (notification.payload.type == 'message')
                navigation.navigate('Chat', { opponentId: notification.payload.senderUid })
            else if (notification.payload.type == 'request') {
                navigation.navigate('Chat', { opponentId: notification.payload.senderUid })
            }
        });

    }

    function checkIfUserExistOnFirebase() {
        AsyncStorage.getItem('user').then(user => {
            let jsonData = JSON.parse(user)
            let data = {
                id: jsonData.uid,
                email: jsonData.email,
                name: jsonData.name,
                notiToken: global.notiToken,
                image: jsonData.images[0],
            }
            ChatHelper.addUser(data).then(res => {
                if (res) {
                    return true
                    //New user added
                }
            })
        })
    }

    useFocusEffect(React.useCallback(() => {
        Api.getPlans(global.uid).then(res => {
            setMyPlans(res)
            Api.getOthersPlans(global.uid).then(res => {
                setPlans(res)
            })
        })
    }, []))

    let ages = ['below 18', '18-25', '25-30', '30-40', '40+']

    function onCreateEvent() {
        navigation.navigate('CreateEvent')
    }

    function toggleLikeTo() {
        setLikeToModal(!likeToModal)

        if (likeToText.length > 0) {
            setLikeToItem(({ text: likeToText, selected: true }))
            setLikeTo([
                { text: "Hangout", selected: false },
                { text: "Explore", selected: false },
                { text: "Grab-drinks", selected: false },
                { text: "Go-Party", selected: false },
            ])
            setLikeToText('')
            //     setLikeToItem('')
        }
    }

    function toggleFilter() {
        setFilterModal(!filterModal)
    }

    const toggleDatePicker = () => {
        setDatePicker(!datePicker)
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60, backgroundColor: 'white', flexGrow: 1 }}>
            {vibingNowUsers.length > 0 && likeToItem.selected || likeTo.filter(item => item.selected == true).length > 0 ? <View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: colors.default, marginHorizontal: 10 }}>Vibing Now</Text>
                <FlatList
                    data={vibingNowUsers}
                    style={{ padding: 10 }}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.uid}
                    horizontal={true}
                    renderItem={({ item, index }) => {
                        console.log(item)
                        if (item.images.length > 0)
                            return (
                                <View>
                                    <TouchableOpacity onPress={() => navigation.navigate('Groups', { initialIndex: index })} style={{ flexDirection: 'row', margin: 10 }}>
                                        <Image style={{ height: 240, width: 180, borderRadius: 40 }} source={{ uri: item.images[0] }} />
                                    </TouchableOpacity>
                                </View>
                            )
                    }}
                />
            </View> : null}

            <View style={[appStyles.rowBetween, { paddingHorizontal: 10 }]}>
                <Text style={{ fontSize: 16, fontStyle: 'italic', fontWeight: 'bold', color: 'black' }}>I would like to,</Text>
                {likeToItem.selected == false ?
                    <TouchableOpacity onPress={toggleLikeTo} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: 'black' }}>Customize</Text>
                        <ChatIcon height={30} width={30} fill={colors.default} />
                    </TouchableOpacity>
                    :
                    <View>
                        <TouchableOpacity
                            onPress={() => {

                            }}
                            style={{
                                flexDirection: 'row', margin: 10, borderColor: 'gray',
                                backgroundColor: colors.default,
                                borderWidth: 1, padding: 2, paddingHorizontal: 8, borderRadius: 4,
                            }}>
                            <Text style={{ color: 'white' }}>{likeToItem.text}</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>

            <FlatList
                data={likeTo}
                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                horizontal={true}
                renderItem={({ item, index }) => {
                    return (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    let arr = likeTo
                                    arr.forEach(element => element.selected = false)
                                    arr[index].selected = true
                                    setLikeTo(arr)
                                    setTemp(temp + 1)
                                    let localLikeTo = likeToItem
                                    localLikeTo.selected = false
                                    setLikeToItem(localLikeTo)
                                }}
                                style={{
                                    flexDirection: 'row', margin: 10, marginHorizontal: 6, borderColor: 'gray',
                                    backgroundColor: item.selected ? colors.default : null,
                                    borderWidth: 1, padding: 2, paddingHorizontal: 8, borderRadius: 4,
                                }}>
                                <Text style={{ color: item.selected ? 'white' : 'black' }}>{item.text}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />

            <View style={[appStyles.rowBetween, { marginStart: 10, marginTop: 40, paddingHorizontal: 10 }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.default }}>Vibing Later</Text>
                <TouchableOpacity onPress={toggleFilter}>
                    <FilterIcon height={30} width={30} fill={colors.default} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={plans}
                style={{ padding: 10 }}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={({ item, index }) => {
                    return (
                        <View>
                            <TouchableOpacity
                                onPress={() => { navigation.navigate('VibingLaterDetails', { "event": item }) }}
                                style={{ margin: 10, width: 100, height: 130, alignItems: 'center' }}>
                                <Image style={{ height: 80, width: 80, borderRadius: 40 }} source={{ uri: item.image }} />
                                <Text numberOfLines={3} style={{ fontSize: 16, textAlign: 'center' }}>{item.title}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />


            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.default, marginStart: 10 }}>My Plans</Text>
                <Text onPress={onCreateEvent} style={{ fontSize: 40, color: colors.default, marginStart: 10 }}>+</Text>
            </View>
            {myPlans.length == 0 ? <View>
                <Text style={{ fontSize: 16, color: 'black', textAlign: 'center', margin: 20 }}>You have not planned any event{'\n'}Create your own Vibing Later event</Text>
                <Text onPress={onCreateEvent} style={{
                    fontSize: 16, color: 'black', fontWeight: 'bold', textDecorationLine: 'underline',
                    textDecorationStyle: 'solid', textDecorationColor: 'black', textAlign: 'center', margin: 20
                }}>Start Planning</Text>
            </View> :
                <FlatList
                    data={myPlans}
                    style={{ padding: 10 }}
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    renderItem={({ item, index }) => {
                        return (
                            <View>
                                <TouchableOpacity style={{ margin: 10, width: 100, alignItems: 'center' }}>
                                    <Image style={{ height: 80, width: 80, borderRadius: 40 }} source={{ uri: item.image }} />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>{item.title}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                />
            }

            <ReactNativeModal isVisible={likeToModal} useNativeDriver={true} onBackButtonPress={toggleLikeTo} style={{ borderRadius: 20 }}>
                <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20 }}>
                    <TouchableOpacity onPress={toggleLikeTo} style={{ alignSelf: 'flex-end' }}>
                        <Closefill height={40} width={40} fill={'gray'} />
                    </TouchableOpacity>

                    <AppTextInput
                        placeholder={"Like to"}
                        onChangeText={setLikeToText}
                        value={likeToText}
                        onSubmitEditing={toggleLikeTo}
                    />

                    <GradientButton
                        backgroundColor={colors.default}
                        title={"Apply"}
                        style={{ height: 40, width: '60%', alignSelf: 'center', margin: 20 }}
                        onPress={toggleLikeTo}
                        textColor={'white'} />
                </View>
            </ReactNativeModal>

            <ReactNativeModal isVisible={filterModal} useNativeDriver={true} onBackButtonPress={toggleFilter} style={{ borderRadius: 20 }}>
                <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20 }}>
                    <TouchableOpacity onPress={toggleFilter} style={{ alignSelf: 'flex-end' }}>
                        <Closefill height={40} width={40} fill={'gray'} />
                    </TouchableOpacity>

                    <Text style={{ marginVertical: 10, fontSize: 20, fontWeight: 'bold' }}>Sex</Text>
                    <View style={{ width: '100%', flexDirection: 'row', marginBottom: 20 }}>
                        <Text onPress={() => setGender('male')} style={{
                            padding: 10, color: gender == 'male' ? 'white' : 'black', borderRadius: 4,
                            backgroundColor: gender == 'male' ? colors.default : 'lightgray'
                        }}>Male</Text>
                        <Text onPress={() => setGender('female')} style={{
                            padding: 10, color: gender == 'female' ? 'white' : 'black', borderRadius: 4,
                            backgroundColor: gender == 'female' ? colors.default : 'lightgray', marginStart: 20
                        }}>Female</Text>
                        <Text onPress={() => setGender('others')} style={{
                            padding: 10, color: gender == 'others' ? 'white' : 'black', borderRadius: 4,
                            backgroundColor: gender == 'others' ? colors.default : 'lightgray', marginStart: 20
                        }}>Others</Text>
                    </View>

                    <AppTextInput
                        placeholder={"Date"}
                        onPress={toggleDatePicker}
                        value={date}
                        editable={false}
                        onSubmitEditing={() => { }}
                    />

                    <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 20, fontWeight: 'bold'
                        }}>Age Range</Text>
                        <Text>{age[0] + ' - ' + age[1]}</Text>
                    </View>

                    <View style={{ paddingHorizontal: 4 }}>
                        <MultiSlider
                            values={age}
                            min={18}
                            selectedStyle={{ backgroundColor: colors.primary }}
                            markerStyle={{ backgroundColor: 'white' }}
                            customMarker={() => <View style={[{
                                height: 30, width: 30,
                                borderRadius: 15, backgroundColor: 'white'
                            }, appStyles.shadow]} />}
                            sliderLength={250}
                            max={40}
                            onValuesChangeFinish={(values) => {
                                setAge(values)
                            }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 20, fontWeight: 'bold'
                        }}>Maximum Distance</Text>
                        <Text>{distance} mi</Text>
                    </View>
                    <View style={{ paddingHorizontal: 4 }}>
                        <MultiSlider
                            values={[distance]}
                            sliderLength={250}
                            selectedStyle={{ backgroundColor: colors.primary }}
                            markerStyle={{ backgroundColor: 'white' }}
                            customMarker={() => <View style={[{
                                height: 30, width: 30,
                                borderRadius: 15, backgroundColor: 'white'
                            }, appStyles.shadow]} />}
                            max={50}
                            onValuesChangeFinish={(values) => {
                                console.log(values[0])
                                setDistance(values[0])
                            }}
                        />
                    </View>

                    <GradientButton
                        backgroundColor={colors.default}
                        title={"Apply"}
                        style={{ height: 40, width: '60%', alignSelf: 'center', margin: 20 }}
                        onPress={toggleFilter}
                        textColor={'white'} />

                    <DateTimePicker
                        isVisible={datePicker}
                        mode={'date'}
                        date={new Date()}
                        minimumDate={new Date()}
                        is24Hour={false}
                        onCancel={() => {
                            toggleDatePicker()
                        }}
                        onConfirm={(date) => {
                            if (date != undefined) {
                                toggleDatePicker()
                                console.log(date)
                                setDate(moment(date).format('DD/MM/YYYY'))
                            }
                        }}
                    />
                </View>
            </ReactNativeModal>
        </ScrollView >
    );
}