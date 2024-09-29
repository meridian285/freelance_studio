import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class Signup {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (localStorage.getItem('accessToken')) {
            return this.openNewRoute('/');
        }

        this.nameElement = document.getElementById('name');
        this.lastNamelElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.agreeMeElement = document.getElementById('agree');
        this.commonErrorElement = document.getElementById('common-error');

        this.validations = [
            {element: this.nameElement},
            {element: this.lastNamelElement},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement, options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, options: {compareTo: this.passwordElement.value}},
            {element: this.agreeMeElement, options: {checked: true}},
        ]

        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this))
    }

    async signUp() {
        this.commonErrorElement.style.display = 'none';
        for (let i = 0; i < this.validations.length; i++) {
            if (this.validations[i].element === this.passwordRepeatElement) {
                this.validations[i].options.compareTo = this.passwordElement.value;
            }
        }

        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request('/signup', 'POST', false, {
                name: this.nameElement.value,
                lastName: this.lastNamelElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
            })

            // const result = await response.json();
            if (result.error || !result.response && (result.response.accessToken && (!result.response.refreshToken || !result.response.id | !result.response.name))) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(result.response.accessToken, result.response.refreshToken, {id: result.response.id, name: result.response.name})

            await this.openNewRoute('/');
        }
    }
}