import {createPinia} from 'pinia'
import {createApp} from 'vue'

import PlaygroundApp from './PlaygroundApp.vue'

createApp(PlaygroundApp).use(createPinia()).mount('#app')
