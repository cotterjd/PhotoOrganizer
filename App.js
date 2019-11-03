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
, AsyncStorage
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
      albums: {},
      cursor: ''
    }

    getAlbums(this)
    console.log('state', this.state.albums)
  }

  showMenu = evt => this.setState({menuVisible: true})
  hideMenu = evt => this.setState({menuVisible: false})
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
      _storeData(this.state.albums)
    })
  }

  render() {
    const {state} = this
    //const {width, height} = require('Dimensions').get('window')
    return (
      <View style={styles.container}>
        <ScrollView style={{display: state.menuVisible ? 'none' : null}}
          scrollToEnd={evt => console.log('BAR')}
        >
          {Object.keys(this.state.albums).map(x => {
            return (<Button key={x} title={x} onPress={evt => evt} />)
          })}
          <Text>Uncategorized</Text>
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
          <Button onPress={this.hideMenu}
            title="&#x2715;"
          />
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

async function getAlbums(comp) {
  try {
    const albums = await _retrieveData()
    console.log('albums', albums)
    if (!!albums) {
      const fleshedAlbums = Object.keys(JSON.parse(albums)).reduce((a, x) => {
        if (x[0] === "_") return
        return {...a, [x]: JSON.parse(albums)[x]}
      }, {})
      console.log(fleshedAlbums)
      comp.setState({albums: fleshedAlbums})
    }
  } catch (e) {
    console.log("EEE", e)
  }
}
async function requestCameraRollPermission(comp) {
  try {
    const {status, expires, permissions} = await ExpoPermissions.askAsync(ExpoPermissions.CAMERA_ROLL)
    if (status === 'granted') {
      CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos'
      }).then(r => {
        console.log(r.edges[0])
        comp.setState({
          photos: r.edges
        , cursor: r.page_info.end_cursor
        })
      })
    } else alert('Camera Roll permissions required')
  } catch (e) {
    console.log('ERROR', e)
  }
}
async function _storeData(data) {
  try {
    await AsyncStorage.setItem('@Alibums:photo_albums', JSON.stringify(data));
  } catch (error) {
    console.log('ERROR', error)
  }
};
async function _retrieveData() {
  try {
    const value = await AsyncStorage.getItem(`@Alibums:photo_albums`);
    return value
  } catch (error) {
    console.log('ERROR', error)
    return null
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
