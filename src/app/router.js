import Vue from 'vue';
import Router from 'vue-router';

import NotFound from '~/shared/NotFound';
import BtnLink from '~/shared/BtnLink';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: BtnLink },

    /** @name crud-operations */
    { path: '/basic', component: () => import('~/crud-operations/basic/Basic') },
    { path: '/rest', component: () => import('~/crud-operations/rest/REST') },
    { path: '/graphql', component: () => import('~/crud-operations/graphql/GraphQL') },

    /** @name form-controls */
    {
      path: '/form-controls',
      component: () => import('~/form-controls/FormControls'),
      children: [
        { path: '', component: () => import('~/form-controls/BtnLink') },
        { path: 'template-driven', component: () => import('~/form-controls/template-driven/TemplateDriven') },
        { path: 'reactive', component: () => import('~/form-controls/reactive/Reactive') },
      ],
    },

    /** @name data-table */
    { path: '/data-table/basic', component: () => import('~/data-table/basic/Basic') },

    /** @name globalization */
    { path: '/i18n', component: () => import('~/globalization/i18n/I18n') },

    /** @name authorization */

    /** @name data-chart */

    /** @name realtime */

    /** @name playground */
    { path: '/counter', component: () => import('~/playground/counter/Counter') },

    { path: '*', component: NotFound },
  ],
});
