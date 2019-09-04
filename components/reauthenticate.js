// - REAUTHENTICATE.JS
// Reauthenticates the user for things like changing a password or an email.

import React from 'react';
import { TextInput, Alert,TouchableHighlight, Dimensions, View, KeyboardAvoidingView, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements'
import * as firebase from 'firebase';
import { NavigationActions,StackActions } from 'react-navigation';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class ReAuthenticate extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
         password: '',
         errorMessage: null,
         changeEmail: false
        }
    }

    // Default navigation options.
    static navigationOptions = ({navigation}) => ({
        headerLeft: null,
        header: null
    })

    // SEND A PASSWORD RESET EMAIL AND NAVIGATE BACK TO LOGIN.
    resetPassword() {
        var user = firebase.auth().currentUser;
        firebase.auth().sendPasswordResetEmail(user.email);
            Alert.alert("An email has been sent to " + user.email);
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
    }

    // REAUTHENTICATE THE CURRENT USER.
    reAuthenticate() {
        const { navigation } = this.props;
        const email = navigation.getParam('email', false);
        var user = firebase.auth().currentUser;
        
        // Reauthenticate the current user based on the authentication credential.
        let credential = firebase.auth.EmailAuthProvider.credential(user.email, this.state.password);
        user.reauthenticateAndRetrieveDataWithCredential(credential).then(()=> {
            // User is changing email.
            if (email == true) {
                this.props.navigation.navigate('ChangeEmail');
                this.props.navigation.dispatch(replaceAction)
           }
           // User is changing password.
            else {
                this.props.navigation.navigate('Password');
            }
        }).catch(function(error) {error => this.setState({ errorMessage: error.message })});
    }

    render() {
        return (
            <View style={styles.container}
            behavior="padding">
                {/* Navigate backwards chevron button */}
                <Button 
                    buttonStyle= {{backgroundColor: 'transparent', top: SCREEN_HEIGHT/-3, left: SCREEN_WIDTH/-2.2}}
                    title=""
                    icon={{name: "chevron-left", type: 'entypo', color: 'grey'}}
                    onPress={() => this.props.navigation.navigate('Tabs')}
                />
                <Text>Enter your password to re-authenticate: </Text>
                {/* The following text displays if the password is incorrect. */}
                {this.state.errorMessage && <Text style={{ color: 'red' }}>
                    {this.state.errorMessage}
                </Text>}
                {/* Password Input */}
                <TextInput
                    secureTextEntry
                    multiline={false}
                    placeholder="Password"
                    style={styles.textInput}
                    onChangeText={password => this.setState({password})}
                    value={this.state.password}
                />
                {/* Re-Authenticate Button */}
                <Button 
                    title="Re-Authenticate"
                    buttonStyle={{backgroundColor: '#EAB844',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                    onPress={() => this.reAuthenticate()}
                />
                {/* Reset Password Button */}
                <TouchableHighlight underlayColor='transparent' style={{marginTop:10}}onPress={() => this.resetPassword()}>
                <Text>Forgot your password?</Text>
                </TouchableHighlight>
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