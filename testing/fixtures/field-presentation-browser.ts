import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { createUiApplication } from '@uninterface/uninterface/setup'
import Fixture from './FieldPresentation.vue'

const app = createUiApplication(Fixture)
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
