import '../../apps/shared/gallery.css'

import * as Tq from '@tweeq/vue'
import {defineClientConfig} from '@vuepress/client'
import type {App} from 'vue'

import ComponentGallery from '../../apps/playground-vue/src/ComponentGallery.vue'
import ColorPaletteDemo from './ColorPaletteDemo.vue'
import DemoComponent from './DemoComponent.vue'
import ExampleContainer from './ExampleContainer.vue'
import PresentationThreePointLighting from './PresentationThreePointLighting.vue'
import RendererSwitch from './RendererSwitch.vue'
import UserTestDropShadow from './UserTestDropShadow.vue'
import UserTestSpring from './UserTestSpring.vue'
import UserTestThreePointLighting from './UserTestThreePointLighting.vue'
import UserTestTime from './UserTestTime.vue'

const registerComponents = (app: App) => {
	for (const [key, value] of Object.entries(Tq)) {
		if (typeof value === 'function') continue
		app.component(key, value)
	}

	app.component('DemoComponent', DemoComponent)
	app.component('ExampleContainer', ExampleContainer)
	app.component('UserTestThreePointLighting', UserTestThreePointLighting)
	app.component('UserTestSpring', UserTestSpring)
	app.component('UserTestTime', UserTestTime)
	app.component('UserTestDropShadow', UserTestDropShadow)
	app.component('PresentationThreePointLighting', PresentationThreePointLighting)
	app.component('ColorPaletteDemo', ColorPaletteDemo)
	app.component('ComponentGallery', ComponentGallery)
}

export default defineClientConfig({
	rootComponents: [RendererSwitch],
	enhance: ({app}) => {
		registerComponents(app)
	},
})
