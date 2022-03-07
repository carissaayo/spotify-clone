import nextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
// import { refreshAccessToken } from "spotify-web-api-node/src/server-methods";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

const refreshAccessToken= async(token)=>{
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const {body:refreshedToken}= await spotifyApi.refreshAccessToken();
    console.log("refreshed token is",refreshedToken);
    return{
      ...token,
      accessToken:refreshedToken.access_token,
      accessTokenExpires:Date.now+refreshedToken.expires_in*1000,
      refreshToken:refreshedToken.refresh_token ?? token.refresh_token,
      // replace if new one came back else fall back to old refresh token
    }
  } catch (error) {
    console.log(error);
    return{
      ...token,
      error:"refreshAccessTokenError"
    }
  }
}

export default nextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret:process.env.JWT_SECRET,
  pages:{
    signIn:"/login"
  },
  callbacks:{
    async jwt({token,account,user}){
      // initial sign in
      if(account&&user){
        return{
          ...token,
          accessToken: account.access_token,
          refreshToken:account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires:account.expires_at*1000
        }
      }
      // Return previous token if the access token has not expired
      if(Date.now()< token.accessTokenExpires){
        return token;
      }
      // Access token has expired,so we need to refresh it .
      console.log("Access token has expired, refreshing");
      return await refreshAccessToken(token)
    },
    async session({session,token}){
      session.user.accessToken= token.accessToken;
      session.user.refreshToken= token.refreshToken;
      session.user.username = token.username
      return session;
    }
  },
});