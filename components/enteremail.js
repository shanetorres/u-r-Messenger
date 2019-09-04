// - ENTEREMAIL.JS
// Promps the user to enter an email for password reset.

import React from 'react';
import { TextInput, Alert, View, KeyboardAvoidingView, Text, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements'
import { StackActions, NavigationActions } from 'react-navigation'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class EnterEmail extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            email: '', errorMessage: null
        }
    }

    // Default navigation options.
    static navigationOptions = ({navigation}) => ({
        headerLeft: null,
        header: null
    })

    // NAVIGATE TO THE PASSWORD RESET PAGE.
    handleNavigation() {
        this.props.navigation.navigate('Password', {userEmail: this.state.email})
    }

    render() {
        return( 
            <View style={styles.container}>
                {/* Navigate back chevron button */}
                <Button 
                    buttonStyle= {{backgroundColor: 'transparent', top: SCREEN_HEIGHT/-3, left: SCREEN_WIDTH/-2.2}}
                    title=""
                    icon={{name: "chevron-left", type: 'entypo', color: 'grey'}}
                    onPress={() => this.props.navigation.navigate('Login')}
                />
                <Text>Enter your email: </Text>
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
                {/* Change Password Button */}
                <Button 
                    title="Change Password"
                    buttonStyle={{backgroundColor: '#EAB844',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                    // Send a reset password email to the user and navigate back to the login page 
                    onPress={() => {firebase.auth().sendPasswordResetEmail(this.state.email);
                    Alert.alert("An email has been sent to " + this.state.email);
                    firebase.auth().signOut().then(() => {
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [
                            NavigationActions.navigate({ routeName: 'Login' }),
                            ],
                        });
                        this.props.navigation.dispatch(resetAction);
                    })
                    .catch(function(error){console.log("Could not sign out: "+error);});
                }}
                />
            </View>
        )
        
}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center'
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