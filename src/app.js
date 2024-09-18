import './styles/styles.scss'
import {Router} from "./router";

export class App {
    constructor() {
        new Router()
    }
}

(new App());