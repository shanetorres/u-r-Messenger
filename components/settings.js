// - SETTINGS.JS
// User and account settings, also handles sign out logic.

import React from 'react';
import { Linking, ScrollView, Switch, ActivityIndicator, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, Alert, StyleSheet, Text, View } from 'react-native';
import {  ListItem,  Input, Button } from 'react-native-elements';
import { createStackNavigator,NavigationActions,StackActions } from 'react-navigation';
import Octicons from 'react-native-vector-icons/Octicons';
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

export default class Settings extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentUser: "",
      active: true,
      userName: "",
      isActive: "#F4A835",
      inactive: "lightgrey",
      noButtonColor: "lightgrey",
      yesButtonColor: "lightgrey",
      maleButtonColor: "lightgrey",
      femaleButtonColor: "lightgrey",
      otherButtonColor: "lightgrey",
      gender: "other",
    }
  }

  // SIGN OUT USER.
  handleSignOut(){
    // Sign user out and send them back to the sign up page.
    firebase.auth().signOut().then(() => {
       console.log("RESET");
       const resetAction = StackActions.reset({
         index: 0,
         actions: [
          NavigationActions.navigate({ routeName: 'SignUp' }),],
       });
       this.props.navigation.dispatch(resetAction);
    }).catch(function(error){
          console.log("Could not sign out: "+error);
      });
    }
  
  componentDidMount(){
    // Initialize Current User parameters.
    const { currentUser } = firebase.auth();
    this.setState({ currentUser });
    var username = currentUser.uid;
    this.setState({ userName: username });

    // Set active gender button depending on the gender value of the user.
    let db = firebase.database();
    firebase.database().ref("/users/"+username+"/settings/gender").once("value", function(gender) {
      if (gender.val() == "male") {
        this.setState({ gender: "male", maleButtonColor: "#4EBF75", femaleButtonColor: "lightgrey", otherButtonColor:"lightgrey" })
      } else if (gender.val() == "female") {
        this.setState({ gender: "female", maleButtonColor: "lightgrey", femaleButtonColor: "pink", otherButtonColor:"lightgrey" })
      } else if (gender.val() == "other") {
        this.setState({ gender: "other", maleButtonColor: "lightgrey", femaleButtonColor: "lightgrey", otherButtonColor:"lightblue" })
      }
    }.bind(this))

    // Retrieve the active status of the user.
    let activeRef = db.ref("/users/"+username+"/settings/active")
    activeRef.once("value", function (active) {
      if (active.val().value == true) {
        this.setState({active: active.val().value, yesButtonColor: "orange", noButtonColor: "lightgrey"});
      }
      else if (active.val().value == false) {
        this.setState({active: active.val().value, yesButtonColor: "lightgrey", noButtonColor: "orange"});
      }
    }.bind(this))
  }

    render() {
      return (
        <ScrollView  style={{ flex: 1, backgroundColor: '#F9F3E5'}}>
          {/* User Email */}
          <ListItem
          containerStyle = {{ backgroundColor: 'transparent' }}
          title={"Current User: "+this.state.currentUser.email}
          />
          {/* Account Settings Header */}
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          hideChevron
          title="Account settings:"
          />
          {/* Change Email Button */}
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          title="Change Email"
          chevron
          onPress={()=>this.props.navigation.navigate("ReAuthenticate", {email: true})}
          />
          {/* Change Password Button */}
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          title="Change Password"
          chevron
          onPress={()=>this.props.navigation.navigate("ReAuthenticate")}
          />
          {/* Help Information Item */}
          <ListItem
          subtitleStyle={{fontSize:13, color:"grey"}}
          containerStyle = {{ backgroundColor: 'white'}}
          title="Need Help?"
          subtitle="Email help.urmessenger@gmail.com detailing your issue"
          />
          {/* Email Verification button */}
          <Button
          title= {this.state.currentUser.emailVerified == true && "Email Verified" || "Send Verification Email"}
          buttonStyle={{ borderRadius:0, backgroundColor: this.state.currentUser.emailVerified == true && '#4EBF75' || '#726DA8' }}
          onPress={()=> {
              if (this.state.currentUser.emailVerified == true) {
                Alert.alert("This email has already been verified")
              }
              else {
              this.state.currentUser.sendEmailVerification().then(function(){
                console.log("Verification Email Sent");}).catch(function(error) {
                console.log("Verification Error: "+error)}) 
              }
            }
          }
          />      
          <View style={{height: 30, backgroundColor:'transparent'}}></View>
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          hideChevron
          title="Allow other users to start conversations:"
          />
          {/* Set active to true button */}
          <Button
          buttonStyle={{borderRadius: 0, backgroundColor: (this.state.yesButtonColor) }}
          title="Yes"
          onPress={() => { 
            this.setState({noButtonColor:'lightgrey', yesButtonColor:"#F4A835"})
            firebase.database().ref("/activeUsers/"+this.state.userName+'/').set({
              username: this.state.userName
            });
            firebase.database().ref("/users/"+this.state.userName+"/settings/active/").set({
              value: true
            });
          }}
          />
          {/* Set active to false button */}
          <Button
          buttonStyle={{borderRadius: 0, backgroundColor: (this.state.noButtonColor)}}
          title="No"
          onPress={() => { 
            this.setState({noButtonColor:'#F4A835', yesButtonColor:"lightgrey"})
            let ref = firebase.database().ref("/activeUsers/"+this.state.userName+"/");
            ref.remove(function(error){
              console.log("Could not remove: "+error);
            })
            firebase.database().ref("/users/"+this.state.userName+"/settings/active/").set({
              value: false
            });
          }}
          />
          <View style={{height: 30, backgroundColor:'transparent'}}></View>
          <ListItem
          containerStyle= {{ backgroundColor: 'white' }}
          title= "Gender: "
          />
          {/* Male gender button */}
          <Button
          buttonStyle={{borderRadius: 0, backgroundColor: this.state.maleButtonColor}}
          title="Male"
          onPress={()=>{
            firebase.database().ref("/users/"+this.state.userName+"/settings/gender").set("male")
            this.setState({ gender: "male", maleButtonColor: "#4EBF75", femaleButtonColor: "lightgrey", otherButtonColor:"lightgrey" })
          }}
          />
          {/* Female gender button */}
          <Button
          buttonStyle={{borderRadius: 0, backgroundColor: this.state.femaleButtonColor}}
          title="Female"
          onPress={()=>{
            firebase.database().ref("/users/"+this.state.userName+"/settings/gender").set("female")
            this.setState({ gender: "female", maleButtonColor: "lightgrey", femaleButtonColor: "pink", otherButtonColor:"lightgrey" })
          }}
          />
          {/* Prefer not to specify */}
          <Button
          buttonStyle={{borderRadius: 0, backgroundColor: this.state.otherButtonColor}}
          title="Prefer not to specify"
          onPress={()=>{
            firebase.database().ref("/users/"+this.state.userName+"/settings/gender").set("other")
            this.setState({ gender: "other", maleButtonColor: "lightgrey", femaleButtonColor: "lightgrey", otherButtonColor:"lightblue" })
          }}
          />
          <View style={{height: 30, backgroundColor:'transparent'}}></View>
          {/* Privacy policy */}
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          title = "Privacy Policy"
          onPress={()=>{Linking.openURL("https://www.iubenda.com/privacy-policy/53431539")}}
          />
          <View style={{height: 30, backgroundColor:'transparent'}}></View>
          {/* Sign out button */}
          <ListItem
          containerStyle = {{ backgroundColor: 'white'}}
          title = "Sign Out"
          leftIcon={{name: 'settings', type: 'oct-icons', color: 'grey'}}
          onPress={()=>{this.handleSignOut();}}
          />
        </ScrollView>
      );
    }
  }

  const activeButtonColor = {
    isActive: "orange",
    inactive: "lightgrey"
  }