// src/config.js
const config = {
  // API URLs
  repoBaseUrl: "http://repo.ldev.cloudi.city:11000",
  approveBaseUrl: "http://approve.ldev.cloudi.city:11000",

  accountId: "a-dev-1009-0010-0003-5441",
  apiBaseUrls: {
      search: "http://search.ldev.cloudi.city:11000",
      iam: "http://iam.ldev.cloudi.city:11000",
      view: "http://view.ldev.cloudi.city:11000",
      approve: "http://approve.ldev.cloudi.city:11000"
  },

  // Sahil
//  repoId: "Hcpd89J8CRdiNpQ",
//  siteName: "intern-parth",

  //Avinash
  repoId: "Hcpd89J8AankZsi",
  siteName: "esko-interns",

  // Full paths used in API calls
  get organizationPath() {
    return `/rest/organizations/${this.repoId}`;
  },

  get sitePath() {
    return `${this.organizationPath}/sites/${this.siteName}`;
  }
};

export default config;