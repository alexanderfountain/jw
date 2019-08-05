import auth0 from "auth0-js"
import { navigate } from "gatsby"

const isBrowser = typeof window !== "undefined"

const auth = isBrowser
  ? new auth0.WebAuth({
      domain: 'fountain1986.auth0.com',
      clientID: 'd2HtbVJm1vlrRL4g4x82d1JPzL8ttXMN',
      redirectUri: 'https://jw-search.netlify.com/callback',
      responseType: "token id_token",
      scope: "openid profile email",
    })
  : {}



  const tokens = {
    accessToken: false,
    idToken: false,
    expiresAt: false,
  }
  
  let user = {}
  
  export const isAuthenticated = () => {
    if (!isBrowser) {
      return
    }
  
    return localStorage.getItem("isLoggedIn") === "true"
  }
  
  export const login = () => {
    if (!isBrowser) {
      return
    }
  
    auth.authorize()
  }
  
  const setSession = (cb = () => {}) => (err, authResult) => {
    if (err) {
      navigate("/")
      cb()
      return
    }
  
    if (authResult && authResult.accessToken && authResult.idToken) {
      let expiresAt = 600 * 1000 + new Date().getTime()
      if(!localStorage.getItem("expiresAt")){
        localStorage.setItem("expiresAt", expiresAt)
      }
      console.log(expiresAt)
      tokens.accessToken = authResult.accessToken
      tokens.idToken = authResult.idToken
      tokens.expiresAt = expiresAt
      user = authResult.idTokenPayload
      localStorage.setItem("isLoggedIn", true)
      navigate("/")
      cb()
    }
  }
  
  export const silentAuth = callback => {
    var expiresAt = localStorage.getItem("expiresAt");
    var now = new Date().getTime()
    console.log(expiresAt)
    if(expiresAt !== null){
      if(now > expiresAt){
        window.localStorage.removeItem('expiresAt')   
        logout()
        console.log('now: ' + now)
        console.log('local: ' + expiresAt)
      }
      else{
        if (!isAuthenticated()) return callback()
        auth.checkSession({}, setSession(callback))
      }
    }
    else{
      if (!isAuthenticated()) return callback()
      auth.checkSession({}, setSession(callback))
    }

  }
  
  export const handleAuthentication = () => {
    if (!isBrowser) {
      return
    }
  
    auth.parseHash(setSession())
  }
  
  export const getProfile = () => {
    return user
  }
  
  // export const logout = () => {
  //   localStorage.setItem("isLoggedIn", false)
  //   auth.logout()
  // }

  export const logout = () => {
    tokens.accessToken = false
    tokens.idToken = false
    user = {}
    localStorage.setItem("isLoggedIn", false)

    auth.logout({
      returnTo: 'https://jw-search.netlify.com',
    })
  }