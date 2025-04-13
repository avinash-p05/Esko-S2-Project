// src/config.js
const config = {
  // API URLs
  repoBaseUrl: "http://repo.ldev.cloudi.city:11000",
  approveBaseUrl: "http://approve.ldev.cloudi.city:11000",

  //avinash
  accountId: "a-dev-1009-0010-0003-5441",
//sahil
//  accountId: "a-dev-1001-0010-0009-3551",
  apiBaseUrls: {
      search: "http://search.ldev.cloudi.city:11000",
      iam: "http://iam.ldev.cloudi.city:11000",
      view: "http://view.ldev.cloudi.city:11000",
      approve: "http://approve.ldev.cloudi.city:11000"
  },

  // Sahil
//  repoId: "Hcpd89J8CsD9dQy",
//  siteName: "avinash-food",

  //Avinash
  repoId: "Hcpd89J8AankZsi",
  siteName: "test",

  // Full paths used in API calls
  get organizationPath() {
    return `/rest/organizations/${this.repoId}`;
  },

  get sitePath() {
    return `${this.organizationPath}/sites/${this.siteName}`;
  }
};

export default config;