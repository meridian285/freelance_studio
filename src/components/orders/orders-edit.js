import {FileUtils} from "../../utils/file-utils";
import {HttpUtils} from "../../utils/http-utils";
import config from "../../config/config";
import {CommonUtils} from "../../utils/common-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class OrdersEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('updateButton').addEventListener('click', this.updateOrder.bind(this));

        this.scheduledDate = null;
        this.completeDate = null;
        this.deadlineDate = null;

        this.freelancersSelectElement = document.getElementById('freelancerSelect');
        this.statusSelectElement = document.getElementById('statusSelect');
        this.descriptionInputElement = document.getElementById('descriptionInput');
        this.amountInputElement = document.getElementById('amountInput');
        this.scheduledCardElement = document.getElementById('scheduled-card');
        this.completeCardElement = document.getElementById('complete-card');
        this.deadlineCardElement = document.getElementById('deadline-card');

        this.validations = [
            {element: this.descriptionInputElement},
            {element: this.amountInputElement},
        ];

        this.init(id).then();
    }

    async init(id) {
        const orderData = await this.getOrder(id);
        if (orderData) {
            this.showOrder(orderData);
            if (orderData.freelancer) {
                await this.getFreelancers(orderData.freelancer.id);
            }
        }
    }

    async getOrder(id) {
        const result = await HttpUtils.request('/orders/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response && (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе фрилансера');
        }

        this.orderrOriginalData = result.response;

        return result.response;
    }

    async getFreelancers(currentFreelancerId) {
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
            if (currentFreelancerId === freelancers[i].id) {
                option.selected = true;
            }
            this.freelancersSelectElement.appendChild(option);
        }

        $(this.freelancersSelectElement).select2({
            theme: 'bootstrap4'
        });
    }

    showOrder(order) {
        const breadcrumbsElement = document.getElementById('breadcrumbs-order');
        breadcrumbsElement.href = '/orders/view?id=' + order.id;
        breadcrumbsElement.innerText = order.number;

        this.amountInputElement.value = order.amount;
        this.descriptionInputElement.value = order.description;
        for (let i = 0; i < this.statusSelectElement.options.length; i++) {
            if (this.statusSelectElement.options[i].value === order.status)
                this.statusSelectElement.selectedIndex = i;
        }

        const calendarScheduled = $('#calendar-scheduled');
        // The Calender
        calendarScheduled.datetimepicker({
            locale: 'ru',
            inline: true,
            icons: {
                time: 'far fa-clock',
            },
            useCurrent: false,
            date: order.scheduledDate,
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
            date: order.completeDate,
        });
        calendarComplete.on("change.datetimepicker", (e) => {

            if (e.date) {
                this.completeDate = e.date;
            } else if (this.orderrOriginalData.completeDate) {
                this.completeDate = false;
            } else {
                this.completeDate = null;
            }

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
            date: order.deadlineDate,
        });
        calendarDeadline.on("change.datetimepicker", (e) => {
            this.deadlineDate = e.date;
        });

    }

    async updateOrder(e) {
        e.preventDefault();

        if (ValidationUtils.validateForm(this.validations)) {
            const changedData = {};
            if (parseInt(this.amountInputElement.value) !== parseInt(this.orderrOriginalData.amount)) {
                changedData.amount = parseInt(this.amountInputElement.value);
            }
            if (this.descriptionInputElement.value !== this.orderrOriginalData.description) {
                changedData.description = this.descriptionInputElement.value;
            }
            if (this.statusSelectElement.value !== this.orderrOriginalData.status) {
                changedData.status = this.statusSelectElement.value;
            }
            if (this.freelancersSelectElement.value !== this.orderrOriginalData.freelancer.id) {
                changedData.freelancer = this.freelancersSelectElement.value;
            }

            if (this.completeDate || this.completeDate === false) {
                changedData.completeDate = this.completeDate ? this.completeDate.toISOString() : null;
            }


            if (this.deadlineDate) {
                changedData.deadlineDate = this.deadlineDate.toISOString();
            }
            if (this.scheduledDate) {
                changedData.scheduledDate = this.scheduledDate.toISOString();
            }

            if (Object.keys(changedData).length > 0) {
                const result = await HttpUtils.request('/orders/' + this.orderrOriginalData.id, 'PUT', true, changedData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response && (result.response && result.response.error)) {
                    return alert('Возникла ошибка при редактировании заказа.Обратитесь в поддержку');
                }
                return this.openNewRoute('/orders/view?id=' + this.orderrOriginalData.id);
            }
        }
    }
}