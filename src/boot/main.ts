import { boot } from 'quasar/wrappers';
import { useFlashStore } from 'src/stores/flashlight';

const Ble = useFlashStore();

/**
 * Navigation guard and permission verification
 * @param app
 * @param router
 * @param Vue
 * @param store
 * @returns {Promise<void>}
 */
export default boot(({ /* Vue, app, store */ router }) => {
  router.beforeEach((to, from, next) => {
    // Process TAGVIEW and breadcrumbs after successful login
    // handleTagViewAndBreadcrumbsAndKeepAlive(from, to, store, Vue)
    // Simulate obtaining token
    const token = sessionStorage.getItem('accessToken');
    const acl = sessionStorage.getItem('acl');
    // There is a token indicating that you have logged in
    if (token) {
      // You cannot access the login interface after logging in
      if (to.path === '/logon') {
        next({ path: '/dash-board' });
      }
      // There is user authority, and the route is not empty, then let go
      if (acl) {
        // if (acl && store.getters.getRoutes.length) {
        next();
      } else {
        // Simulate when user permissions do not exist, obtain user permissions
        // const acl = sessionStorage.getItem('acl');
        // And set the corresponding route according to the permissions
        // store.commit('SET_ROLES_AND_ROUTES', acl);
        // router.addRoutes(store.getters.getRoutes);
        // If addRoutes is not completed, the guard will execute it again
        next({ ...to, replace: true });
      }
    } else {
      if (to.path !== '/logon') {
        console.log('connected Ble devices: ', Ble.cntedDevLen);
        next();
        // next({ path: '/logon' })
      } else {
        next();
      }
    }
  });
});
