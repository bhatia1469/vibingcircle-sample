import { View, Text, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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
import { option, optionBold, openCamera, openImagePicker } from '../utils/PickerHelper';
import ActionSheetCustom from '../../modules/react-native-actionsheet';
import GradientButton from '../components/GradientButton';
import CloseIcon from '../assets/icons/close-circle-fill.svg'
import AddIcon from '../assets/icons/add-circle-fill.svg'
import StorageHelper from '../repo/StorageHelper';
import Api from '../repo/Api';
import SimpleToast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

export default function UpdateImages() {
    const step = 1
    const [dob, setDob] = useState("")
    const [temp, setTemp] = useState(0)
    const [index, setIndex] = useState(0)
    const [images, setImages] = useState([])
    const [imageListSize, setImageListSize] = useState([1, 1, 1, 1])
    const [datePicker, setDatePicker] = useState(false);
    const navigation = useNavigation()

    const toggleDatePicker = () => {
        setDatePicker(!datePicker)
    }

    function proceed() {
        if (images.length == 0) {
            SimpleToast.show("Please add at least one image")
        } else {
            Api.upadateData({ images: images }).then(res => {
                AsyncStorage.setItem('user', JSON.stringify(res)).then(res => {
                    navigation.goBack()
                })
                console.log(res)
            })
        }
    }

    function pickImage(index) {
        setIndex(index)
        actionSheet.show()
    }

    let actionSheet

    function imagePicker() {
        return <ActionSheetCustom
            ref={o => actionSheet = o}
            title={'Send file from'}
            style={{ backgroundColor: 'red' }}
            options={[option('Camera'), option('Gallery'), optionBold('Cancel')]}
            cancelButtonIndex={2}
            onPress={(indexPick) => {
                if (indexPick == 0) {
                    openCamera((source, name) => {
                        StorageHelper.uploadFile(source.uri, '', name).then(res => {
                            setImages(images => images.concat(res))
                        })
                    })
                } else if (indexPick == 1) {
                    openImagePicker((source, name) => {
                        StorageHelper.uploadFile(source.uri, '', name).then(res => {
                            setImages(images => images.concat(res))
                        })
                    })
                }
            }}
        />
    }

    const showPicker = () => {
        return (
            <DateTimePicker
                isVisible={datePicker}
                mode={'date'}
                date={new Date()}
                maximumDate={moment().subtract(18, 'years').toDate()}
                is24Hour={false}
                onCancel={() => {
                    toggleDatePicker()
                }}
                onConfirm={(date) => {
                    if (date != undefined) {
                        toggleDatePicker()
                        console.log(date)
                        setDob(moment(date).format('DD/MM/YYYY'))
                    }
                }}
            />
        )
    }


    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, backgroundColor: 'white' }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}>

            <Text style={{ fontSize: 24, marginTop: 20 }}>Add Photos</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', margin: 20 }}>
                Upload a selfie or headshot and add more images that expresses yourself to the circle</Text>

            <View style={{ flexGrow: 1, width: '100%' }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {imageListSize.map((item, index) => {
                        return <TouchableOpacity style={{
                            borderColor: colors.default, backgroundColor: '#D9D9D9',
                            borderWidth: 2, height: 200, width: '42%', margin: 10
                        }}>
                            <Image source={{ uri: images[index] }} style={{ height: '100%', width: '100%' }} />
                            <TouchableOpacity onPress={() => pickImage(index)} style={{ position: 'absolute', borderRadius: 20, bottom: -20, backgroundColor: 'white', right: -20 }}>
                                <AddIcon width={40} height={40} fill={colors.default} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    })}
                </View>
                <Text onPress={() => setImageListSize(imageListSize.concat(1))} style={{ alignSelf: 'flex-end', padding: 10, textDecorationLine: 'underline' }}>more...</Text>
            </View>

            <GradientButton
                backgroundColor={colors.default}
                title={"Continue"}
                style={{ height: 40, width: '60%', alignSelf: 'center', margin: 20 }}
                onPress={proceed}
                textColor={'white'} />
            { showPicker()}
            { imagePicker()}
        </ScrollView >
    );
}