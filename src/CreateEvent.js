import { View, Text, FlatList, Image, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import React, { useState } from 'react'
import { colors } from '../utils/colors';
import TextInput from '../components/AppTextInput';
import AppTextInput from '../components/AppTextInput';
import Button from '../components/Button';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import RNPickerSelect from 'react-native-picker-select';
import Divider from '../components/Divider';
import AppHeader from '../components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import ActionSheetCustom from '../../modules/react-native-actionsheet';
import { option, optionBold, openCamera, openImagePicker } from '../utils/PickerHelper';
import Closefill from '../assets/icons/close-fill.svg'
import SimpleToast from 'react-native-simple-toast';
import Api from '../repo/Api';
import StorageHelper from '../repo/StorageHelper';

export default function CreateEvent() {
    const step = 1
    const [eventDateTime, setEventDateTime] = useState("")
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [location, setLocation] = useState("")
    const [image, setImage] = useState("")
    const [numberOfUsers, setNumberOfUsers] = useState("")
    const [datePicker, setDatePicker] = useState(false);
    const [timePicker, setTimePicker] = useState(false);
    const navigation = useNavigation()

    const toggleDatePicker = () => {
        setTimeout(() => {
            setDatePicker(!datePicker)
        }, 500);
    }

    function proceed() {
        if (title.length == 0) {
            SimpleToast.show("Title field can't be empty")
        } else if (desc.length == 0) {
            SimpleToast.show("Description field can't be empty")
        } else if (location.length == 0) {
            SimpleToast.show("Location field can't be empty")
        } else if (eventDateTime.length == 0) {
            SimpleToast.show("Title field can't be empty")
        } else {
            let data = {
                title: title,
                description: desc,
                createdBy: global.uid,
                createdOn: new Date(),
                joinedUsers: [],
                location: location,
                eventDate: eventDateTime,
                maxUsers: numberOfUsers,
                image: image.length > 0 ? image : 'https://via.placeholder.com/500?text=Event'
            }
            Api.addPlan(data).then(res => {
                navigation.goBack()
            })
        }
    }

    const showPicker = () => {
        return (
            <DateTimePicker
                isVisible={datePicker}
                mode={'datetime'}
                date={new Date()}
                minimumDate={new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                is24Hour={false}
                onCancel={() => {
                    toggleDatePicker()
                }}
                onConfirm={(date) => {
                    if (date != undefined) {
                        toggleDatePicker()
                        console.log(date)
                        setEventDateTime(date)
                    }
                }}
            />
        )
    }

    let actionSheet


    function imagePicker() {
        return <ActionSheetCustom
            ref={o => actionSheet = o}
            title={'Upload image from'}
            style={{ backgroundColor: 'red' }}
            options={[option('Camera'), option('Gallery'), optionBold('Cancel')]}
            cancelButtonIndex={2}
            onPress={(indexPick) => {
                if (indexPick == 0) {
                    openCamera((source, name) => {
                        StorageHelper.uploadFile(source.uri, '', name).then(res => {
                            setImage(res)
                        })
                    })
                } else if (indexPick == 1) {
                    openImagePicker((source, name) => {
                        StorageHelper.uploadFile(source.uri, '', name).then(res => {
                            setImage(res)
                        })
                    })
                }
            }}
        />
    }

    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, backgroundColor: 'white' }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}>
            <View style={{ flexGrow: 1, width: '100%', paddingTop: 20 }}>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Closefill height={40} width={40} fill={'gray'} />
                </TouchableOpacity>

                <AppTextInput
                    placeholder={"Title"}
                    value={title}
                    onChangeText={setTitle}
                    onSubmitEditing={() => { }}
                />
                <AppTextInput
                    placeholder={"Description"}
                    onSubmitEditing={() => { }}
                    value={desc}
                    onChangeText={setDesc}
                    maxLength={750}
                />
                <AppTextInput
                    placeholder={"Location"}
                    value={location}
                    onChangeText={setLocation}
                    onSubmitEditing={() => { }}
                />
                <AppTextInput
                    placeholder={"Date/Time"}
                    onPress={toggleDatePicker}
                    pointerEvents='none'
                    value={eventDateTime ? moment(eventDateTime).format('DD/MM/YYYY hh:mm a') : ''}
                    editable={false}
                    onSubmitEditing={() => { }}
                />
                <RNPickerSelect
                    items={[
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '4', value: '4' },
                        { label: '5', value: '5' },
                        { label: '6', value: '6' },
                        { label: '7', value: '7' },
                        { label: '8', value: '8' },
                        { label: '9', value: '9' },
                        { label: '10+', value: '10+' },
                    ]}
                    pickerProps={{ mode: 'dropdown' }}
                    onValueChange={setNumberOfUsers}
                    value={numberOfUsers}
                    useNativeAndroidPickerStyle={false}
                    style={StyleSheet.create({
                        inputAndroid: {
                            color: '#273940', marginVertical: 5, marginTop: 20,
                            marginStart: 0, fontWeight: 'bold', fontSize: 20,
                        },
                        inputIOS: {
                            color: '#273940', marginVertical: 10, marginTop: 20,
                            marginStart: 8, fontWeight: 'bold', fontSize: 20,
                        },
                        placeholder: { color: '#868686' },
                    })}
                    placeholder={{ label: "Limit Users (Optional)", value: '' }}
                />
                <Divider color="#e5e5e5" style={{ marginHorizontal: 4 }} />

                <AppTextInput
                    placeholder={"Upload Picture (Optional)"}
                    onPress={() => actionSheet.show()}
                    containerStyle={{ marginTop: Platform.OS == 'ios' ? 20 : 25 }}
                    value={image}
                    pointerEvents='none'
                    editable={false}
                    onSubmitEditing={() => { }}
                />

            </View>
            <Button
                backgroundColor={colors.default}
                title={"Start"}
                style={{ height: 40, width: '60%', alignSelf: 'center', margin: 20 }}
                onPress={proceed}
                textColor={'white'} />
            {showPicker()}
            {imagePicker()}
        </ScrollView >
    );
}