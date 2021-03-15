import { View, Text, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react'
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
import SortableGrid from 'react-native-sortable-grid'

export default function AddImages() {
    const step = 1
    const [dob, setDob] = useState("")
    const [temp, setTemp] = useState(0)
    const [index, setIndex] = useState(0)
    const [images, setImages] = useState([])
    const [imagesForUpload, setImagesForUpload] = useState([])
    const [imageListSize, setImageListSize] = useState([])
    const [datePicker, setDatePicker] = useState(false);
    const [shouldScroll, setShouldScroll] = useState(true);
    const navigation = useNavigation()
    const [actionSheet, setActionSheet] = useState();

    useEffect(() => {
        imageListSize.push(1, 1, 1, 1)
    }, [])

    function proceed() {
        console.log(imagesForUpload)
        if (imagesForUpload.length == 0) {
            SimpleToast.show("Please add at least one image")
        } else {
            Api.upadateData({ images: imagesForUpload }).then(res => {
                navigation.navigate('AddInterests')
                console.log(res)
            })
        }
    }

    function pickImage(index) {
        setIndex(index)
        actionSheet.show()
    }

    function onReOrdered(order) {
        setShouldScroll(true)
        console.log(images)
        let localImages = []
        order.itemOrder.forEach(element => {
            if (images[element.key])
                localImages.push(images[element.key].url)
        });
        console.log(localImages)
        setImagesForUpload(localImages)
    }

    return (
        <ScrollView scrollEnabled={shouldScroll} style={{ flex: 1, paddingHorizontal: 20, backgroundColor: 'white' }} contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}>
            <AppHeader step={2} />

            <Text style={{ fontSize: 24 }}>Add Photos</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', margin: 20 }}>
                Upload a selfie or headshot and add more images that expresses yourself to the circle</Text>

            <View style={{ flexGrow: 1, width: '100%' }}>
                <SortableGrid
                    itemsPerRow={2}
                    onDragRelease={onReOrdered}
                    onDragStart={() => setShouldScroll(false)}>
                    {imageListSize.map((item, index) => {
                        return <View key={index} style={{
                            borderColor: colors.default, backgroundColor: '#D9D9D9',
                            borderWidth: 2, height: Dimensions.get('screen').width / 2.7, width: Dimensions.get('screen').width / 2.7, margin: 10
                        }}>
                            <Image source={{ uri: images[index]?.url }} style={{ height: '100%', width: '100%' }} />
                            <TouchableOpacity onPress={() => pickImage(index)} style={{ position: 'absolute', borderRadius: 20, bottom: -20, backgroundColor: 'white', right: -20 }}>
                                <AddIcon width={40} height={40} fill={colors.default} />
                            </TouchableOpacity>
                        </View>
                    })}
                </SortableGrid>
                <Text onPress={() => setImageListSize(imageListSize.concat(1))} style={{ alignSelf: 'flex-end', padding: 10, textDecorationLine: 'underline' }}>more...</Text>
            </View>

            <ActionSheetCustom
                ref={o => setActionSheet(o)}
                title={'Send file from'}
                style={{ backgroundColor: 'red' }}
                options={[option('Camera'), option('Gallery'), optionBold('Cancel')]}
                cancelButtonIndex={2}
                onPress={(indexPick) => {
                    if (indexPick == 0) {
                        openCamera((source, name) => {
                            StorageHelper.uploadFile(source.uri, '', name).then(res => {
                                let localImageListSize = imageListSize
                                setImageListSize([])
                                let localImages = images
                                localImages.push({ key: images.length, url: res })
                                let localImagesForUpload = imagesForUpload
                                localImagesForUpload.push(res)
                                setImages(localImages)
                                setImageListSize(localImageListSize)
                                setImagesForUpload(localImagesForUpload)
                            })
                        })
                    } else if (indexPick == 1) {
                        openImagePicker((source, name) => {
                            StorageHelper.uploadFile(source.uri, '', name).then(res => {
                                let localImageListSize = imageListSize
                                setImageListSize([])
                                let localImages = images
                                localImages.push({ key: images.length, url: res })
                                let localImagesForUpload = imagesForUpload
                                localImagesForUpload.push(res)
                                setImages(localImages)
                                setImageListSize(localImageListSize)
                                setImagesForUpload(localImagesForUpload)
                            })
                        })
                    }
                }}
            />
            <GradientButton
                backgroundColor={colors.default}
                title={"Continue"}
                style={{ height: 40, width: '60%', alignSelf: 'center', margin: 20 }}
                onPress={proceed}
                textColor={'white'} />
        </ScrollView >
    );
}