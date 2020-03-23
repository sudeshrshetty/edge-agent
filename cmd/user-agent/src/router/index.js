/*
Copyright SecureKey Technologies Inc. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            name: "homepage",
            path: "/",
            component: () => import("@/views/Homepage")
        },
        {
            name: "storeVC",
            path: "/StoreVC",
            component: () => import("@/views/StoreVC")
        },
        {
            name: "getVC",
            path: "/GetVC",
            component: () => import("@/views/GetVC")
        },
        {
            name: "myVC",
            path: "/MyVC",
            component: () => import("@/views/MyVC")
        },
        {
            name: "registerWallet",
            path: "/RegisterWallet",
            component: () => import("@/views/RegisterWallet")
        },
        {
            name: "createDID",
            path: "/CreateDID",
            component: () => import("@/views/CreateDID")
        }
    ]
});
