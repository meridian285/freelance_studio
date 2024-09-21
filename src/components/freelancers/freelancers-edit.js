import {HttpUtils} from "../../utils/http-utils";
import config from "../../config/config";
import {CommonUtils} from "../../utils/common-utils";

export class FreelancersEdit {
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

        if (result.error || !result.response && (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе фрилансера');
        }

        this.showFreelancer(result.response);
    }

    showFreelancer(freelancer) {
        if (freelancer.avatar) {
            document.getElementById('avatar').src = config.host + freelancer.avatar;
        }
        document.getElementById('level').innerHTML = CommonUtils.getLevelHtml(freelancer.level);

        document.getElementById('inputName').value = freelancer.name;
        document.getElementById('lastNameInput').value = freelancer.lastName;
        document.getElementById('emailInput').value = freelancer.email;
        document.getElementById('educationInput').value = freelancer.education;
        document.getElementById('locationInput').value = freelancer.location;
        document.getElementById('skillsInput').value = freelancer.skills;
        document.getElementById('infoInput').value = freelancer.info;

    }
}