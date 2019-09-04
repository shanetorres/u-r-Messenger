// - CREATEROOM.JS
// Creates a new room and pairs the creating user with a random active user, randomly selects a story for each.

import React from 'react';
import { Image, Dimensions, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Button, ListItem } from 'react-native-elements'
import {SafeAreaView, createStackNavigator, NavigationActions,StackActions } from 'react-navigation';
import * as Animatable from 'react-native-animatable'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class CreateRoom extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.addRoom = this.addRoom.bind(this);
        this.state = {
            userStoryName:"",
            otherStoryName:"",
            userStory: [],
            otherUserStory: [],
            roomNo: "",
            userGender: "other",
            otherUserGender: "other",
            characterKeys: [],
            userImageSrc: "",
            otherImageSrc: "",
            otherUserToken: '',
            otherUser: ''
        }
    }

    static navigationOptions = ({navigation}) => ({
      header: null
    })
    componentDidMount() {
      const { currentUser } = firebase.auth();
      var username = currentUser.email.substr(0,currentUser.email.indexOf('.'));
    }

    // Send the other user in the conversation a 'New Connection' notification.
    sendNotification(token) {
      if(token != undefined)
      {
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'accept-encoding': 'gzip, deflate',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          'to': token,
          'title': this.state.userStory,
          'body': 'New Connection'
        })
      })
      }
    }

    // CREATE A NEW ROOM WITH A RANDOM USER AND RANDOM STORIES.
    addRoom = () => {
      // INTIALIZE CURRENT USER VALUES.
      const { currentUser } = firebase.auth();
      var username = currentUser.uid;

      const {navigation} = this.props;
      const otherUser = navigation.getParam('otherUser', 'noUser')
      
      // Getting the number of active users
      let db = firebase.database(); 
      let ref = db.ref("/users");            
      activeRef = db.ref("activeUsers");
      activeRef.once("value", function (snapshot) {
        // Add each active user into the users list
        var users = [];  
        snapshot.forEach(function (childSnapshot){
          users.push(childSnapshot.val().username);
        })

        const { currentUser } = firebase.auth();
        currentUser.uid;

        // Select a random other user that isn't the current user from the active list to start a new conversation with.
        let userNo = (Math.floor((Math.random()*snapshot.numChildren())));
        while (users[userNo]==username)
        {
          userNo = (Math.floor((Math.random()*snapshot.numChildren())));
        }

        let userGender=""; let otherGender="";
        //getting userGender
          firebase.database().ref("/users/"+username+"/settings/gender").once("value", function (usergender) {
            userGender=usergender.val()
            if (userGender=="other") {
              let storyPicker = Math.floor((Math.random()*2));
              if (storyPicker == 0) { userGender = "male"}
              else { userGender = "female"}
            }
            this.setState(() => {
              userGender: userGender})
        
          // Get the other user's gender.
          firebase.database().ref("/users/"+users[userNo]+"/settings/gender").once("value", function (otherGender) { 
            otherGender = otherGender.val()
            // IF the user's gender is 'Prefer not to specify', random select male or female.
            if (otherGender=="other") {
              let storyPicker = Math.floor((Math.random()*2));
              if (storyPicker == 0) { otherGender = "male"}
              else { otherGender = "female"}
            }
            this.setState( {
              otherUserGender: otherGender
            })


            let storynames = [];
            let storyRef = db.ref("stories/"+userGender+"/")
            let otherstorynames = [];

            // Get stories that match the user's gender.
            storyRef.once("value", function(story) {
              let noOfStories = story.numChildren();
              story.forEach(function (storyname){
                storynames.push(storyname.val().name);
              })
            
            // Get stories that match the other user's gender.
            firebase.database().ref("stories/"+otherGender+"/").once("value", function(otherStory) {
              let noOfOther = otherStory.numChildren();
              otherStory.forEach(function (othername){
                otherstorynames.push(othername.val().name);
              })
            
            // Random select indices for each user's story
            let userStoryIndex = (Math.floor((Math.random()*noOfStories)));
            let otherStoryIndex = (Math.floor((Math.random()*noOfOther)))

            // Make sure that the user's won't have the same story.
            while (userGender == otherGender && otherStoryIndex == userStoryIndex)
            {
              otherStoryIndex = (Math.floor((Math.random()*noOfOther)))
            }

            // Set the user stories to the randomly selected ones.
            this.state.userStoryName = storynames[userStoryIndex];
            this.state.otherStoryName = otherstorynames[otherStoryIndex];
            this.state.otherUser = users[userNo];
            firebase.database().ref("/stories/"+userGender+"/"+storynames[userStoryIndex]).once('value', function(usersnapshot) {
              this.setState({userStory: usersnapshot.val()}) 

              // DYNAMICALLY SETTING THE USER IMAGE.
              // At the time of writing, there doesn't seem to be a better way to dynamically set an image source.
              switch(usersnapshot.val().image) {
                case '../characters/anita-p.png':
                  this.setState({userImageSrc: require('../characters/anita-p.png')})
                  break;
                case '../characters/ashton-h.png':
                  this.setState({userImageSrc: require('../characters/ashton-h.png')})
                  break;
                case '../characters/barbara-w.png':
                  this.setState({userImageSrc: require('../characters/barbara-w.png')})
                  break;
                case '../characters/bella-b.png':
                  this.setState({userImageSrc: require('../characters/bella-b.png')})
                  break;
                case '../characters/bobby-t.png':
                  this.setState({userImageSrc: require('../characters/bobby-t.png')})
                  break;
                case '../characters/cara-j.png':
                  this.setState({userImageSrc: require('../characters/cara-j.png')})
                  break;
                case '../characters/danny-l.png':
                  this.setState({userImageSrc: require('../characters/danny-l.png')})
                  break;
                case '../characters/elina-r.png':
                  this.setState({userImageSrc: require('../characters/elina-r.png')})
                  break;
                case '../characters/ellie-g.png':
                  this.setState({userImageSrc: require('../characters/ellie-g.png')})
                  break;
                case '../characters/emma-d.png':
                  this.setState({userImageSrc: require('../characters/emma-d.png')})
                  break;
                case '../characters/harry-h.png':
                  this.setState({userImageSrc: require('../characters/harry-h.png')})
                  break;
                case '../characters/jack-a.png':
                  this.setState({userImageSrc: require('../characters/jack-a.png')})
                  break;
                case '../characters/james-n.png':
                  this.setState({userImageSrc: require('../characters/james-n.png')})
                  break;
                case '../characters/janet-p.png':
                  this.setState({userImageSrc: require('../characters/janet-p.png')})
                  break;
                case '../characters/jeremy-s.png':
                  this.setState({userImageSrc: require('../characters/jeremy-s.png')})
                  break;
                case '../characters/johnny-c.png':
                  this.setState({userImageSrc: require('../characters/johnny-c.png')})
                  break;
                case '../characters/judy-w.png':
                  this.setState({userImageSrc: require('../characters/judy-w.png')})
                  break;
                case '../characters/leonard-h.png':
                  this.setState({userImageSrc: require('../characters/leonard-h.png')})
                  break;
                case '../characters/leslie-h.png':
                  this.setState({userImageSrc: require('../characters/leslie-h.png')})
                  break;
                case '../characters/molly-a.png':
                  this.setState({userImageSrc: require('../characters/molly-a.png')})
                  break;
                case '../characters/nick-g.png':
                  this.setState({userImageSrc: require('../characters/nick-g.png')})
                  break;
                case '../characters/peter-l.png':
                  this.setState({userImageSrc: require('../characters/peter-l.png')})
                  break;
                case '../characters/rachelle-c.png':
                  this.setState({userImageSrc: require('../characters/rachelle-c.png')})
                  break;
                case '../characters/ralph-s.png':
                  this.setState({userImageSrc: require('../characters/ralph-s.png')})
                  break;
                case '../characters/robert-s.png':
                  this.setState({userImageSrc: require('../characters/robert-s.png')})
                  break;
                case '../characters/sally-w.png':
                  this.setState({userImageSrc: require('../characters/sally-w.png')})
                  break;
                case '../characters/sylvan-j.png':
                  this.setState({userImageSrc: require('../characters/sylvan-j.png')})
                  break;
                case '../characters/sylvia-s.png':
                  this.setState({userImageSrc: require('../characters/sylvia-s.png')})
                  break;
                case '../characters/walter-f.png':
                  this.setState({userImageSrc: require('../characters/walter-f.png')})
                  break;
                case '../characters/william-w.png':
                  this.setState({userImageSrc: require('../characters/william-w.png')})
                  break;
                }
             }.bind(this))
             
            firebase.database().ref("/stories/"+otherGender+"/"+otherstorynames[otherStoryIndex]).once('value', function(othersnapshot) {
              this.setState({otherUserStory: othersnapshot.val()}) 
            
              // DYNAMICALLY SETTING THE OTher USER IMAGE.
              // At the time of writing, there doesn't seem to be a better way to dynamically set an image source.
              switch(othersnapshot.val().image) {
                case '../characters/anita-p.png':
                  this.setState({otherImageSrc: require('../characters/anita-p.png')})
                  break;
                case '../characters/ashton-h.png':
                  this.setState({otherImageSrc: require('../characters/ashton-h.png')})
                  break;
                case '../characters/barbara-w.png':
                  this.setState({otherImageSrc: require('../characters/barbara-w.png')})
                  break;
                case '../characters/bella-b.png':
                  this.setState({otherImageSrc: require('../characters/bella-b.png')})
                  break;
                case '../characters/bobby-t.png':
                  this.setState({otherImageSrc: require('../characters/bobby-t.png')})
                  break;
                case '../characters/cara-j.png':
                  this.setState({otherImageSrc: require('../characters/cara-j.png')})
                  break;
                case '../characters/danny-l.png':
                  this.setState({otherImageSrc: require('../characters/danny-l.png')})
                  break;
                case '../characters/elina-r.png':
                  this.setState({otherImageSrc: require('../characters/elina-r.png')})
                  break;
                case '../characters/ellie-g.png':
                  this.setState({otherImageSrc: require('../characters/ellie-g.png')})
                  break;
                case '../characters/emma-d.png':
                  this.setState({otherImageSrc: require('../characters/emma-d.png')})
                  break;
                case '../characters/harry-h.png':
                  this.setState({otherImageSrc: require('../characters/harry-h.png')})
                  break;
                case '../characters/jack-a.png':
                  this.setState({otherImageSrc: require('../characters/jack-a.png')})
                  break;
                case '../characters/james-n.png':
                  this.setState({otherImageSrc: require('../characters/james-n.png')})
                  break;
                case '../characters/janet-p.png':
                  this.setState({otherImageSrc: require('../characters/janet-p.png')})
                  break;
                case '../characters/jeremy-s.png':
                  this.setState({otherImageSrc: require('../characters/jeremy-s.png')})
                  break;
                case '../characters/johnny-c.png':
                  this.setState({otherImageSrc: require('../characters/johnny-c.png')})
                  break;
                case '../characters/judy-w.png':
                  this.setState({otherImageSrc: require('../characters/judy-w.png')})
                  break;
                case '../characters/leonard-h.png':
                  this.setState({otherImageSrc: require('../characters/leonard-h.png')})
                  break;
                case '../characters/leslie-h.png':
                  this.setState({otherImageSrc: require('../characters/leslie-h.png')})
                  break;
                case '../characters/molly-a.png':
                  this.setState({otherImageSrc: require('../characters/molly-a.png')})
                  break;
                case '../characters/nick-g.png':
                  this.setState({otherImageSrc: require('../characters/nick-g.png')})
                  break;
                case '../characters/peter-l.png':
                  this.setState({otherImageSrc: require('../characters/peter-l.png')})
                  break;
                case '../characters/rachelle-c.png':
                  this.setState({otherImageSrc: require('../characters/rachelle-c.png')})
                  break;
                case '../characters/ralph-s.png':
                  this.setState({otherImageSrc: require('../characters/ralph-s.png')})
                  break;
                case '../characters/robert-s.png':
                  this.setState({otherImageSrc: require('../characters/robert-s.png')})
                  break;
                case '../characters/sally-w.png':
                  this.setState({otherImageSrc: require('../characters/sally-w.png')})
                  break;
                case '../characters/sylvan-j.png':
                  this.setState({otherImageSrc: require('../characters/sylvan-j.png')})
                  break;
                case '../characters/sylvia-s.png':
                  this.setState({otherImageSrc: require('../characters/sylvia-s.png')})
                  break;
                case '../characters/walter-f.png':
                  this.setState({otherImageSrc: require('../characters/walter-f.png')})
                  break;
                case '../characters/william-w.png':
                  this.setState({otherImageSrc: require('../characters/william-w.png')})
                  break;
                }
              }.bind(this))

            // Set the conversation timestamp
            var conversationts = new Date();
            // Update the user's latest convo database value.
            firebase.database().ref("/users/"+username+"/settings/latestConvo/").set({
              timestamp: conversationts.toLocaleString()
            })
            
            // Generate a random room index for the firebase node value.
            let roomIndex =(Math.floor((Math.random()*1000)));
            this.state.roomNo = users[userNo]+roomIndex;

            // Set all necessary database values for the user room node.
            firebase.database().ref("/users/"+username+'/rooms/'+users[userNo]+roomIndex+"/").set({
              roomname: users[userNo]+roomIndex,
              displayname: users[userNo]+roomIndex,
              lastMessage: "Hey "+otherstorynames[otherStoryIndex].substr(0,otherstorynames[otherStoryIndex].indexOf(" "))+"!",
              otherUser: users[userNo],
              unread: false,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              userStory: storynames[userStoryIndex],
              otherUserStory: otherstorynames[otherStoryIndex],
              disconnected: false,
              userGender: userGender,
              otherUserGender: otherGender,
              newLearnUnread: false,
              userTold: false,
              otherUserTold: false,
              visible: true,
            });

            // Set all necessary database values for the other user room node.
            firebase.database().ref("/users/"+users[userNo]+'/rooms/'+users[userNo]+roomIndex+"/").set({
              roomname: users[userNo]+roomIndex,
              displayname:username+roomIndex,
              lastMessage: "Hey "+otherstorynames[otherStoryIndex].substr(0,otherstorynames[otherStoryIndex].indexOf(" "))+"!",
              otherUser: username,
              unread: true,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              userStory: otherstorynames[otherStoryIndex],
              otherUserStory: storynames[userStoryIndex],
              disconnected: false,
              userGender: otherGender,
              otherUserGender: userGender,
              newLearnUnread: false,
              userTold: false,
              otherUserTold: false,
              visible: true,
            });

            // Create the room node.
            firebase.database().ref("/rooms/"+users[userNo]+roomIndex+"/disconnected").set(false)
            firebase.database().ref("/rooms/"+users[userNo]+roomIndex+"/createUser").set(username)
            firebase.database().ref("/rooms/"+users[userNo]+roomIndex+"/otherUser").set(users[userNo])
            // Send a default first message.
            firebase.database().ref("/rooms/"+users[userNo]+roomIndex+'/messages/').push().set({
              contents: "Hey "+otherstorynames[otherStoryIndex].substr(0,otherstorynames[otherStoryIndex].indexOf(" "))+"!",
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              sender: currentUser.uid,
              index: 0
            });
        
        otheruserRef = firebase.database().ref("users/"+username+"/rooms/"+users[userNo]+roomIndex+"/")
        var otherUser = "";
        // Get the other user's name
        otheruserRef.once('value', function(snapshot) {
          otherUser = snapshot.val().otherUser;
          // Get the other user's token and send a new room notification.
          firebase.database().ref('/users/'+snapshot.val().otherUser+"/settings").on('value', function(tokenSnapshot) {
            this.setState({otherUserToken: tokenSnapshot.val().token})
            this.sendNotification(tokenSnapshot.val().token)
          }.bind(this))
        }.bind(this))
      }.bind(this))   // End of userGender ref
      }.bind(this))   // End of otherGender ref
      }.bind(this))   // End of other stories ref
      }.bind(this))   // End of stories ref
      }.bind(this))   // End of active ref
    
 }
    

    render() {
        return (
            <ScrollView animation={"fadeIn"} duration={1000} contentContainerStyle={{marginTop: 0,}} style={{ flex: 1, backgroundColor: 'white'}}>
            {/* Character Image View */}
            <View style={{flexDirection: 'row'}}> 
              {/* City Image */}
              <Animatable.View animation={'fadeInDown'} duration={1900} onAnimationEnd={()=>this.addRoom()}style ={styles.cityView}>
                <Image style={styles.city} source={require("../images/city.png")}/>
              </Animatable.View>
              {/* User Image */}
              <Animatable.View animation={'fadeInLeft'} duration={7500} style={styles.characterLeftView}>
                <Image style={styles.characters} source={this.state.userImageSrc}/></Animatable.View>
              {/* Other User Image */}
              <Animatable.View animation={'fadeInRight'} duration={7500} style={styles.characterRightView}>
                <Image style={[styles.characters, { transform: [{rotateY: '180deg'}]}]} source={this.state.otherImageSrc}/>
              </Animatable.View>
            </View>
            <View style={{height: 80}}></View>
            {
              // Make sure the stories and images have loaded before displaying them.
             this.state.userStoryName.length > 6 && setTimeout(() => {console.log('done')}, 500) &&
             (
            <Animatable.View animation={'fadeIn'} duration={3000}>
            {/* User Story View */}
            <View>
              <Text style={{marginLeft: 5, marginRight: 10, fontWeight: 'bold'}}>You are: </Text>
              <Text style={{marginLeft: 5, marginRight: 10, marginBottom: 3}}> {this.state.userStory.name} </Text>
              <Text style={{marginLeft: 5, marginRight: 10, marginBottom: 3}}> {"Job: "+this.state.userStory.job}</Text>
              <Text style={{marginLeft: 5, marginRight: 10}}> {"Bio: "+this.state.userStory.bio}</Text>
            </View> 
            <View style={{height: 20}}></View>
            {/* Other User Story View */}
            <View>
            <Text style={{marginLeft: 5, marginRight: 10, fontWeight: 'bold'}}>They are: </Text>
              <Text style={{marginLeft: 5, marginRight: 10, marginBottom: 3}}> {this.state.otherUserStory.name} </Text>
              <Text style={{marginLeft: 5, marginRight: 10, marginBottom: 3}}> {"Job: "+this.state.otherUserStory.job}</Text>
              <Text style={{marginLeft: 5, marginRight: 10, marginBottom: 3}}> {"Bio: "+this.state.otherUserStory.bio}</Text>
            </View>
             {/* Start a conversation button */}
            <Button
              title="Start a conversation!"
              buttonStyle={{marginBottom: 20, alignSelf: 'center', justifyContent: 'center', backgroundColor: '#726DA8',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
              // Navigate to the room on press.
              onPress={() => {
                const replaceAction = StackActions.replace({
                  key: this.props.navigation.state.key,
                  routeName: 'MessagingRoom',
                  params: {roomNo: this.state.roomNo,userStory:this.state.userStory.name,otherUserStory: this.state.otherUserStory.name, userGender: this.state.userGender, otherGender: this.state.otherUserGender, otherUser: this.state.otherUser},
                  action: NavigationActions.navigate({ routeName: 'MessagingRoom' })
                })
               this.props.navigation.dispatch(replaceAction); }} /> 
             </Animatable.View> )
            || 
            // Display loading text while data is loading.
            <Animatable.View animation={'fadeOut'} duration={3000} style={{justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 18, alignSelf:'center', justifyContent: 'center'}}>Loading...</Text> </Animatable.View>}
          </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    characters: {
      height: SCREEN_HEIGHT/2.7,
      width: SCREEN_WIDTH/2.3
    },
    characterLeftView: {
      alignSelf: 'flex-start',
      width: SCREEN_WIDTH/5, 
      marginTop: 40, 
      marginLeft: SCREEN_WIDTH/41.4,
      height: SCREEN_HEIGHT/4, 
      backgroundColor: 'transparent'
    },
    characterRightView: {
      alignSelf: 'flex-end',
      width: SCREEN_WIDTH/5, 
      marginTop: 40, 
      marginLeft: SCREEN_WIDTH/3.18,
      height: SCREEN_HEIGHT/4, 
      backgroundColor: 'transparent'
    },
    city: {
      width:SCREEN_WIDTH/1.2,
      height: SCREEN_WIDTH/2.7,
      alignSelf: 'center'
    },
    cityView: {
      width: SCREEN_HEIGHT/4, 
      height: SCREEN_WIDTH/5, 
      position: 'absolute', 
      top: SCREEN_HEIGHT/9, 
      left: 92
    }
})