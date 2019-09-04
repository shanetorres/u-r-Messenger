// - SIGNUP.JS
// Used for creating new user accounts.

import React from 'react';
import { DatePickerIOS, TextInput, Image, TouchableHighlight, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, Alert, StyleSheet, Text, View, ListItem } from 'react-native';
import { Input, Button, ButtonGroup } from 'react-native-elements';
import { createStackNavigator } from 'react-navigation'
import * as Animatable from 'react-native-animatable'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';
import { isNullOrUndefined } from 'util';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class SignUp extends React.Component {
    
    constructor(props, context) {
        super(props, context);
        this.state = {
            email: '',
            email2: '',
            password: '',
            password2:'',
            errorMessage: null,
            index: 0,
            gender: "other",
            chosenDate: new Date(),
        };
    }

    static navigationOptions = ({navigation}) => ({
        headerLeft: null,
        header: null,
        gesturesEnabled: false
    })

    componentDidMount() {
        // Force sign out of any currently authenticated accounts since the user is navigated to this sign up page on sign out.
        firebase.auth().signOut();
    }

    // CHECK IF EMAILS AND PASSWORDS MATCH
    handleSignUp(){
        if (this.state.email == this.state.email2 && this.state.password == this.state.password2) {
            this.props.navigation.navigate('DateSelect', {email: this.state.email, password: this.state.password})
        }
        else{
            this.setState({ errorMessage: "Your emails or passwords do not match" })
        }
    }
    render() {
        return(
            <Animatable.View animation={'fadeIn'} duration={3000} style ={{flex:1, backgroundColor: 'white'}}>
                <KeyboardAvoidingView style={styles.container}
                behavior="padding"
                keyboardVerticalOffset={SCREEN_HEIGHT > 800 && 64 || 200}>
                    {/* Fades in the app logo */}
                    <Animatable.View animation={'fadeIn'} duration={3000}><Image source={require("../images/logo.png")} style={{ marginTop: 10, alignSelf: 'center', height: 250, width: 250}}/></Animatable.View>
                    <TouchableHighlight>
                        <Text style={{marginBottom:5}}>Welcome to u-r Messenger</Text>
                    </TouchableHighlight>
                    <TouchableHighlight>
                        <Text>Enter the following:</Text>
                    </TouchableHighlight>
                    {/* Displays an error message if the username/password combo is incorrect */}
                    {this.state.errorMessage &&
                    <Text style={{ color: 'red' }}>
                        {this.state.errorMessage}
                    </Text>}
                    <View style= {styles.inputView}>
                        {/* Email Input */}
                        <TextInput
                            multiline={false}
                            placeholder="Email"
                            keyboardType="email-address"
                            style={styles.textInput}
                            onChangeText={email => this.setState({email})}
                            value={this.state.email}
                        />
                        {/* Confirm Email Input */}
                        <TextInput
                            multiline={false}
                            placeholder="Confirm Your Email"
                            keyboardType="email-address"
                            style={styles.textInput}
                            onChangeText={email2 => this.setState({email2})}
                            value={this.state.email2}
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
                        {/* Confirm Password Input */}
                        <TextInput
                            multiline={false}
                            secureTextEntry
                            placeholder="Confirm Your Password"
                            style={styles.textInput}
                            onChangeText={password2 => this.setState({password2})}
                            value={this.state.password2}
                        />
                    </View>
                    {/* Sign up button */}
                    <Button 
                        title="Sign Up"
                        buttonStyle={{backgroundColor: '#EAB844',marginTop: 30,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                        onPress={() => this.handleSignUp()}
                    />
                    {/* On press navigate to login menu if the user already has an account */}
                    <TouchableHighlight underlayColor='transparent' style={{marginTop:10, marginBottom: 20}}onPress={() => this.props.navigation.navigate('Login')}>
                        <Text>Already have an account? Log in</Text>
                    </TouchableHighlight>
                </KeyboardAvoidingView>
            </Animatable.View>
        )
    }
}

const styles = StyleSheet.create({
    inputView: { 
        justifyContent:'center', alignItems: 'center', width: SCREEN_WIDTH/1.05
    },
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