// - MESSAGINGROOM.JS
// Handles all new message and conversation history logic and allows for navigation to the story view.

import React from 'react';
import { Image, Animated, TextInput, Dimensions, Keyboard, FlatList, KeyboardAvoidingView, Alert, StyleSheet, Text, View, ListItem } from 'react-native';
import { Button } from 'react-native-elements';
import { Bubble } from 'nachos-ui';
import { SafeAreaView} from 'react-navigation'
import * as Animatable from 'react-native-animatable'
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class MessagingRoom extends React.Component {
    // Bind functions to component and initialize state variables.
    constructor(props,context) {
      super(props,context);
      this.onPressSendButton = this.onPressSendButton.bind(this)
      this.addMessage = this.addMessage.bind(this)
      this.state = {
        animatedValue: new Animated.Value(0),
        messageTotal: 0,
        currentUser: null,
        message: "",
        textValue: "",
        totalmessages: [],
        messages: [],
        roomname: "",
        noOfMessages: 0,
        userMessage:true,
        otherUserName: "",
        day: "",
        weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        height: 35,
        viewHeight: 0,
        disconnected: false,
        newLearnUnread: false,
        otherUserToken: null,
        userStory: ' ',
        otherImageSrc: ''
      };
    }

    // SEND THE USER A NEW MESSAGE NOTIFICATION.
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
            'body': 'New message'
          })
        })
      }
    }

    // DEFAULT NAVIGATION SETTINGS.
    static navigationOptions = ({navigation}) => ({
      title: navigation.getParam('otherUserStory', 'nostory'),
      headerStyle: {
        backgroundColor: '#FFDD8E'
      },
      headerTitleStyle: {
        fontWeight: '600',
        color: "#4A4A48"
      },
      // Story view button
      headerRight: (
        <Button
        title=""
        buttonStyle={{backgroundColor: 'transparent'}}
        icon={{name: 'users', type:'entypo', color:'#A2AAA6'}}
        onPress={() => {
          const { currentUser } = firebase.auth()
          var username = currentUser.uid;
          if (navigation.getParam('newLearn',false) == true) { firebase.database().ref('/users/'+username+"/rooms/"+navigation.getParam('roomNo','noNo')+"/newLearnUnread").set(false) }
          navigation.navigate('StoryView', 
        {roomNo: navigation.getParam('roomNo','noNo'), userStory:navigation.getParam('userStory','noUser'), otherUserStory:navigation.getParam('otherUserStory','noOther'), otherUserName: navigation.getParam('otherUser','noOtherUser')})}}
        />
      ),
    });
  
    // SET THE MESSAGE INPUT VALUE TO AN EMPTY STRING AFTER PRESSING SEND AND CALL ADD MESSAGE.
    onPressSendButton = () => {
      let message = this.state.message;
      this.state.message = "";
      this.addMessage(message);
      }
    
    componentDidMount() {
      // Initialize date for the timestamp logic.
      this.state.day = new Date().setHours(0,0,0,0);

      // Initialize variables for the current user.
      const { currentUser } = firebase.auth()
      this.setState({ currentUser });
      var username = currentUser.uid;

      const { navigation } = this.props;

      // DYNAMICALLY SETTING THE USER IMAGE.
      // At the time of writing, there doesn't seem to be a better way to dynamically set an image source.
      switch(navigation.getParam('otherUserStory', 'nostory')) {
        case 'Anita Purcell':
          this.setState({otherImageSrc: require('../characters/anita-p.png')})
          break;
        case 'Ashton Haggerty':
          this.setState({otherImageSrc: require('../characters/ashton-h.png')})
          break;
        case 'Barbara Watson':
          this.setState({otherImageSrc: require('../characters/barbara-w.png')})
          break;
        case 'Bella Brooks':
          this.setState({otherImageSrc: require('../characters/bella-b.png')})
          break;
        case 'Bobby Taylor':
          this.setState({otherImageSrc: require('../characters/bobby-t.png')})
          break;
        case 'Cara Johansson':
          this.setState({otherImageSrc: require('../characters/cara-j.png')})
          break;
        case 'Danny Lewis':
          this.setState({otherImageSrc: require('../characters/danny-l.png')})
          break;
        case 'Elina Ramirez':
          this.setState({otherImageSrc: require('../characters/elina-r.png')})
          break;
        case 'Ellie Gray':
          this.setState({otherImageSrc: require('../characters/ellie-g.png')})
          break;
        case 'Emma Davis':
          this.setState({otherImageSrc: require('../characters/emma-d.png')})
          break;
        case 'Harry Harris':
          this.setState({otherImageSrc: require('../characters/harry-h.png')})
          break;
        case 'Jack Andrews':
          this.setState({otherImageSrc: require('../characters/jack-a.png')})
          break;
        case 'James Newfeld':
          this.setState({otherImageSrc: require('../characters/james-n.png')})
          break;
        case 'Janet Parkland':
          this.setState({otherImageSrc: require('../characters/janet-p.png')})
          break;
        case 'Jeremy Scott':
          this.setState({otherImageSrc: require('../characters/jeremy-s.png')})
          break;
        case 'Johnny Carter':
          this.setState({otherImageSrc: require('../characters/johnny-c.png')})
          break;
        case 'Judy Wallace':
          this.setState({otherImageSrc: require('../characters/judy-w.png')})
          break;
        case 'Leonard Hanson':
          this.setState({otherImageSrc: require('../characters/leonard-h.png')})
          break;
        case 'Leslie Hartfield':
          this.setState({otherImageSrc: require('../characters/leslie-h.png')})
          break;
        case 'Molly Anders':
          this.setState({otherImageSrc: require('../characters/molly-a.png')})
          break;
        case 'Nick Griffith':
          this.setState({otherImageSrc: require('../characters/nick-g.png')})
          break;
        case 'Peter Lattimore':
          this.setState({otherImageSrc: require('../characters/peter-l.png')})
          break;
        case 'Rachelle Conlin':
          this.setState({otherImageSrc: require('../characters/rachelle-c.png')})
          break;
        case 'Ralph Schmidt':
          this.setState({otherImageSrc: require('../characters/ralph-s.png')})
          break;
        case 'Robert Schwartz':
          this.setState({otherImageSrc: require('../characters/robert-s.png')})
          break;
        case 'Sally Wickham':
          this.setState({otherImageSrc: require('../characters/sally-w.png')})
          break;
        case 'Sylvan Jacobs':
          this.setState({otherImageSrc: require('../characters/sylvan-j.png')})
          break;
        case 'Sylvia Stanton':
          this.setState({otherImageSrc: require('../characters/sylvia-s.png')})
          break;
        case 'Walter Francis':
          this.setState({otherImageSrc: require('../characters/walter-f.png')})
          break;
        case 'William Winston':
          this.setState({otherImageSrc: require('../characters/william-w.png')})
          break;
      }

      // Retrieve the value of new learn for the room.
      firebase.database().ref('/users/'+username+'/rooms/'+navigation.getParam('roomNo','noNo')+'/newLearnUnread/').once('value', function(newLearn){
        this.setState({newLearnUnread: newLearn.val()})
      }.bind(this))

      const roomNo = navigation.getParam('roomNo','noNo');
      let db = firebase.database(); 
      let ref = db.ref("/rooms/"+roomNo+"/messages");
      let childData = [];
      
      // Retrieve the value of disconnected for the room.
      firebase.database().ref("/rooms/"+roomNo+"/disconnected").once('value', function(disconnect) {
        this.state.disconnected = disconnect.val()
      }.bind(this))

      ref.on('value', function(snapshot) {
        // Get and set the total number of messages for the room.
        let noOfMessages= snapshot.numChildren();
        this.setState({
          messageTotal: noOfMessages
        })
        
        //Get all messages from the room database node.
        childData = [];
        snapshot.forEach(function (childSnapshot){
          childData.push(childSnapshot.val())
        });

        // Populate the messages array with the reverse of the childData array, so that the chat room can grow from bottom to top.
        this.setState({
          messages: childData.reverse()
        })  
       }.bind(this));
    }
  
    // ADD NEW MESSAGES TO THE DATABASE 
    addMessage(messageText) {
      // GET THE CURRENT USER.
      const { currentUser } = firebase.auth()
      this.setState({ currentUser });
      var username = this.state.currentUser.uid;

      // INITIALIZE VARIABLES.
      const message = messageText;
      const { navigation } = this.props;
      const roomNo = navigation.getParam('roomNo','noNo');
      const display = navigation.getParam('display', 'nodisplay');
      this.setState({
          roomname: roomNo,
      });

      // Add the new message to the database.
      firebase.database().ref("/rooms/"+roomNo+'/messages/').push().set({
        contents: messageText,
        sender: this.state.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        index: this.state.messageTotal
      });

      // GET THE OTHER USER'S NAME.
      otheruserRef = firebase.database().ref("users/"+username+"/rooms/"+roomNo+"/")
      var otherUser = "";
      otheruserRef.once('value', function(snapshot) {
      otherUser = snapshot.val().otherUser;
      this.setState({
       otherUserName: otherUser,
       userStory: snapshot.val().userStory
      })
      // Get the other user's token for notification sending.
      firebase.database().ref('/users/'+snapshot.val().otherUser+"/settings/token").once('value', function(tokenSnapshot) {
        this.setState({
          otherUserToken: tokenSnapshot.val()
        })
        this.sendNotification(tokenSnapshot.val())
        }.bind(this))
      }.bind(this))
  
      // Update the room nodes for the current user and the other user with important information.
      firebase.database().ref("/users/"+username+'/rooms/'+roomNo+"/lastMessage").set(message);
      firebase.database().ref("/users/"+username+'/rooms/'+roomNo+"/unread").set(false);
      firebase.database().ref("/users/"+username+'/rooms/'+roomNo+"/timestamp").set(firebase.database.ServerValue.TIMESTAMP);
      firebase.database().ref("/users/"+otherUser+'/rooms/'+roomNo+"/lastMessage").set(message);
      firebase.database().ref("/users/"+otherUser+'/rooms/'+roomNo+"/unread").set(true);
      firebase.database().ref("/users/"+otherUser+'/rooms/'+roomNo+"/timestamp").set(firebase.database.ServerValue.TIMESTAMP);
      firebase.database().ref("/users/"+otherUser+'/rooms/'+roomNo+"/visible").set(true);
    }

    _renderItem = ({item, index}) => (
      <TextBubble 
        contents={item.contents}
        timestamp={item.timestamp}
        sender={item.sender}
        index={item.index}
        messages={this.state.messages}
        currentUser={this.state.currentUser}
        day={this.state.day}
        weekdays={this.state.weekdays}
        messageTotal={this.state.messageTotal}
        user={this.currentUser}
      />
    );
    _keyExtractor = (item,index) => JSON.stringify(item.timestamp);
    render() {
      return ( 
        <KeyboardAvoidingView style={styles.container} 
        behavior="padding"
        keyboardVerticalOffset={64}
        shouldRasterizeIOS={true}>
        <SafeAreaView style={{flex:1, backgroundColor: 'transparent'}}>
        {/*This button is only shown if the other user has revealed something new about themselves.*/}
        {this.state.newLearnUnread == true && <Button buttonStyle={{backgroundColor: '#B185A7', width: SCREEN_WIDTH, borderRadius: 0}} 
          title={"You learned something new about "+this.props.navigation.getParam('otherUserStory','noOther').substr(0,this.props.navigation.getParam('otherUserStory','noOser').indexOf(" "))}
          onPress={() => {
            const { currentUser } = firebase.auth()
            var username = currentUser.uid;
            firebase.database().ref('/users/'+username+"/rooms/"+this.props.navigation.getParam('roomNo','noNo')+"/newLearnUnread").set(false) 
            this.props.navigation.navigate('StoryView', 
            {roomNo: this.props.navigation.getParam('roomNo','noNo'), userStory:this.props.navigation.getParam('userStory','noUser'), otherUserStory: this.props.navigation.getParam('otherUserStory','noOther'), otherUserName: this.props.navigation.getParam('otherUser','noOtherUser')})}
          }
          />
        }
        <View style={styles.inputContainer} animation={"slideInUp"} duration={300}> 
          <FlatList
            ListFooterComponent={
              <Animatable.View animation="fadeIn" duration={1000} style={{marginTop: 20,alignSelf:"center"}}>
              <Image source= {this.state.otherImageSrc} style={{marginBottom: 10,alignSelf:'center',width: 150,height:175,backgroundColor:'transparent'}}></Image>
              <Text style={{marginBottom: 10}}>{"You met "+this.props.navigation.getParam('otherUserStory', 'nostory')}</Text>
              </Animatable.View>
            }
            windowSize={2}
            data={this.state.messages}
            ref={(ref) => this.flatList = ref}
            inverted
            onLayout={() => this.flatList.scrollToOffset({x:100,y:300,animated: true})}
            keyExtractor = {this._keyExtractor}
            renderItem={this._renderItem}
          />
        </View>
        <View style={{flex: 0,flexDirection: 'row',width: SCREEN_WIDTH-10, justifyContent: 'space-between', backgroundColor: 'transparent'}}>
          {/*Message Input View*/}
          <View 
            minHeight={45}
            style={{flex:5, backgroundColor: 'transparent'}}>
            <TextInput
              style={[styles.textInput, {fontSize:17, width: SCREEN_WIDTH/1.294, marginLeft: 10}]}
              minHeight={35}
              multiline={true}
              enablesReturnKeyAutomatically={true}
              keyboardAppearance="dark"
              placeholder=""      
              onChangeText={(message) => {this.setState({message})}}
              value={this.state.message}
            />
          </View>
          {/*Send Button View*/}
          <View style={{bottom:0,flex: 1,backgroundColor:'transparent', alignItems:'center', justifyContent:'flex-end'}}>
            minHeight={45}
          <Button
            buttonStyle={{width: 35, borderRadius: 25, alignSelf:'center', paddingVertical: 5, marginBottom:5, backgroundColor: "#EAB844"}}
            icon={{name: 'arrow-up', type: 'feather', color:'white'}}
            onPress={()=>{this.onPressSendButton()}} 
            title=""/> 
          </View>
      </View>  
      </SafeAreaView>
      </KeyboardAvoidingView>  
      );
    }
  }

  const messageBubbleColor = {
    userMessage: "#7DCD85",
    notUser: "lightgrey"
  }

  const styles = StyleSheet.create({
    container: {
      flex: 5,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    },
    inputContainer: {
      flex: 1,
      width: SCREEN_WIDTH-10
    },
    userBubbleStyle: {
      alignSelf: 'flex-end', marginTop: 8, maxWidth: 280, 
    },
    otherBubbleStyle: {
      alignSelf: 'flex-start', marginTop: 8, maxWidth: 280,
    },
    userText: {
      alignSelf: 'center', fontSize: 10, marginTop: 8, color: 'grey',justifyContent: 'center',
    },
    otherText: {
      alignSelf: 'center', fontSize: 10, marginTop: 8, color: 'grey',justifyContent: 'center',
    },
    textInput: {
      alignSelf: 'flex-start',
      justifyContent: 'space-between',
      marginBottom:SCREEN_HEIGHT == 896 && 0 || 5,
      marginTop:SCREEN_HEIGHT == 896 && 10 || 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
      backgroundColor: '#F0F0F0',
      borderStyle: 'solid',
      marginLeft: -4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 25,
    },
  });
  
  
  class TextBubble extends React.PureComponent {
    constructor(props,context) {
      super(props,context);
    }
      render() {
        return (
          <View>
              {/*A mess of conditional render statements that determine what kind of timestamp is displayed.*/}
               {
                 //message was sent today                                           //since array is reversed, this is total messages minus the render index, giving the latest message at the beginning of the array   // if last message was sent more than 1 hour ago
                 (this.props.timestamp > this.props.day && this.props.index > 0 && this.props.messages[(this.props.messages.length-1)-this.props.index].timestamp -this.props.messages[(this.props.messages.length-1)-(this.props.index-1)].timestamp > 3600000)
                  && <Text style={styles.userText}>{"Today, "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                 //message was sent yesterday                                                 1 day                                          if last message was sent more than 1 hour ago
                  || (this.props.timestamp < this.props.day && this.props.timestamp > this.props.day - 86400000 && this.props.index > 0 && this.props.messages[(this.props.messages.length-1)-this.props.index].timestamp-this.props.messages[(this.props.messages.length-1)-(this.props.index-1)].timestamp > 3600000) 
                  && <Text style={styles.userText}>{"Yesterday, "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //message was sent a day of the week before yesterday                             6 days                                   if last message was sent more than 1 hour ago
                  || (this.props.timestamp < this.props.day && this.props.timestamp > this.props.day - 518400000 && this.props.index > 0 && this.props.messages[(this.props.messages.length-1)-this.props.index].timestamp-this.props.messages[(this.props.messages.length-1)-(this.props.index-1)].timestamp > 3600000) 
                  && <Text style={styles.userText}>{this.props.weekdays[new Date(this.props.timestamp).getDay()]+", "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //message was sent any other day                 if last message was sent more than 1 hour ago
                  || (this.props.timestamp < this.props.day && this.props.timestamp < this.props.day - 518400000 && this.props.index > 0 && this.props.messages[(this.props.messages.length-1)-this.props.index].timestamp-this.props.messages[(this.props.messages.length-1)-(this.props.index-1)].timestamp > 3600000) && 
                  <Text style={styles.userText}>{new Date(this.props.timestamp).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //the first message sent in the room

                  //room created today
                  || (this.props.index == 0 && this.props.timestamp > this.props.day) && <Text style={styles.userText}>{"Today, "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //room created yesterday
                  || (this.props.index == 0 && this.props.timestamp < this.props.day && this.props.timestamp > this.props.day - 86400000) 
                  && <Text style={styles.userText}>{"Yesterday, "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //room created earlier in the week
                  || (this.props.index == 0 && this.props.timestamp < this.props.day && this.props.timestamp > this.props.day - 518400000) 
                  && <Text style={styles.userText}>{this.props.weekdays[new Date(this.props.timestamp).getDay()]+", "+new Date(this.props.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  //room created more than a week ago
                  || (this.props.index == 0 && <Text style={styles.userText}>{new Date(this.props.timestamp).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'})}</Text>)
               }
               
              <Bubble arrowPosition='none'
                // The style and color of the text bubble is determined by who the sender is.
                style={[(this.props.sender == this.props.currentUser.uid && styles.userBubbleStyle) || styles.otherBubbleStyle]} 
                color={[(this.props.sender == this.props.currentUser.uid && messageBubbleColor.userMessage) || messageBubbleColor.notUser]}>{this.props.contents}</Bubble>
             </View>
        )
      }
  }
   