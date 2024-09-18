import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!localStorage.getItem(AuthUtils.accessTokenKey || !localStorage.getItem(AuthUtils.refreshTokenKey))) {
            return this.openNewRoute('/login');
        }

        this.logout().then();
    }

    async logout() {
        await HttpUtils.request('/logout', 'POST', false, {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey),
        });

        AuthUtils.removeAuthInfo();

        this.openNewRoute('/login');
    }
}