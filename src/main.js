import Vue from 'vue'
import App from './App.vue'
import CustomInput from './components/CustomInput'
import Prompt from './components/Prompt'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas, far)

Vue.config.productionTip = false
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('custom-input', CustomInput)
Vue.component('prompt', Prompt)

new Vue({
  render: h => h(App),
}).$mount('#app')
