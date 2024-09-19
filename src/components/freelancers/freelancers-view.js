import {HttpUtils} from "../../utils/http-utils";
import config from "../../config/config";

export class FreelancersView {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        this.getFreelancer(id).then();
    }

    async getFreelancer(id) {
        const result = await HttpUtils.request('/freelancers/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        // const result = await response.json();
        if (result.error || !result.response && (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при запросе фрилансера');
        }


        this.showFreelancer(result.response);
    }

    showFreelancer(freelancer) {
        if (freelancer.avatar) {
            document.getElementById('avatar').src = config.host + freelancer.avatar;
        }

        document.getElementById('name').innerText = freelancer.name + ' ' + freelancer.lastName;
        document.getElementById('email').innerText = freelancer.email;
        document.getElementById('email').innerText = freelancer.email;

    }
}