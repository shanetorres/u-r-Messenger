// - LOADING.JS
// Caches all necessary images and navigates to main menu or sign up on completion.

import React from 'react';
import { Image, ActivityIndicator, View, ListItem } from 'react-native';
import { createStackNavigator, NavigationActions, StackActions } from 'react-navigation'
import * as firebase from 'firebase';
import {Updates, Asset} from 'expo'
import { firebaseApp } from '../config/firebaseconfig.js';

export default class Loading extends React.Component {

    static navigationOptions = ({navigation}) => ({
        headerLeft: null,
        header: null
    })

    constructor(props, context) {
        super(props, context);
    }
    async componentDidMount()
    {
        await Promise.all([
            this._loadImagesAsync()
        ])
        firebase.auth().onAuthStateChanged(
           user=>this.props.navigation.dispatch(NavigationActions.navigate(user ? {routeName: 'Tabs'} : {routeName: 'SignUp', params: {firstLogin: true}}))
        )
    }

    // LOAD ALL NECESSARY IMAGES.
    // Cache all images for quicker image loading later on.
    async _loadImagesAsync() {
        // Character Images
        Expo.Asset.fromModule(require("../characters/anita-p.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/ashton-h.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/barbara-w.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/bella-b.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/bobby-t.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/cara-j.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/danny-l.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/elina-r.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/ellie-g.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/emma-d.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/harry-h.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/jack-a.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/james-n.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/janet-p.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/jeremy-s.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/johnny-c.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/judy-w.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/leonard-h.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/leslie-h.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/molly-a.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/nick-g.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/peter-l.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/rachelle-c.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/ralph-s.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/robert-s.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/sally-w.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/sylvan-j.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/sylvia-s.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/walter-f.png")).downloadAsync();
        Expo.Asset.fromModule(require("../characters/william-w.png")).downloadAsync();

        // Other images
        Expo.Asset.fromModule(require("../images/homescreen.png")).downloadAsync();
        Expo.Asset.fromModule(require("../images/disconnect.png")).downloadAsync();
        Expo.Asset.fromModule(require("../images/active.png")).downloadAsync();
        Expo.Asset.fromModule(require("../images/city.png")).downloadAsync();
        Expo.Asset.fromModule(require("../images/logo.png")).downloadAsync();
        Expo.Asset.fromModule(require("../images/characters.png")).downloadAsync();
    }

    render() {
        return(
            <View style={{flex: 1,
                justifyContent: 'center',
                alignItems: 'center',}}>
                 <ActivityIndicator size="large" />     
            </View>
        )
    }
}