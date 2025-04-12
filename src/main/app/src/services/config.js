// src/config.js
const config = {
  // API URLs
  repoBaseUrl: "http://repo.ldev.cloudi.city:11000",
  approveBaseUrl: "http://approve.ldev.cloudi.city:11000",

  // Organization/Repository Information
  repoId: "Hcpd89J8CRdiNpQ",
  siteName: "intern-parth",

  // Full paths used in API calls
  get organizationPath() {
    return `/rest/organizations/${this.repoId}`;
  },

  get sitePath() {
    return `${this.organizationPath}/sites/${this.siteName}`;
  }
};

export default config;