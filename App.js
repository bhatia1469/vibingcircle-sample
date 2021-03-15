import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StatusBar, SafeAreaView } from 'react-native';
import React, { useState } from 'react'
import Login from './src/screens/Login';
import Terms from './src/screens/Terms';
import { colors } from './src/utils/colors';
import Welcome from './src/screens/Welcome';
import BasicInfo from './src/screens/BasicInfo';
import AddImages from './src/screens/AddImages';
import AddInterests from './src/screens/AddInterests';
import AboutMe from './src/screens/AboutMe';
import EnableLocation from './src/screens/EnableLocation';
import Home from './src/screens/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Groups from './src/screens/Groups';
import Messages from './src/screens/Messages';
import MyProfile from './src/screens/MyProfile';
import TabView from './src/components/TabView';
import CreateEvent from './src/screens/CreateEvent';
import GetStarted from './src/screens/GetStarted';
import AccountSettings from './src/screens/AccountSettings';
import PrivacyHelp from './src/screens/PrivacyHelp';
import InviteFriends from './src/screens/InviteFriends';
import Friends from './src/screens/Friends';
import Notifications from './src/screens/Notifications';
import EditProfile from './src/screens/EditProfile';
import Chat from './src/screens/Chat';
import ActiveUsers from './src/screens/ActiveUsers';
import UserProfile from './src/screens/UserProfile';
import SignInPhone from './src/screens/SignInPhone';
import Loader from './src/utils/Loader';
import { EventRegister } from 'react-native-event-listeners';
import SignInEmail from './src/screens/SignInEmail';
import UpdateImages from './src/screens/UpdateImages';
import VibingLaterDetails from './src/screens/VibingLaterDetails';
import firebase from '@react-native-firebase/app';
import AppWebView from './src/components/AppWebView';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {

  const [loading, setLoading] = useState(false)

  EventRegister.addEventListener('loader', (value) => {
    setLoading(value)
    if (!value) {
    }
  })

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ backgroundColor: colors.default }} />
      {/* <SafeAreaView style={{ flex: 1, backgroundColor: null }}> */}
      <NavigationContainer>
        <StatusBar backgroundColor={colors.default} barStyle='light-content' />
        <Stack.Navigator headerMode='none'>
          <Stack.Screen name="GetStarted" component={GetStarted} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Terms" component={Terms} />
          <Stack.Screen name="BasicInfo" component={BasicInfo} />
          <Stack.Screen name="AddImages" component={AddImages} />
          <Stack.Screen name="UpdateImages" component={UpdateImages} />
          <Stack.Screen name="AddInterests" component={AddInterests} />
          <Stack.Screen name="AboutMe" component={AboutMe} />
          <Stack.Screen name="EnableLocation" component={EnableLocation} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="AccountSettings" component={AccountSettings} />
          <Stack.Screen name="PrivacyHelp" component={PrivacyHelp} />
          <Stack.Screen name="Friends" component={Friends} />
          <Stack.Screen name="InviteFriends" component={InviteFriends} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="ActiveUsers" component={ActiveUsers} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="SignInPhone" component={SignInPhone} />
          <Stack.Screen name="SignInEmail" component={SignInEmail} />
          <Stack.Screen name="VibingLaterDetails" component={VibingLaterDetails} />
          <Stack.Screen name="AppWebView" component={AppWebView} />
        </Stack.Navigator>
      </NavigationContainer>
      {/* </SafeAreaView> */}
      <Loader visible={loading} />

    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      backBehavior='initialRoute'
      initialRouteName={"Home"}
      tabBar={props => <TabView {...props} />}>

      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Groups" component={Groups} initialParams={{ initialIndex: 0 }} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={MyProfile} />
    </ Tab.Navigator >
  );
}