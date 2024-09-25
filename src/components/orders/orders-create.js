import {HttpUtils} from "../../utils/http-utils";
import {FileUtils} from "../../utils/file-utils";

export class OrdersCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        document.getElementById('saveButton').addEventListener('click', this.saveOrder.bind(this));

        this.scheduledDate = null;
        this.completeDate = null;
        this.deadlineDate = null;


        const calendarScheduled = $('#calendar-scheduled');
        // The Calender
        calendarScheduled.datetimepicker({
            locale: 'ru',
            inline: true,
            icons: {
                time: 'far fa-clock',
            },
            useCurrent: false,
        });
        calendarScheduled.on("change.datetimepicker", (e) => {
            this.scheduledDate = e.date;
        });

        // The Calender
        const calendarComplete = $('#calendar-complete');
        calendarComplete.datetimepicker({
            locale: 'ru',
            inline: true,
            icons: {
                time: 'far fa-clock',
            },
            buttons: {
                showClear: true,
            },
            useCurrent: false,
        });
        calendarComplete.on("change.datetimepicker", (e) => {
            this.completeDate = e.date;
        });

        // The Calender
        const calendarDeadline = $('#calendar-deadline');
        calendarDeadline.datetimepicker({
            locale: 'ru',
            inline: true,
            icons: {
                time: 'far fa-clock',
            },
            useCurrent: false,
        });
        calendarDeadline.on("change.datetimepicker", (e) => {
            this.deadlineDate = e.date;
        });

        this.freelancersSelectElement = document.getElementById('freelancerSelect');
        this.statusSelectElement = document.getElementById('statusSelect');
        this.descriptionInputElement = document.getElementById('descriptionInput');
        this.amountInputElement = document.getElementById('amountInput');
        this.scheduledCardElement = document.getElementById('scheduled-card');
        this.completeCardElement = document.getElementById('complete-card');
        this.deadlineCardElement = document.getElementById('deadline-card');

        this.getFreelancers().then();
    }

    async getFreelancers() {
        const result = await HttpUtils.request('/freelancers');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        // const result = await response.json();
        if (result.error || !result.response && (result.response && (result.response.error || !result.response.freelancers))) {
            return alert('Возникла ошибка при запросе фрилансеров');
        }

        const freelancers = result.response.freelancers;
        for (let i = 0; i < freelancers.length; i++) {
            const option = document.createElement('option');
            option.value = freelancers[i].id;
            option.innerText = freelancers[i].name + ' ' + freelancers[i].lastName;
            this.freelancersSelectElement.appendChild(option);
        }

        $(this.freelancersSelectElement).select2({
            theme: 'bootstrap4'
        });
    }

    async saveOrder(e) {
        e.preventDefault();


        if (this.validateForm()) {
            const createData = {
                description: this.descriptionInputElement.value,
                deadlineDate: this.deadlineDate.toISOString(),
                scheduledDate: this.scheduledDate.toISOString(),
                freelancer: this.freelancersSelectElement.value,
                status: this.statusSelectElement.value,
                amount: parseInt(this.amountInputElement.value),
            }

            if (this.completeDate) {
                createData.completeDate = this.completeDate.toISOString();
            }

            const result = await HttpUtils.request('/orders', 'POST', true, createData);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response && (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при добавлении заказа.Обратитесь в поддержку');
            }

            return this.openNewRoute('/orders/view?id=' + result.response.id);
        }
    }

    validateForm() {
        let isValid = true;

        let textInputArray = [this.descriptionInputElement, this.amountInputElement];

        for (let i = 0; i < textInputArray.length; i++) {
            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.scheduledDate) {
            this.scheduledCardElement.classList.remove('is-invalid');
        } else {
            this.scheduledCardElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.deadlineDate) {
            this.deadlineCardElement.classList.remove('is-invalid');
        } else {
            this.deadlineCardElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }
}