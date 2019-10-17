import React, { Component } from 'react';
import {
  Platform
, StyleSheet
, Text
, View
, CameraRoll
, ScrollView
, TouchableHighlight
, Image
, TextInput
, Button
} from 'react-native';
import * as ExpoPermissions from 'expo-permissions'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

export default class App extends Component {
  constructor() {
    super()
    requestCameraRollPermission(this)
    this.state = {
      photos: [],
      menuVisible: false,
      newAlbumName: '',
      albums: getAlbums() || {}
    }
  }

  showMenu = evt => this.setState({menuVisible: true})
  setNewAlbumName = value => this.setState({newAlbumName: value})
  createAlbum = evt => {
    const name = this.state.newAlbumName
    if (!name) return

    this.setState(s => ({
      albums: {
        ...s.albums
      , [name]: []
      }
    }), () => {
      storeData(`photo_albums`, this.state.albums)
    })
  }

  render() {
    const {state} = this
    //const {width, height} = require('Dimensions').get('window')
    return (
      <View style={styles.container}>
        <ScrollView style={{display: state.menuVisible ? 'none' : null}}>
          {this.state.photos.map((p, i) => {
            return (
              <TouchableHighlight
                  onPress={this.showMenu}
                  key={i}
              >
                <Image
                  style={{
                    width: 300,
                    height: 300,
                    margin: 5,
                  }}
                  source={{ uri: p.node.image.uri }}
                />
              </TouchableHighlight>
            );
          })}
        </ScrollView>
        <View style={{display: state.menuVisible ? null : 'none'}}>
          {Object.keys(this.state.albums).map(x => {
            return (<Text>{x}</Text>)
          })}
          <TextInput onChangeText={this.setNewAlbumName}/>
          <Button
            onPress={this.createAlbum}
            title="Create Album"
          />
        </View>
      </View>
    );
  }
}

function getAlbums() {
  try {
    return AsyncStorage.getItem('photo_albums')
  } catch (e) {
    storeData('photo_albums', {})
  }
}
async function requestCameraRollPermission(comp) {
  try {
    const {status, expires, permissions} = await ExpoPermissions.askAsync(ExpoPermissions.CAMERA_ROLL)
    if (status === 'granted') {
      CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos'
      }).then(r => comp.setState({photos: r.edges}))
    } else alert('Camera Roll permissions required')
  } catch (e) {
    console.log(e)
  }
}
async function storeData(key, value) {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    console.log(e.message || e)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
