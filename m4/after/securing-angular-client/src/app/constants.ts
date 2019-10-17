export class Constants {
  
  // If you want to use Brian's Resource Server (RS) and Identity Provider - IdentityServer4 (AS) -- also called STS -- that he has setup in cloud
  public static apiRoot = 'https://securingangularappscourse-api.azurewebsites.net/api/';
  public static stsAuthority = "https://securingangularappscourse-sts.azurewebsites.net/";

  
  // If you want to use Brian's Resource Server (RS) and Identity Provider - IdentityServer4 (AS) that are in this Github as asp.net applications
  // public static apiRoot = 'http://localhost:2112/api/';
  // public static stsAuthority = 'http://localhost:4242/';

  // The reason for this is that Brian wanted to show that the oidc-client.js is a generic library that can be used with any Authorization
  // server that has implemented OIDC/Auth flows. So, he used Auth0 service as a replacement for IdentityServer4 and that is why he used the
  // line below.
  //public static stsAuthority = 'https://softinsight.auth0.com/';

  
  public static clientId = 'spa-client';
  //public static clientId = 'FVZYzaiuyFYR4bxPTtSriqNLgAE69Btn'; //softinsight

  // Angular app
  public static clientRoot = 'http://localhost:4200/';
}
