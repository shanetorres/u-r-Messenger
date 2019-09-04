// - LOGIN.JS
// Authenticates the user attempting to login and navigates to the tabs menu if credentials are valid.

import React from 'react';
import { TextInput, TouchableHighlight, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, Alert, StyleSheet, Text, View, ListItem } from 'react-native';
import { Button } from 'react-native-elements';
import { createStackNavigator } from 'react-navigation'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


export default class Login extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.navigateEmail = this.navigateEmail.bind(this)
        this.state = {
            email: '', password: '', errorMessage: null
        }
    }

    // Default navigation options.
    static navigationOptions = ({navigation}) => ({
        header: null,
        headerLeft: null,
    })

    // AUTHENTICATE THE USER AND SEND THEM TO THE MESSAGES OVERVIEW PAGE.
    handleLogIn() {
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/settings/blocked").once("value",function(blocked) {})
            }).catch(error => this.setState({ errorMessage: error.message }))
        this.state.email = '';
        this.state.password = '';
    }

    // NAVIGATE TO ENTER EMAIL PAGE FOR PASSWORD RESET.
    navigateEmail() {
        this.props.navigation.navigate('EnterEmail');
    }

    render() {
        return(
            <KeyboardAvoidingView style={styles.container}
            behavior="padding">
                <TouchableHighlight>
                    <Text>Enter existing account information:</Text>
                </TouchableHighlight>
                {/* Error message shows if sign in is invalid */}
                {this.state.errorMessage &&
                <Text style={{ color: 'red' }}>
                    {this.state.errorMessage}
                </Text>}
                {/* Email Input */}
                <TextInput
                multiline={false}
                placeholder="Email"
                keyboardType='email-address'
                style={styles.textInput}
                onChangeText={email => this.setState({email})}
                value={this.state.email}
                />
                {/* Password Input */}
                <TextInput
                multiline={false}
                secureTextEntry
                placeholder="Password"
                style={styles.textInput}
                onChangeText={password => this.setState({password})}
                value={this.state.password}
                />
                {/* Login Button */}
                <Button 
                title="Log In"
                buttonStyle={{backgroundColor: '#EAB844',marginTop: 30,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                onPress={() => this.handleLogIn()}
                />
                {/* Forgotten password button */}
                <TouchableHighlight underlayColor='transparent' style={{marginTop:10}}onPress={() => this.navigateEmail()}>
                    <Text>Forgot your password?</Text>
                </TouchableHighlight>
                <TouchableHighlight underlayColor='transparent' style={{marginTop:10}}onPress={() => this.props.navigation.navigate('SignUp')}>
                    <Text>Don't have an account? Register Here</Text>
                </TouchableHighlight>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    textInput: {
        backgroundColor: '#F0F0F0',
        borderStyle: 'solid',
        overflow: 'hidden',
        fontSize: 17,
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 25,
        paddingHorizontal: 12,
        width: SCREEN_WIDTH/1.2,
        height: 35,
        marginTop: 10
    }
})