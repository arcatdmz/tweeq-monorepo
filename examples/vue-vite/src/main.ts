import '@tweeq/vue/style.css'

import {createPinia} from 'pinia'
import {createApp} from 'vue'

import ExampleApp from './ExampleApp.vue'

createApp(ExampleApp).use(createPinia()).mount('#app')
