/**
 * @format
 */

// Must be imported before anything else
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import App from './src/App';

// Use a simple name without hyphens for Android compatibility
AppRegistry.registerComponent('mnemosfrontend', () => App);

