import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Image, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';
import FilterIcon from '../assets/icons/equalizer-fill.svg'
import LeftIcon from '../assets/icons/arrow-left-line.svg'
import ToggleOnIcon from '../assets/icons/toggle-fill.svg'
import ToggleOffIcon from '../assets/icons/toggle-line.svg'
import AddIcon from '../assets/icons/add-fill.svg'
import { colors } from '../utils/colors';
import Swiper from 'react-native-deck-swiper'
import Api from '../repo/Api';
import AsyncStorage from '@react-native-community/async-storage';
import ChatHelper from '../repo/ChatHelper';
import moment from 'moment'
import Notifier from '../repo/Notifier';
import LoaderEmitter from '../utils/LoaderEmitter';

export default function Groups({ route }) {
    const [name, setName] = useState("")
    const navigation = useNavigation()
    const [isActive, setIsActive] = useState(true)
    const [plans, setPlans] = useState([])
    const [index, setIndex] = useState(0)
    const [user, setUser] = useState(null)
    const { initialIndex } = route.params
    let temp = 0

    useEffect(() => {
        getPlans()
        console.log("initialIndex", initialIndex)
        AsyncStorage.getItem('user').then(res => {
            console.log(res)
            setUser(JSON.parse(res))
        })
    }, [route.params])

    function getPlans() {
        setPlans([])
        // Api.getOthersPlans(global.uid).then(res => {
        //     setPlans(res)
        // })
        Api.getUsers().then(res => {
            // console.log(res)
            setPlans(res)
        })
    }

    function joinPlan(plan) {
        console.log(JSON.stringify(plan))
        plans.filter(item => item.id == plan.id)[0]
        let localJoinedUsers = plan.joinedUsers
        localJoinedUsers.push(user)
        console.log(plan)
        let data = {
            joinedUsers: localJoinedUsers
        }
        Api.updatePlan(plan.id, data).then(res => {
            onSendTitle(plan.createdBy, plan.title)
        })
    }

    function joinUser(item) {
        // console.log(JSON.stringify(item))
        // plans.filter(item => item.uid == plan.uid)[0]
        let localJoinedUsers = item.joinedUsers ? item.joinedUsers : []
        localJoinedUsers.push(user)
        // console.log(plan)
        let data = {
            joinedUsers: localJoinedUsers
        }
        // console.log(data)
        Api.upadateUser(item.uid, data).then(res => {
            onSendTitle(item.uid, user.name)
        })
    }


    function onSendTitle(opponentId, title) {
        let userId = user.uid
        let data = {
            message: title,
            type: 'title',
            image: '',
            from: global.uid,
            createdAt: moment.utc().format()
        }
        let userData = {
            name: user.name,
            id: userId,
            image: user.images[0],
            notiToken: global.notiToken
        }
        // console.log(userData)
        Api.addFriend(global.uid, opponentId).then(() => {
            ChatHelper.getOpponentDetails(opponentId).then(res => {
                let opponentData = {
                    name: res.name,
                    uid: res.uid,
                    notiToken: res.notiToken,
                    id: res.id,
                    image: res.image
                }
                // console.log(">>>>>>>>>>>>>>", userId, data, userData, opponentData)
                // ChatHelper.sendMessage(userId, data, userData, opponentData).then(() => {
                // sendNotification(localMessage)
                onSendRequest(opponentData)
                // }).catch(err => console.log(err))
            })
        })
    }

    function onSendRequest(opponentData) {
        let userId = user.uid
        let data = {
            message: 'This user has sent you a request',
            type: 'request',
            image: '',
            from: global.uid,
            createdAt: moment.utc().format()
        }
        let userData = {
            name: user.name,
            id: userId,
            image: user.images[0],
            notiToken: global.notiToken
        }
        // console.log(">>>>>>>>>>>>>>", userId, data, userData, opponentData)

        ChatHelper.sendMessage(userId, data, userData, opponentData).then(() => {
            LoaderEmitter.hide()
            ChatHelper.getOpponentDetails(opponentData.id).then(res => {
                if (res.notifications == null) {
                    sendNotification(`${user.name} sent you a request`, opponentData)
                } else if (res.notifications.onRequest) {
                    sendNotification(`${user.name} sent you a request`, opponentData)
                } else {
                    getPlans()
                }
            })
        })
    }

    function sendNotification(message, opponent) {
        let body = {
            senderUid: user.uid,
            type: 'request',
        }
        let notiBody = { name: user.name, uid: user.uid, image: user.images[0], title: 'sent you a request', type: 'request' }
        Api.addNotification(opponent.uid, notiBody).then(res => {
            Notifier.send(opponent.notiToken, user.name, message, body).then(res => {
                getPlans()
                console.log(res)
            })
        })
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 10, paddingBottom: 10, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', zIndex: 3, justifyContent: 'space-between', height: 50, width: '100%', alignItems: 'center' }}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 10, zIndex: 2 }}>
                    <LeftIcon width={30} height={30} fill={colors.default} />
                </TouchableOpacity>

                <TouchableOpacity style={{ width: 60, height: 40, zIndex: 2 }} onPress={() => setIsActive(!isActive)}>
                    {isActive ? <ToggleOnIcon width={60} height={40} fill={colors.default} />
                        : <ToggleOffIcon width={60} height={40} fill="black" />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { }} style={{ paddingVertical: 10, zIndex: 2 }}>
                    <FilterIcon width={30} height={30} fill={colors.default} />
                </TouchableOpacity>

            </View>

            {plans.length > 0 ? <FlatList
                // cards={plans}
                // infinite={true}
                maxToRenderPerBatch={plans.length + 5}
                initialNumToRender={plans.length + 5}
                horizontal
                data={plans}
                keyExtractor={(item, index) => index}
                initialScrollIndex={initialIndex}
                onScrollToIndexFailed={() => { }}
                renderItem={({ item, index }) => {
                    // console.log(item)
                    return (
                        <View style={{
                            flex: 1, marginBottom: 40, width: Dimensions.get('screen').width - 40,
                            backgroundColor: 'white', borderBottomEndRadius: 40, borderBottomStartRadius: 40, marginEnd: 20
                        }}>

                            <Text style={{ paddingVertical: 5, alignSelf: 'flex-start', marginStart: 10 }}>{item.title}</Text>

                            <Image style={{ borderRadius: 40, flex: 1, width: '100%' }} source={{ uri: item.images[0] }} />
                            <View style={{
                                alignItems: 'center', position: 'absolute', width: '100%', padding: 20, paddingStart: 10,
                                bottom: 0, justifyContent: 'space-between', flexDirection: 'row', paddingEnd: 20,
                            }}>
                                <TouchableOpacity onPress={() => navigation.navigate('ActiveUsers', { users: item.joinedUsers })} style={{ flexDirection: 'row' }}>
                                    {item.joinedUsers && <Image style={{ height: 80, width: 80, borderRadius: 40, right: -20, zIndex: 2 }} source={{ uri: item?.joinedUsers[0]?.images[0] }} />}
                                    {item.joinedUsers && item.joinedUsers.length - 1 > 0 ? <View style={{ height: 80, width: 80, borderRadius: 40, backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }} >+{item?.joinedUsers.length - 1}</Text>
                                    </View> : null}
                                </TouchableOpacity>
                                {item.joinedUsers ? item.joinedUsers.filter(item => item.uid == global.uid).length == 0 ?
                                    <TouchableOpacity onPress={() => { joinUser(item) }}>
                                        <AddIcon width={40} height={40} fill={colors.default} />
                                    </TouchableOpacity> : null : <TouchableOpacity onPress={() => { joinUser(item) }}>
                                        <AddIcon width={40} height={40} fill={colors.default} />
                                    </TouchableOpacity>}
                            </View>
                        </View>
                    )
                }}
            // onSwiped={setIndex}
            // cardIndex={index}
            // verticalSwipe={false}
            // horizontalSwipe={true}
            // backgroundColor={'white'}
            // stackSize={2} 
            /> :
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>No events yet</Text>
                </View>
            }

            {/* </View > */}

        </View >
    );
}