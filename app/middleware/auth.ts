export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  if (!user && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
