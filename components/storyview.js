// - STORYVIEW.JS
// Displays story information about both users in a given room, also holds options for disconnecting from or reporting the current other user.

import React from 'react';
import { Image, KeyboardAvoidingView, TextInput, Dimensions, Modal, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import * as Animatable from 'react-native-animatable'
import { NavigationActions,StackActions } from 'react-navigation';
import * as firebase from 'firebase';
import { firebaseApp } from '../config/firebaseconfig.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default class StoryView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentUser: null,
      username: '',
      userStory: [],
      otherUserStory: [],
      menuModalVisible: false,
      reportModalVisible: false,
      reportMessage: "",
      userTold: false,
      otherUserTold: false,
      newLearnUnread: false,
      otherUserName: '',
      userImageSrc: '',
      otherImageSrc: ''
    };
  }

  // Default navigation options
  static navigationOptions = ({navigation}) => ({
    // Concatenate the two user story names for the title of the page
    title: navigation.getParam('userStory','noUser').substr(0,navigation.getParam('userStory','noUser').indexOf(" "))
    +' & '+navigation.getParam('otherUserStory','noOther').substr(0,navigation.getParam('otherUserStory','noOser').indexOf(" ")),
    headerStyle: {
      backgroundColor: '#FFDD8E'
    },
    headerTitleStyle: {
      fontWeight: '600', 
      color: '#4A4A48'
    },
    headerLeft: 
      <Button 
      title=""
      buttonStyle={{backgroundColor: 'transparent'}}
      icon={{name: 'chevron-left', type: 'entypo', color:'#A2AAA6'}}
      // Navigate back to the messaging room if 
      onPress={() => navigation.navigate('MessagingRoom', {roomNo: navigation.getParam('roomNo','noroom'),otherUserStory:navigation.getParam('otherUserStory','noOther')})}/>
    
  })

  // USER REVEALS THEIR NEW LEARN.
  tellUser = () => {
    if(this.state.userTold == false) {
      // INITIALIZE CURRENT USER VALUES.
      const { currentUser } = firebase.auth();
      var username = currentUser.uid;

      this.setState({userTold:true})
      const roomNo =  this.props.navigation.getParam('roomNo','noRoom');
      var otherUser = this.state.otherUserName;
 
      // SET NEW LEARN DATABSE VALUES FOR BOTH USERS.
      firebase.database().ref("/users/"+username+"/rooms/"+roomNo+"/userTold").set(true)
      firebase.database().ref("/users/"+otherUser+"/rooms/"+roomNo+"/otherUserTold").set(true)
      firebase.database().ref("/users/"+otherUser+"/rooms/"+roomNo+"/newLearnUnread").set(true)
      firebase.database().ref("/users/"+otherUser+"/rooms/"+roomNo+"/unread").set(true)
      firebase.database().ref("/users/"+otherUser+"/rooms/"+roomNo+"/lastMessage").set("You learned something new")
    }
  }
 
  // USER DISCONNECTS FROM THE OTHER USER
  disconnect = () => {
    // INITIALIZE CURRENT USER VALUES.
    const { currentUser } = firebase.auth();
    let username = currentUser.uid
    this.setState({
      currentUser: currentUser,
      username: username
    })

    // Change the disconnected database value for the room node to true.
    let roomID = this.props.navigation.getParam('roomNo','noRoom')
    firebase.database().ref("/rooms/"+this.props.navigation.getParam('roomNo','noRoom')+"/disconnected").set(true)

    // Change the other user's room node disconnected value to true.
    let db = firebase.database();
    let ref = db.ref("/users/"+username+"/rooms/"+roomID)
    ref.once('value', function(snapshot) {
      firebase.database().ref("/users/"+snapshot.val().otherUser+"/rooms/"+roomID+"/disconnected").set(true);
    })

    // Delete the room from the current user node.
    let deleteRef = firebase.database().ref("/users/"+username+"/rooms/"+roomID);
        deleteRef.remove(function(error){
    })

    // Delete from rooms node, deletes all messages.
    deleteRef = firebase.database().ref("/rooms/"+roomID);
    deleteRef.remove(function(error){
    })

    // Navigate the user back to the main menu after disconnecting.
    const disconnectAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Tabs' }),],
    });
    this.props.navigation.dispatch(disconnectAction);
  }

  // USER REPORTS THE OTHER USER.
  report = (reportmessage) => {
    const { currentUser } = firebase.auth();
    let reportDate = new Date();
    let roomID = this.props.navigation.getParam('roomNo','noRoom')

    // Set the room as disconnected for other user.
    let db = firebase.database();
    let ref = db.ref("/users/"+currentUser.uid+"/rooms/"+roomID)
    ref.once('value', function(snapshot) {
      firebase.database().ref("/users/"+snapshot.val().otherUser+"/rooms/"+roomID+"/disconnected").set(true);
      firebase.database().ref("/rooms/"+roomID).on('value',function(snapshot){
        firebase.database().ref("/reports/"+ reportDate+"-"+currentUser.uid+"/messages/").set(snapshot.val())   
      })

      // Change the status for the room under the rooms node to reported.
      firebase.database().ref("/rooms/"+roomID+"/disconnected").set("reported")

      // Create a new database node for the report.
      firebase.database().ref("/reports/"+ reportDate+"-"+currentUser.uid+"/reportMessage").set(reportmessage)
      firebase.database().ref("/reports/"+ reportDate+"-"+currentUser.uid+"/roomNo").set(roomID)
      firebase.database().ref("/reports/"+ reportDate+"-"+currentUser.uid+"/reportedUser").set(snapshot.val().otherUser)
      firebase.database().ref("/reports/"+ reportDate+"-"+currentUser.uid+"/reporter").set(currentUser.uid)
    })
    
    // Delete the room from the user node. 
    let deleteRef = firebase.database().ref("/users/"+currentUser.uid+"/rooms/"+roomID);
          deleteRef.remove(function(error){})

    // Navigate back to the main menu.
    const disconnectAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Tabs' }),],
    });
    this.props.navigation.dispatch(disconnectAction);

  }

  componentDidMount() {
    // INITIALIZE CURRENT USER VALUES.
    const { currentUser } = firebase.auth()
    const userName = currentUser.uid;

    // INITIALIZE STORY PARAMETERS.
    const userstory = this.props.navigation.getParam('userStory','nouser');
    const otheruserstory = this.props.navigation.getParam('otherUserStory','noother');

    const roomNo =  this.props.navigation.getParam('roomNo','noRoom');
    

    firebase.database().ref("/users/"+userName+"/rooms/"+roomNo).once("value", function(room){

      // INITIALIZE CURRENT ROOM VALUES FROM THE ROOM DATABASE NODE.
      this.setState({
        otherUserName: this.props.navigation.getParam('otherUserName','there isnt one'),
        userTold: room.val().userTold,
        otherUserTold: room.val().otherUserTold,
        newLearnUnread: room.val().newLearnUnread
      })

      // DYNAMICALLY SETTING THE USER IMAGE.
      // At the time of writing, there doesn't seem to be a better way to dynamically set an image source.
      firebase.database().ref("/stories/"+room.val().userGender+"/"+userstory).once('value', function(usersnapshot) {
        this.setState({userStory: usersnapshot.val()}) 
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

      // DYNAMICALLY SETTING THE OTHER USER IMAGE.
      firebase.database().ref("/stories/"+room.val().otherUserGender+"/"+otheruserstory).once('value', function(othersnapshot) {
        this.setState({otherUserStory: othersnapshot.val()}) 
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
    }.bind(this))
  }

    render() {
      return (
        <ScrollView shouldRasterizeIOS={true} contentContainerStyle={{marginTop: 0}} style={{ flex: 1, backgroundColor: 'white'}}>
          {/*MenuModal*/}
          <Modal
            animationType="fade"
            transparent={false}
            visible={this.state.menuModalVisible}
          >
          {/*----------REPORT MODAL-------------*/}
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.reportModalVisible}>
              <ScrollView contentContainerStyle={{justifyContent:'center',alignItems: 'center' }} style={{flex:1}}>
                <KeyboardAvoidingView style={{marginTop: SCREEN_HEIGHT/3,alignItems:'center',justifyContent:'center',flex:1}}>
                  <Text>Please enter a reason for reporting:</Text>
                  {/* Report Description Input */}
                  <TextInput
                    style={[styles.textInput, {fontSize:17,marginVertical: 0, width: SCREEN_WIDTH/1.2}]}
                    minHeight={25}
                    multiline={true}
                    enablesReturnKeyAutomatically={true}
                    keyboardAppearance="dark"
                    placeholder=""
                    onChangeText={(reportMessage) => {this.setState({reportMessage})}}
                  />
                  {/* Report User Button */}
                  <Button
                    title="Report User"
                    buttonStyle={{backgroundColor: '#F4CBB7',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                    onPress={()=>{
                      this.setState({reportModalVisible: false}) 
                      setTimeout(function(){this.setState({menuModalVisible: false})}.bind(this), 500)
                      
                      setTimeout(function(){this.report(this.state.reportMessage)}.bind(this),520)
                    }}
                  />
                  {/* Cancel Button */}
                  <Button
                    title="Cancel"
                    buttonStyle={{backgroundColor: '#F4CBB7',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                    onPress={()=>{
                      this.setState({
                        reportModalVisible: false
                      })
                      this.setState({
                        menuModalVisible: true
                      })
                    }}
                  />
                </KeyboardAvoidingView>
              </ScrollView>
            </Modal>
            {/*----------END REPORT MODAL-------------*/}
            <ScrollView contentContainerStyle={{justifyContent:'center',alignItems: 'center' }} style={{flex:1}}>
              {/* Displays information about disconnecting and reportin */}
              <View style={{marginTop: 100, justifyContent:'center',height:100,backgroundColor:'transparent'}}>
                <Text style={{alignSelf:'center',textAlign:'center', justifyContent:'center', marginLeft: 10, marginRight:10}}>Choosing to disconnect will delete the connection from both users.</Text>
                <Text style={{alignSelf:'center',textAlign:'center', justifyContent:'center',marginTop: 10, marginLeft: 10, marginRight:10}}>If the user did something that you didn't like, please submit a report (this will also delete the connection). </Text>
              </View>
              <View style={{marginTop:SCREEN_HEIGHT/2,alignItems:'center',justifyContent:'center',flex:1}}>
                {/* Report User Button */}
                <Button
                  title="Report User"
                  buttonStyle={{backgroundColor: '#F4CBB7',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                  // When pressed, the Report Modal View becomes visible.
                  onPress={()=>{this.setState({reportModalVisible: true})}}
                />
                {/* Disconnect Button */}
                <Button
                  title="Disconnect From User"
                  buttonStyle={{backgroundColor: '#FF4C58',marginTop: 10, width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
                  onPress={()=>{this.disconnect();}}
                />
                {/* Cancel Button */}
                <Button
                  title="Cancel"
                  buttonStyle={{backgroundColor: '#2C80E0',marginTop: 10,width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20, marginBottom: 30}}
                  onPress={()=>{this.setState({menuModalVisible: !this.state.menuModalVisible})}}
                />            
              </View>
            </ScrollView>
          </Modal>
          {/* DISPLAY STORY IMAGES */}
          <View style={{ flexDirection: 'row' }}>
            {/* City Image */}
            <Animatable.View animation={'fadeInDown'} duration={1500} style ={{width: SCREEN_WIDTH/1.2, height: SCREEN_WIDTH/2.7, position: 'absolute', top: SCREEN_HEIGHT/9, marginLeft: SCREEN_WIDTH/10.35/*marginLeft: 40*/}}>
              <Image style={{width:SCREEN_WIDTH/1.2, height: SCREEN_WIDTH/2.7,alignSelf: 'center'}} source={require("../images/city.png")}/>
            </Animatable.View>
            {/* User Image */}
            <Animatable.View animation={'fadeInLeft'} duration={2000} style={{ alignSelf: 'flex-start', width: SCREEN_WIDTH/2.5, marginTop: 10, marginLeft: 20,height: SCREEN_HEIGHT/2.5, backgroundColor: 'transparent'}}>
              <Image style={{height:SCREEN_HEIGHT == 896 && SCREEN_HEIGHT / 2.7 || SCREEN_HEIGHT / 2.7, width: SCREEN_HEIGHT == 896 && SCREEN_WIDTH / 2.3 ||SCREEN_WIDTH/2.3}} source={this.state.userImageSrc}/></Animatable.View>
            {/* Other User Image */}
            <Animatable.View animation={'fadeInRight'} duration={2000} style={{ alignSelf: 'flex-end', width: SCREEN_WIDTH/2.5, marginTop: 10, marginLeft: 30,height: SCREEN_HEIGHT/2.5, backgroundColor: 'transparent'}}>
              <Image style={{ height:SCREEN_HEIGHT == 896 && SCREEN_HEIGHT / 2.7 || SCREEN_HEIGHT / 2.7, width: SCREEN_HEIGHT == 896 && SCREEN_WIDTH / 2.3 ||SCREEN_WIDTH/2.3, transform: [{rotateY: '180deg'}]}} source={this.state.otherImageSrc}/></Animatable.View>
          </View>
          {/* DISPLAY USER STORY INFORMATION */}
          <View>
            <Text style={{marginLeft: 5, marginRight: 10, fontWeight: 'bold'}}>You are: </Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {this.state.userStory.name} </Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {"Job: "+this.state.userStory.job}</Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {"Bio: "+this.state.userStory.bio}</Text>
            {/* Show new learn text if the current user has revealed it */}
            {this.state.userTold == true && <Animatable.View animation={"fadeIn"} duration={300} style={{marginTop:10}}><Text style={{color: "#C4AD46", marginLeft: 5, marginRight: 5}}>{"Learned: "+this.state.userStory.newLearn}</Text></Animatable.View>}
          </View>
          <View style={{height: 20}}></View>
          {/* DISPLAY OThER USER STORY INFORMATION */}
          <View>
          <Text style={{marginLeft: 5, marginRight: 10, fontWeight: 'bold'}}>They are: </Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {this.state.otherUserStory.name} </Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {"Job: "+this.state.otherUserStory.job}</Text>
            <Text style={{marginLeft: 5, marginRight: 10}}> {"Bio: "+this.state.otherUserStory.bio}</Text>
            {/* Show new learn text if the other user has revealed it */}
            {this.state.otherUserTold == true && <Animatable.View animation={"fadeIn"} duration={300} style={{marginTop:10}}><Text style={{color: "#C4AD46", marginLeft: 5, marginRight: 5}}>{"Learned: "+this.state.otherUserStory.newLearn}</Text></Animatable.View>}
          </View>
          {/* Reveal new learn button */}
          <Button 
             title="Reveal"
             buttonStyle={{backgroundColor: '#AF3A9C',marginTop: 30, marginBottom: 10, alignSelf:'center',width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
             onPress={() => this.tellUser()}
             />
          {/* Disconnect Button */}
          <Button
            title="Disconnect from this person"
            buttonStyle={{backgroundColor:"#FF4C58",marginTop: 0, marginBottom: 30, alignSelf:'center',width: SCREEN_WIDTH/1.2, height:40, borderRadius: 20}}
            onPress={() => {
              this.setState({menuModalVisible: !this.state.menuModalVisible})
            }}
          />
        </ScrollView>
      );
    }
  }

  const styles = StyleSheet.create({
    textInput: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      width: 100,
      backgroundColor: '#F0F0F0',
      borderStyle: 'solid',
      overflow: 'hidden',
      marginTop: 5,
      marginBottom: 5,
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 25,
    },
  })