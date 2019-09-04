// - MESSAGESOVERVIEW.JS
// Displays all current conversations and allows users to enter/delete them.

import React from 'react';
import { InteractionManager, Image, Dimensions, Modal, Alert, View, ScrollView, Text, StyleSheet, FlatList, TouchableHighlight } from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import * as Animatable from 'react-native-animatable'
import { NavigationActions,StackActions} from 'react-navigation';
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';
import { Permissions, Notifications } from 'expo';

let lastMessage = []; 
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class MessagesOverview extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.goToMessagingRoom = this.goToMessagingRoom.bind(this)
    this.state = {
      unread: true,
      currentUser: null,
      message: [],
      roomnames: [],
      rooms: [],
      username: "",
      day: "",
      noOfRooms: 1,
      weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      firstLogin: false,
      showGenderModal: false,
      // Boolean variables determine how much of the intro screen to reveal
      gotit1:false,
      gotit2:false,
      gotit3:false,
      gotit4:false,
      gotit5:false,
      //Modal state
      maleButtonColor: "lightgrey",
      femaleButtonColor: "lightgrey",
      otherButtonColor: "lightgrey",
      iconColor: 'transparent',
      gender: 'other',
      selected: false, //gender selected
    }
  }

  // DELETE THE SELECTED CONVERSATION.
  deleteConversation(roomID, otherUser, disconnected) {
    // The other user has disconnected from the room, simply clear it
    if (disconnected) {
      firebase.database().ref('/users/'+this.state.currentUser.uid+"/rooms/"+roomID).remove(function(error){})
    }
    // The room is still active, simply changes its visibility value.
    else {
      let deleteRef = firebase.database().ref("/users/"+this.state.currentUser.uid+"/rooms/"+roomID+'/visible');
     deleteRef.set(false);
    }
  }

  // NAVIGATE TO THE MESSAGING ROOM WITH NECESSARY PARAMETERS.
  goToMessagingRoom(newLearn, otherUser, key, display,  story, otherStory) {
    firebase.database().ref("/users/"+this.state.username+'/rooms/'+key+"/unread/").set(false);
    this.props.navigation.navigate('MessagingRoom', {newLearn: newLearn, roomNo: key, display: display, otherUser: otherUser, userStory: story, otherUserStory: otherStory});
  }

  // COMPARE TWO TIMESTAMPS FOR SORTING PURPOSES>
  compare(a, b) {
    const timestampA = a.timestamp;
    const timestampB = b.timestamp;
    let comparison = 0;
    if (timestampA > timestampB) {
      comparison = 1;
    } else if (timestampA < timestampB) {
      comparison = -1;
    }
    return comparison*-1;
  }

  // ASK THE USER TO REGISTER FOR PUSH NOTIFICATIONS IF THEY HAVE NEVER BEEN ASKED.
  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();
    const { currentUser } = firebase.auth()
    var username = currentUser.uid;
    firebase.database().ref('/users/'+username+"/settings/token").set(token)
  };

  componentDidMount() { 
    InteractionManager.runAfterInteractions(() => { 
    this.state.day = new Date().setHours(0,0,0,0);
    const { currentUser } = firebase.auth()
    this.setState({ currentUser });
    var username = currentUser.uid;
    this.setState({ username });
    let db = firebase.database();

    // CHECK IF THE CURRENT USER'S ACCOUNT HAS BEEN BLOCKED
    firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/settings/blocked").on("value",function(blocked) {
      if (blocked.val() == "true") {
        // Set the user's account status to inactive so no new conversations can be started with them.
        let ref = firebase.database().ref("/activeUsers/"+username+"/");
          ref.remove(function(error){})
          firebase.database().ref("/users/"+username+"/settings/active/").set({
            value: false
          });

        Alert.alert("Account Blocked","Your account has been blocked. If you feel an error has occurred, please contact help.urmessenger@gmail.com.")

        // Sign the blocked user out.
        firebase.auth().signOut().then(() => {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [
            NavigationActions.navigate({ routeName: 'SignUp' }),
          ],
          });
          this.props.navigation.dispatch(resetAction);
        }).catch(function(error){}) 
      } 
    })

    let userRef = db.ref("users/"+username+"/rooms/");
    let roomText = [];
     
    // Get the current rooms that the user is in.
    userRef.on('value', function(snapy){
      this.setState({noOfRooms: snapy.numChildren()})
      roomText = [];
      let overview=[];
      snapy.forEach(function (room) {
        roomText.push(room.val());
        let currentTime = new Date(); 
      }.bind(this));

      // Sort the list of messaging rooms by the most recent message.
      roomText.sort(this.compare);
        this.setState({
          rooms: roomText
        });

      }.bind(this))

      // Display the intro page if the user has never logged in before.
      if (this.props.navigation.getParam('firstLogin')==true)
      {  
        setTimeout(function(){this.setState({ showGenderModal: true })}.bind(this), 1000)
      }

      this._notificationSubscription = this.registerForPushNotificationsAsync();
    })  
  }

  
  
  render() {
    return ( 
      <ScrollView contentContainerStyle= {{flex: 1, justifyContent: 'center'}}style={{flex: 1, backgroundColor: "#F9F3E5"}} 
      shouldRasterizeIOS={true}>
      {/* Display the message if the user is not in any rooms */}
      {this.state.noOfRooms == 0 &&
      <Text style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', marginTop: 10}}>You don't have any current conversations</Text>}  
      {/* Intro modal, only displays if the user has never logged in before */}
      <Modal
      animationType="fade"
      transparent={false}
      visible={this.state.showGenderModal}>
        <ScrollView contentContainerStyle ={{justifyContent: 'center',
        alignItems: 'center'}}style={{flex:1, backgroundColor:'white'}}
        ref={scrollView => this.scrollView = scrollView}
        // Automatically scroll the bottom of the page whenever new content is revealed
        onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}
        onLayout={() => this.scrollView.scrollToEnd({animated: true})}>
        {/* u-r Logo */}
        <Animatable.View animation='fadeIn' duration={1000} style={{marginTop: SCREEN_HEIGHT>850 && 60 || 30, marginBottom: 20,alignSelf:'center',width: 200,height:200,backgroundColor:'transparent'}}><Image source={require("../images/logo.png")} style={{ alignSelf: 'center', height: 250, width: 250, marginBottom:0}}/></Animatable.View>
        {/* First section of intro text */}
        <Text style={{marginTop:50, marginBottom:20}}>Welcome to u-r Messenger</Text>
        <Text style={{textAlign: 'center',marginLeft: 30, marginRight:30,marginTop:20, marginBottom:20}}>u-r Messenger is an app where you are randomly assigned a character,
          and then placed in a chat room with an individual who is a different character.</Text>
          <Text style={{textAlign: 'center',marginLeft: 30, marginRight:30,marginTop:20, marginBottom:20}}>You can then form interactions with the other user based on the stories that have been given.</Text>
        <Animatable.View animation="pulse">
        <Button
          title=""
          onPress={()=>{
            this.scrollView.scrollToEnd({animated: true})
            this.setState({gotit1: true})}}
          buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: SCREEN_HEIGHT>850 && 30 }}
          icon={{name: 'check', type: 'feather', color: "#4EBF75", size: 35}}
        />
        </Animatable.View>

        {
          // Second section of intro text
          this.state.gotit1 && 
          <Animatable.View animation="fadeIn" duration={1000}>
          <Animatable.View animation="fadeIn" duration={1000}> <Image source={require("../images/homescreen.png")} style={{ alignSelf: 'center', height: 200, width: 100, marginTop:5, marginBottom:0}}/> </Animatable.View>
          <Text style={{marginTop:30, marginBottom:20,textAlign: 'center',marginLeft: 30, marginRight:30,}}>This is the home screen, to start a new conversation, press the top right button. Press and hold on any conversation to delete your message history.
          You can start one new conversation an hour.</Text>
          <Button
            title=""
            onPress={()=>{
              this.scrollView.scrollToEnd({animated: true})
              this.setState({gotit2: true})}}
            buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: SCREEN_HEIGHT>850 && 30 || 0}}
            icon={{name: 'check', type: 'feather', color: "#4EBF75", size: 35}}
          />
          </Animatable.View>
        }

        {/* Third section of intro text */}
        {this.state.gotit2 && 
          <Animatable.View animation="fadeIn" duration={1000}> <Image source={require("../images/disconnect.png")} style={{ alignSelf: 'center', height: 200, width: 100, marginTop:5, marginBottom:0}}/> 
          {/* <View style={{marginTop: 30, marginBottom: 20,alignSelf:'center',width: 100,height:100,backgroundColor:'#EDDCDC'}}></View> */}
          <Text style={{marginTop:30, marginBottom:20,textAlign: 'center',marginLeft: 30, marginRight:30,}}>If you ever wish to stop speaking with a user,
          you can disconnect from them from within the story view which is accessible through a chat room.</Text>
          <Button
            title=""
            onPress={()=>{
              this.scrollView.scrollToEnd({animated: true})
              this.setState({gotit3: true})}}
            buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: SCREEN_HEIGHT>850 && 30 || 0}}
            icon={{name: 'check', type: 'feather', color: "#4EBF75", size: 35}}
          />
          </Animatable.View>
        }

        {/* Fourth section of intro text */}
        {
          this.state.gotit3 && 
          <Animatable.View animation="fadeIn" duration={1000}> <Image source={require("../images/active.png")} style={{ alignSelf: 'center', height: 200, width: 100, marginTop:5, marginBottom:0}}/> 
          {/* <View style={{marginTop: 30, marginBottom: 20,alignSelf:'center',width: 100,height:100,backgroundColor:'#EDDCDC'}}></View> */}
          <Text style={{marginTop:30, marginBottom:20,textAlign: 'center',marginLeft: 30, marginRight:30,}}>If your desire is to be the one who starts conversations
          and not the other way around, simply change your active status from the settings menu.</Text>
          <Button
            title=""
            onPress={()=>{
              this.scrollView.scrollToEnd({animated: true})
              this.setState({gotit4: true})}}
            buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: SCREEN_HEIGHT>850 && 30 }}
            icon={{name: 'check', type: 'feather', color: "#4EBF75", size: 35}}
          />
          </Animatable.View>
        }

        {/* Fifth section of intro text */}
        {
          this.state.gotit4 && 
          <Animatable.View animation="fadeIn" duration={1000}> <Image source={require("../images/characters.png")} style={{ alignSelf: 'center', height: 300, width: 300, marginTop:5, marginBottom:0}}/> 
          <Text style={{marginTop:10, marginBottom:20,textAlign: 'center',marginLeft: 30, marginRight:30,}}>u-r Messenger is best experienced when the user embraces
          the narrative they are given in order to have interesting conversations with someone they've never met.</Text>
          <Button
            title=""
            onPress={()=>{
              this.scrollView.scrollToEnd({animated: true})
              this.setState({gotit5: true})}}
            buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: SCREEN_HEIGHT>850 && 30 }}
            icon={{name: 'check', type: 'feather', color: "#4EBF75", size: 35}}
          />
          </Animatable.View>
        }

        {/* Sixth section of intro text */}
        {this.state.gotit5 && 
        <Animatable.View animation="fadeIn" duration={1000}>
        <Text style={{marginTop:20, marginBottom:10,textAlign: 'center',marginLeft: 30, marginRight:30,}}>Pick a gender</Text>
        
        {/* Gender select buttons */}
        <Button 
          buttonStyle={[styles.button, {backgroundColor: this.state.maleButtonColor}]} 
          title="Male"
          onPress={() => {
              this.setState({
                  iconColor: '#4EBF75',
                  maleButtonColor: 'green',
                  femaleButtonColor: 'lightgrey',
                  otherButtonColor: 'lightgrey',
                  gender: 'male',
                  selected: true,
              })
          }}/>
        <Button 
          buttonStyle={[styles.button, {backgroundColor: this.state.femaleButtonColor}]}
          title="Female"
          onPress={() => {
              this.setState({
                  iconColor: '#4EBF75',
                  maleButtonColor: 'lightgrey',
                  femaleButtonColor: 'pink',
                  otherButtonColor: 'lightgrey',
                  gender: 'female',
                  selected:true,
              })
          }}/>
        <Button 
          buttonStyle={[styles.button, {backgroundColor: this.state.otherButtonColor}]}
          title="Prefer not to specify"
          onPress={() => {
              this.setState({
                  iconColor: '#4EBF75',
                  maleButtonColor: 'lightgrey',
                  femaleButtonColor: 'lightgrey',
                  otherButtonColor: 'lightblue',
                  gender: 'other',
                  selected:true,
              })
          }}/>
        <Button
          title=""
          onPress={()=>{
            firebase.database().ref("/users/"+this.state.username+"/settings/gender").set(this.state.gender)
            this.setState({showGenderModal: false})}}
          buttonStyle={{backgroundColor: 'transparent', marginTop: 10, marginBottom: 10, marginBottom: SCREEN_HEIGHT>850 && 30 }}
          icon={{name: 'check', type: 'feather', color: this.state.iconColor, size: 35}}
        />
        </Animatable.View>
        }
        </ScrollView>
      </Modal>    
      {/* Conversation overview list */}
      <FlatList
        style={{backgroundColor: "#F9F3E5" }}
        data={this.state.rooms}
        ref={ref => this.flatList = ref}
        keyExtractor={item=>item.roomname}
        renderItem={({item}) => (item.visible == true &&
        // Conversation Item.
        <ListItem 
          contentContainerStyle={{alignItems: 'flex-start', flex:2.45, flexDirection: 'column'}}
          rightContentContainerStyle={{flex:1.3, flexDirection: 'column'}}
          chevron
          rightSubtitle=
          //message was sent today, display the time
          {( item.timestamp > this.state.day && (new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})))
          //message was sent yesterday, display the message yesterday
            || (item.timestamp < this.state.day && item.timestamp > this.state.day - 86400000 && "Yesterday")
            //message was sent before yesterday, display day of the week
            || ((item.timestamp < this.state.day && item.timestamp > this.state.day - 518400000) && this.state.weekdays[new Date(item.timestamp).getDay()])
            //message was sent more than a week ago, display exact date
            || (new Date(item.timestamp).toLocaleDateString())}
          // Display unread icon if an unread message exists, or a disconnected icon if the conversation has been disconnecte
          leftIcon={(item.unread == true  && item.disconnected == false && ({iconStyle: {marginLeft: 2},name: 'circle', type: 'font-awesome', color:'#898ADD', size: 15})) || 
          item.unread == false  && item.disconnected == false && ({name: 'circle', type: 'font-awesome', color:'transparent', size: 15}) ||
          item.disconnected == true &&  ({name: 'cross', type: 'entypo', color: 'red', size: 15})}
          containerStyle= {{ backgroundColor: 'white', borderBottomWidth: 0, borderColor: 'lightgrey'}}
          rightSubtitleStyle={{fontSize:15, color:"grey"}}
          subtitleStyle={(item.newLearnUnread == true && item.lastMessage == 'You learned something new' && {fontSize:12, fontWeight: '500', color:'black'}) || {fontSize:12, color:"grey"}}
          titleStyle= {{flex:1,marginTop: 2, fontSize: 16}}
          titleNumberOfLines={0}
          title={item.otherUserStory}
          // Display a certain amount of the latest message as the conversation subtitle.
          subtitle={ (item.lastMessage.split(/\r\n|\r|\n/).length == 1 && item.lastMessage.length < 35 && item.lastMessage 
            || (item.lastMessage.length >= 35 && (item.lastMessage.substr(0,35)+"..."))
            || (item.lastMessage.substr(0, item.lastMessage.indexOf('\n'))) )}
          // Ask if user wants to delete conversation on press.
          onLongPress={()=>{Alert.alert(
            'Delete Conversation',
            // Display a different message if the other user has disconnected.
            item.disconnected && "This will rid the home view of the disconnected room" || "This will only delete your message history, if you wish to not speak with this user anymore please disconnect from them.",
            [
              {text: 'Cancel', onPress: () => console.log("wow"), style: 'cancel'},
              {text: 'Delete', onPress: () => this.deleteConversation(item.roomname, item.otherUser, item.disconnected), style: 'delete'},
            ],
          )}}
          onPress={()=>{
            // Don't allow the user in the room if the other user has disconnected.
            if (item.disconnected == true) {
              Alert.alert('This user has chosen to disconnect from this conversation')
            }
            // Allow the user into the room with the necessary parameters.
            else {
            this.goToMessagingRoom(item.newLearnUnread, item.otherUser, item.roomname, item.displayname, item.userStory, item.otherUserStory)
            }
          }}
        />
      )}
      />
      </ScrollView>
    );
  }
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',    
  },
  button: {
    width: SCREEN_WIDTH/1.5,
    marginTop: 10,
    borderRadius: 25
  },
})

