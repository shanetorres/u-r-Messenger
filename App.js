import React from 'react';
import { Dimensions, Keyboard, FlatList, KeyboardAvoidingView, Alert, StyleSheet, Text, View, ListItem } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { Bubble } from 'nachos-ui';

import { createAppContainer, createStackNavigator, createBottomTabNavigator, NavigationActions,StackActions } from 'react-navigation'
import * as firebase from 'firebase';
import StoryView from './components/storyview.js';
import MessagesOverview from './components/messagesoverview.js';
import MessagingRoom from './components/messagingroom.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Login from './components/login.js'
import SignUp from './components/signup.js'
import Loading from './components/loading.js'
import Settings from './components/settings.js'
import ChangePassword from './components/changepassword.js'
import ChangeEmail from './components/changeemail.js'
import ReAuthenticate from './components/reauthenticate.js'
import EnterEmail from './components/enteremail.js'
import CreateRoom from './components/createroom.js'
import DateSelect from './components/dateselect.js'

const TabNavigator = createBottomTabNavigator(
  {
  Home: MessagesOverview,
  Settings: Settings,
  },
  {
  // CONFIGURATION OF MENU BUTTONS, HOME AND SETTINGS.
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Home') {
        iconName = `ios-chatbubbles${focused ? '' : '-outline'}`;
      } else if (routeName === 'Settings') {
        iconName = `ios-options${focused ? '' : '-outline'}`;
      }
      return <Ionicons name={iconName} size={horizontal ? 25 : 30} color={tintColor} />;
    },
    tabBarOptions: {
      showLabel: false,
      showIcon: true,
      activeTintColor: '#AED2F2',
      inactiveTintColor: 'gray',
      activeBackgroundColor: 'white',
      inactiveBackgroundColor: 'white',
      borderColor: '#F9EFEF'
    },
  })
},
{
  initialRouteName: 'Home',
  navigationOptions: { portraitOnlyMode: true }
}
);

const RootStack = createStackNavigator(
  {
    MessagingRoom: {
    screen: MessagingRoom,
    navigationOptions: ({navigation}) => ({
    headerLeft: <Button 
    title=""
    buttonStyle={{backgroundColor: 'transparent'}}
    icon={{name: 'chevron-left', type: 'entypo', color:'#A2AAA6'}}
    onPress={() => navigation.navigate('Tabs')}/>
    })
  },
  Tabs: {
    screen: TabNavigator,
    navigationOptions : ({navigation}) => ({
      title: "Home",
      headerLeft: null,
      gesturesEnabled: false,
      headerStyle: {
        backgroundColor: '#FFDD8E'
      },
      headerTitleStyle: {
        fontWeight: '600', 
        color: '#4A4A48'
      },
      headerRight: (
        // Start new conversation button.
        <Button
        title=""
        buttonStyle={{backgroundColor: 'transparent'}}
        icon={{name: 'add-user', type:'entypo', color:'#A2AAA6'}}
        onPress={() => {
          // Initialize current user values.
          const { currentUser } = firebase.auth();
          let username = currentUser.uid;

          let db = firebase.database(); 
          let ref = db.ref("/users");

          // Retrieve the number of active users
          if (db.ref("activeUsers")) {
            activeRef = db.ref("activeUsers")
            activeRef.once("value", function(active) {
            // If there are more than one active users start a new conversation
            if (active.numChildren() > 1) {
              convoRef = db.ref("/users/"+username+"/settings/latestConvo")
              let userConvo = "";
              convoRef.once("value", function (ts) {
              userConvo = new Date(ts.val().timestamp);
              currentTs = new Date()
              currentTsLocale = new Date(currentTs.toLocaleString());
              // If the last started conversation was over an hour ago, navigate to the create room component.
              if (currentTsLocale - userConvo >= 3600000) {
                navigation.navigate('CreateRoom')
              }
              // Notify the user if they can not start a conversation just yet.
              else {
                let remainingTime = ((((3600000 - (currentTsLocale - userConvo))/1000))/60)/60
                Alert.alert("You can only start one new conversation every hour.  Return in "+remainingTime.toFixed(2)+" hours.")
              }
              })
              } else {
                Alert.alert("Not enough active users")
              }})
              } else {
                Alert.alert("No Active Users")
              }
          }
        }
      />  
    ),
  })  
  },
    // UI COMPONENTS
    StoryView: StoryView,
    DateSelect: DateSelect,
    SignUp: SignUp,
    Login: Login,
    Loading: Loading,
    ReAuthenticate: ReAuthenticate,
    Password: { 
      screen: ChangePassword,
      gesturesEnabled: false
    },
    EnterEmail: EnterEmail,
    ChangeEmail: { 
      screen: ChangeEmail,
      gesturesEnabled: false
    },
    CreateRoom: { screen: CreateRoom,
      gesturesEnabled: false
      },
    },
    {
    initialRouteName: 'Loading',
    navigationOptions: {
    portraitOnlyMode: true
    }
  },
);

const AppContainer = createAppContainer(RootStack);

export default AppContainer;