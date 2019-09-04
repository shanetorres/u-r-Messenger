// - DATESELECT.JS
// Verifies that the user creating a new account is over 18.

import React from 'react';
import { Dimensions, DatePickerIOS, Text, View, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { createStackNavigator, StackActions, NavigationActions } from 'react-navigation'
import * as Animatable from 'react-native-animatable'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class DateSelect extends React.Component { 
    constructor(props,context) {
        super(props,context)
        this.state = {
            date: new Date(),
            email: '',
            password: '',
        };
        this.addUser = this.addUser.bind(this)
    }

    static navigationOptions = ({navigation}) => ({
        header: null
      })

    componentDidMount() {
        // INITIALIZE NEW USER VALUES.
        useremail = this.props.navigation.getParam('email', 'noemail')
        userpassword = this.props.navigation.getParam('password','nopassword')
        this.state.email = useremail
        this.state.password = userpassword
    }

    // CHECK AGE REQUIREMENT OF THE USER.
    handleSignUp() {
        // Check  if the user is older than 18
        birthdate = this.state.date
        birthdate.setFullYear(birthdate.getFullYear()+18)
        if (birthdate <= new Date()) {
            this.addUser()
        }
        else {
            // Navigate back to sign up if the user is younger than 18.
            Alert.alert('Age Requirement Not Met', 'You must be 18 or older in order to use u-r Messenger')
            const resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'SignUp' }),
                ],
                });
            this.props.navigation.dispatch(resetAction);
        }
    }

    // CREATE A NEW USER.
    addUser() {
        // Create a new user with the given email and password.
        firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then(() => {
            var username = firebase.auth().currentUser.uid;
            // Set the user status to active.
            firebase.database().ref("/users/"+username+"/settings/active").set({
            value: true
            });
            // Initialize a date that will allow the user to start a new conversation.
            firebase.database().ref("/users/"+username+"/settings/latestConvo").set({
                timestamp: "6/20/2018, 00:00:00 AM"
            });
            firebase.database().ref("/users/"+username+"/settings/gender").set("other")
            firebase.database().ref("/users/"+username+"/settings/blocked").set("false")
            firebase.database().ref("/activeUsers/"+username).set({
                username: username
            })
            // Navigate to the main menu with firstLogin as true, meaning that the intro page will display.
            this.props.navigation.navigate('Tabs', {firstLogin: true})})
        .catch(error => this.setState({errorMessage: error.message}));
    }
        render() {
            return(
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{marginLeft: 30, marginRight: 30, alignContent: 'center', textAlign: 'center'}}>Please enter your date of birth: </Text>
                    {/* Date Picker */}
                    <DatePickerIOS
                        style={{ width: 300 }}
                        ref={picker => {
                        this.datePicker = picker;
                         }}
                        date={this.state.date}
                        mode="date"
                        placeholder="Select date"
                        onDateChange={date => {this.setState({ date: date });}} />
                    <Text style={{marginLeft: 30, marginRight: 30, alignContent: 'center', textAlign: 'center'}}>This information is not collected or stored permanently in any way, it is only used to make sure that you are over the age of 18.</Text>
                    {/* Sign Up Button */}
                    <Button 
                        title="Sign Up"
                        buttonStyle={{backgroundColor: '#EAB844',marginTop: 30,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                        onPress={() => this.handleSignUp()}
                    />      
                </View>
            )
        }
    }
